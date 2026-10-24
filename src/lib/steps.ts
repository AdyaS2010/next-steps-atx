import { useMemo, useState, useSyncExternalStore } from 'react'
import { programs } from '../data/programs'
import type { Language, Localized } from '../types'
import { localize } from './format'
import { emptyHousehold } from './eligibility'
import { phaseFor, phases, phaseCopy, type Phase } from './plan'

export const STEPS_KEY = 'austin-benefits:steps:v1'
const CHANGE_EVENT = 'austin-benefits:steps-change'
const UNAVAILABLE = '__unavailable__'
const SERVER = '__loading__'
export type SavedSteps = { programId: string; completed: string[] }
type StepRecord = { version: 1; entries: SavedSteps[] }

const errors = {
  unavailable: {
    en: 'Browser storage is unavailable. You can still browse and print guidance, but saved steps cannot be read here.',
    es: 'El almacenamiento del navegador no está disponible. Puede consultar e imprimir la guía, pero no leer los pasos guardados.',
  },
  corrupt: {
    en: 'Saved steps could not be read. They have not been overwritten. You can explicitly clear this plan to start again.',
    es: 'No se pudieron leer los pasos guardados. No se han sobrescrito. Puede borrar este plan para empezar de nuevo.',
  },
  save: {
    en: 'This change was not saved. Storage may be full, blocked, or changed in another tab.',
    es: 'No se guardó este cambio. El almacenamiento puede estar lleno, bloqueado o haber cambiado en otra pestaña.',
  },
} satisfies Record<string, Localized>

export function parseSteps(raw: string | null): StepRecord {
  if (raw === null) return { version: 1, entries: [] }
  const value: unknown = JSON.parse(raw)
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
      !('entries' in value) || !Array.isArray(value.entries) || value.entries.length > 80 ||
      Object.keys(value).some(key => !['version', 'entries'].includes(key))) {
    throw new Error('Unsupported steps record')
  }
  const entries: SavedSteps[] = []
  for (const item of value.entries) {
    if (!item || typeof item !== 'object' ||
        typeof item.programId !== 'string' || !Array.isArray(item.completed) ||
        item.completed.length > 40 || item.completed.some((step: unknown) => typeof step !== 'string') ||
        Object.keys(item).some(key => !['programId', 'completed'].includes(key))) {
      throw new Error('Invalid saved steps')
    }
    const program = programs.find(program => program.id === item.programId)
    if (!program || entries.some(entry => entry.programId === item.programId) ||
        new Set(item.completed).size !== item.completed.length ||
        item.completed.some((id: string) => !program.steps?.some(step => step.id === id))) {
      throw new Error('Saved steps refer to unavailable content')
    }
    entries.push({ programId: item.programId, completed: [...item.completed] })
  }
  return { version: 1, entries }
}

function subscribe(listener: () => void) {
  window.addEventListener('storage', listener)
  window.addEventListener(CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener('storage', listener)
    window.removeEventListener(CHANGE_EVENT, listener)
  }
}

function snapshot() {
  try {
    return window.localStorage.getItem(STEPS_KEY) ?? ''
  } catch {
    return UNAVAILABLE
  }
}

/** Saved entries grouped by plan phase, keeping save order within each phase. */
export function groupSteps(entries: SavedSteps[]): { phase: Phase; entries: SavedSteps[] }[] {
  const neutral = emptyHousehold()
  const phaseOf = (entry: SavedSteps) => {
    const program = programs.find(item => item.id === entry.programId)
    return program ? phaseFor(program, neutral).phase : 'month'
  }
  return phases.map(phase => ({ phase, entries: entries.filter(entry => phaseOf(entry) === phase) })).filter(group => group.entries.length)
}

export function planText(entries: SavedSteps[], language: Language): string {
  const heading = language === 'en' ? 'My next steps - Next Steps ATX (Austin Benefits Navigator)' : 'Mis próximos pasos - Next Steps ATX (Navegador de beneficios de Austin)'
  const blocks = groupSteps(entries).flatMap(group => [`== ${localize(phaseCopy[group.phase].title, language)} ==`, ...group.entries.map(entry => {
    const program = programs.find(program => program.id === entry.programId)
    if (!program) throw new Error('A selected program is no longer in the catalog')
    const steps = (program.steps ?? []).map(step => `${entry.completed.includes(step.id) ? '[x]' : '[ ]'} ${localize(step.title, language)}\n${localize(step.detail, language)}`)
    return [
      program.name, localize(program.provides, language),
      program.serviceArea ? localize(program.serviceArea, language) : '',
      ...steps, program.applyPhone ?? '', program.applyOnlineUrl ?? '',
      ...(program.sources ?? []).map(source => `${source.label}: ${source.url} (${source.checkedOn})`),
    ].filter(Boolean).join('\n')
  })])
  const note = language === 'en'
    ? 'This checklist does not submit an application. Confirm current requirements and availability with each provider. No household answers are included.'
    : 'Esta lista no envía una solicitud. Confirme los requisitos y la disponibilidad con cada proveedor. No incluye respuestas sobre su hogar.'
  return [heading, ...blocks, note].join('\n\n')
}

export function useSteps() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => SERVER)
  const [writeError, setWriteError] = useState<Localized | null>(null)
  const state = useMemo(() => {
    if (raw === SERVER) return { entries: [] as SavedSteps[], ready: false, corrupt: false, error: null }
    if (raw === UNAVAILABLE) return { entries: [] as SavedSteps[], ready: false, corrupt: false, error: errors.unavailable }
    try {
      return { entries: parseSteps(raw || null).entries, ready: true, corrupt: false, error: null }
    } catch {
      return { entries: [] as SavedSteps[], ready: false, corrupt: true, error: errors.corrupt }
    }
  }, [raw])

  function change(update: (entries: SavedSteps[]) => SavedSteps[], reset = false) {
    try {
      const latest = window.localStorage.getItem(STEPS_KEY)
      const entries = reset ? [] : parseSteps(latest).entries
      const next = JSON.stringify({ version: 1, entries: update(entries) })
      parseSteps(next)
      if (window.localStorage.getItem(STEPS_KEY) !== latest) throw new Error('The plan changed')
      window.localStorage.setItem(STEPS_KEY, next)
      setWriteError(null)
      window.dispatchEvent(new Event(CHANGE_EVENT))
    } catch {
      setWriteError(errors.save)
    }
  }

  return {
    ...state,
    error: state.error ?? writeError,
    saveProgram: (programId: string) => change(entries => entries.some(entry => entry.programId === programId)
      ? entries : [...entries, { programId, completed: [] }]),
    savePrograms: (programIds: string[]) => change(entries => [
      ...entries,
      ...[...new Set(programIds)].filter(id => !entries.some(entry => entry.programId === id)).map(programId => ({ programId, completed: [] })),
    ]),
    removeProgram: (programId: string) => change(entries => entries.filter(entry => entry.programId !== programId)),
    toggleStep: (programId: string, stepId: string) => change(entries => {
      if (!entries.some(entry => entry.programId === programId)) throw new Error('Save the program before changing its steps')
      return entries.map(entry => entry.programId !== programId ? entry : {
        ...entry, completed: entry.completed.includes(stepId)
          ? entry.completed.filter(id => id !== stepId) : [...entry.completed, stepId],
      })
    }),
    clear: () => change(() => [], true),
    exportText: (language: Language) => planText(state.entries, language),
  }
}
