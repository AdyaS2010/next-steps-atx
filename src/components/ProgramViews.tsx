import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { categoryLabels } from '../data/facts'
import { programs } from '../data/programs'
import { createTranslator } from '../lib/i18n'
import { toTelHref } from '../lib/format'
import { resourceFreshness } from '../lib/resource-quality'
import { callScript, phaseCopy } from '../lib/plan'
import { groupSteps } from '../lib/steps'
import { isReadAloudSupported, speak, stopSpeaking } from '../lib/voice'
import type { useSteps } from '../lib/steps'
import type { Language, Likelihood, Localized, Program } from '../types'

type Steps = ReturnType<typeof useSteps>

export function ProgramCard({ program, language, likelihood = 'info', reasons = [], missing = [], onOpen }: {
  program: Program
  language: Language
  likelihood?: Likelihood
  reasons?: Localized[]
  missing?: Localized[]
  onOpen: (id: string) => void
}) {
  const t = createTranslator(language)
  return <article className="program-card">
    <div className="card-meta"><span className="eyebrow">{categoryLabels[program.category][language]}</span><span className={`badge badge-${likelihood}`}>{t(likelihood)}</span></div>
    <h2>{program.name}</h2><p className="hint">{program.agency}</p><p>{program.provides[language]}</p>
    {reasons.length > 0 && <p className="hint">{reasons[0][language]}</p>}
    {(program.applicationStatus === 'waitlist' || program.applicationStatus === 'closed') &&
      <p className="hint"><strong>{t('status')}: {t(program.applicationStatus)}</strong></p>}
    {missing.length > 0 && <details><summary>{t('missing')} ({missing.length})</summary>
      <ul className="reason-list">{missing.map((reason, index) => <li key={index}>{reason[language]}</li>)}</ul>
    </details>}
    <button className="primary card-action" onClick={() => onOpen(program.id)} aria-label={`${t('details')}: ${program.name}`}>{t('details')}</button>
  </article>
}

export function ProgramDetail({ program, language, onClose, steps, returnFocus }: {
  program: Program
  language: Language
  onClose: () => void
  steps: Steps
  returnFocus?: HTMLElement | null
}) {
  const t = createTranslator(language)
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [reading, setReading] = useState(false)
  const [readError, setReadError] = useState(false)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => {
    const opener = returnFocus ?? document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return }
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,summary,[tabindex="0"]') ?? [])
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = oldOverflow
      document.removeEventListener('keydown', onKey)
      stopSpeaking()
      if (opener?.isConnected) opener.focus()
    }
  }, [returnFocus])
  const saved = steps.entries.some(entry => entry.programId === program.id)
  const freshness = resourceFreshness(program)
  const actionKind = program.actionKind ?? 'information'
  const actionKey = actionKind === 'apply' ? 'applyLink' : actionKind === 'referral' ? 'referralLink' : actionKind === 'appointment' ? 'appointmentLink' : 'informationLink'
  const read = () => {
    if (reading) { stopSpeaking(); setReading(false); return }
    setReadError(false); setReading(true)
    speak(`${program.name}. ${program.provides[language]}. ${program.eligibilitySummary[language]}`, language,
      () => setReading(false), () => { setReading(false); setReadError(true) })
  }
  return <div className="modal-backdrop">
    <div ref={dialog} className="program-dialog" role="dialog" aria-modal="true" aria-labelledby="program-title">
      <div className="dialog-toolbar"><button ref={closeButton} onClick={onClose}><X size={18} aria-hidden="true" />{t('close')}</button>
        {isReadAloudSupported() && <button onClick={read}>{t(reading ? 'stopRead' : 'read')}</button>}</div>
      <p className="eyebrow">{categoryLabels[program.category][language]}</p><h1 id="program-title">{program.name}</h1><p>{program.agency}</p>
      {readError && <p role="alert">{t('readError')}</p>}
      <div className="button-row">
        {program.applyOnlineUrl && <a className="button primary" href={program.applyOnlineUrl} target="_blank" rel="noreferrer">{t(actionKey)}</a>}
        {program.applyPhone && <a className="button" href={toTelHref(program.applyPhone)}>{t('call')} {program.applyPhone}</a>}
      </div>
      <h2>{t('provides')}</h2><p>{program.provides[language]}</p>
      <h2>{t('who')}</h2><p>{program.audience?.[language] ?? program.eligibilitySummary[language]}</p>
      <h2>{t('rules')}</h2><p>{program.eligibilitySummary[language]}</p>
      <div className="notice"><h2>{t('screening')}</h2><p>{program.screeningNote?.[language] ?? t('resultsNote')}</p></div>
      <dl className="detail-facts">
        <div><dt>{t('area')}</dt><dd>{program.serviceArea?.[language] ?? t('unknown')}</dd></div>
        <div><dt>{t('status')}</dt><dd>{t(program.applicationStatus === 'unknown' || !program.applicationStatus ? 'statusUnknown' : program.applicationStatus)}</dd>
          {program.statusNote && <dd>{program.statusNote[language]}</dd>}
          {program.availabilityVerifiedOn && <dd>{t('reviewed')}: <time dateTime={program.availabilityVerifiedOn}>{program.availabilityVerifiedOn}</time></dd>}</div>
        <div><dt>{t('action')}</dt><dd>{t(actionKind)}</dd></div>
      </dl>
      <h2>{t('steps')}</h2>
      <ol className="next-steps">{program.steps?.map(step => <li key={step.id}><strong>{step.title[language]}</strong><p>{step.detail[language]}</p></li>)}</ol>
      <CallPrep program={program} language={language} />
      {program.localHelp && <section><h2>{program.localHelp.name}</h2><p>{program.localHelp.address}</p><div className="button-row">
        {program.localHelp.phone && <a className="button" href={toTelHref(program.localHelp.phone)}>{t('call')} {program.localHelp.phone}</a>}
        {program.localHelp.url && <a className="button" href={program.localHelp.url} target="_blank" rel="noreferrer">{t('website')}</a>}
      </div></section>}
      <p className="hint">{t('accessUnknown')}</p>
      {program.documents.length > 0 && <details><summary>{t('documents')}</summary><ul>{program.documents.map((document, index) => <li key={index}>{document[language]}</li>)}</ul></details>}
      {program.notes && <p>{program.notes[language]}</p>}
      <div className="save-panel"><h2>{t('mySteps')}</h2><p>{t('saveDisclosure')}</p>
        <button className="primary" disabled={!steps.ready || saved} onClick={() => steps.saveProgram(program.id)}>{t(saved ? 'saved' : 'save')}</button>
        {steps.error && <p role="alert">{steps.error[language]}</p>}
      </div>
      <h2>{t('sources')}</h2>{program.reviewedOn && <p>{t('reviewed')}: {program.reviewedOn}</p>}
      {freshness !== 'current-review' && <p className="notice">{t(freshness === 'missing' ? 'sourceReviewMissing' : 'sourceReviewNeeded')}</p>}
      <p className="hint">{t('sourceReviewNote')}</p>
      <ul className="source-list">{program.sources?.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a><span>{t('reviewed')}: <time dateTime={source.checkedOn}>{source.checkedOn}</time></span></li>)}</ul>
    </div>
  </div>
}

export function MySteps({ language, steps, onOpen }: { language: Language; steps: Steps; onOpen: (id: string) => void }) {
  const t = createTranslator(language)
  const [confirmClear, setConfirmClear] = useState(false)
  const groups = groupSteps(steps.entries)
  const next = nextOpenStep(groups.flatMap(group => group.entries))
  const nextProgram = next ? programs.find(program => program.id === next.programId) : undefined
  const nextStep = nextProgram?.steps?.find(step => step.id === next?.stepId)
  const download = () => {
    const blob = new Blob([steps.exportText(language)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = language === 'en' ? 'my-support-plan.txt' : 'mi-plan-de-apoyo.txt'
    anchor.click(); URL.revokeObjectURL(url)
  }
  // Collapsed services still print in full.
  const print = () => {
    document.querySelectorAll<HTMLDetailsElement>('.saved-program').forEach(item => { item.open = true })
    window.print()
  }
  return <section className="steps-page"><h1>{t('mySteps')}</h1>
    {steps.error && <p role="alert">{steps.error[language]}</p>}
    {confirmClear && <div className="notice no-print" role="region" aria-label={t('clearPlan')}>
      <p>{t('clearPlanConfirm')}</p><div className="button-row">
        <button onClick={() => { steps.clear(); setConfirmClear(false) }}>{t('confirmDelete')}</button>
        <button onClick={() => setConfirmClear(false)}>{t('cancelDelete')}</button>
      </div>
    </div>}
    {!steps.ready ? (steps.error ? <button onClick={() => setConfirmClear(true)}>{t('clearPlan')}</button> : <p role="status">{t('loading')}</p>) : steps.entries.length === 0 ? <p className="empty-state">{t('emptySteps')}</p> : <>
      <div className="steps-summary">
        <StepsProgress language={language} entries={steps.entries} />
        {next && nextProgram && nextStep ? <div className="next-up-card">
          <p className="eyebrow">{t('yourNextStep')} · {nextProgram.name}</p>
          <h2>{nextStep.title[language]}</h2>
          <p>{nextStep.detail[language]}</p>
          <div className="button-row">
            <button className="primary" onClick={() => steps.toggleStep(next.programId, next.stepId)}><Check size={18} aria-hidden="true" />{t('markDone')}</button>
            {nextProgram.applyPhone && <a className="button" href={toTelHref(nextProgram.applyPhone)}>{t('call')} {nextProgram.applyPhone}</a>}
            {nextProgram.applyOnlineUrl && <a className="button" href={nextProgram.applyOnlineUrl} target="_blank" rel="noreferrer">{t('website')}</a>}
          </div>
        </div> : <p className="next-up-card" role="status">{t('allDone')}</p>}
      </div>
      {groups.map(group => {
        const total = group.entries.reduce((sum, entry) => sum + (programs.find(program => program.id === entry.programId)?.steps?.length ?? 0), 0)
        const done = group.entries.reduce((sum, entry) => sum + entry.completed.length, 0)
        return <section className="steps-phase" key={group.phase} aria-labelledby={`saved-${group.phase}`}>
          <div className={`steps-phase-heading plan-phase-${group.phase}`}>
            <h2 id={`saved-${group.phase}`}>{phaseCopy[group.phase].title[language]}</h2>
            <span className="phase-count">{done} / {total} {t('progress')}</span>
          </div>
          {group.entries.map(entry => {
            const program = programs.find(item => item.id === entry.programId)
            if (!program) return null
            const count = program.steps?.length ?? 0
            const complete = count > 0 && entry.completed.length >= count
            return <details className="saved-program plan-card" key={program.id} open={next?.programId === program.id}>
              <summary>
                <span className={`saved-status${complete ? ' done' : ''}`} aria-hidden="true">{complete ? <Check size={16} /> : `${entry.completed.length}/${count}`}</span>
                <h3>{program.name}</h3>
                <span className="visually-hidden">{entry.completed.length} / {count} {t('progress')}</span>
              </summary>
              <div className="saved-body">
                <p className="hint">{program.provides[language]}</p>
                {program.steps?.map(step => <label className={`check-step${next?.stepId === step.id && next.programId === program.id ? ' check-step-next' : ''}`} key={step.id}>
                  <input type="checkbox" checked={entry.completed.includes(step.id)} onChange={() => steps.toggleStep(program.id, step.id)} />
                  <span>{next?.stepId === step.id && next.programId === program.id && <em className="next-badge">{t('nextUp')}</em>}<strong>{step.title[language]}</strong><span>{step.detail[language]}</span></span>
                </label>)}
                <div className="button-row">
                  {program.applyPhone && <a className="button" href={toTelHref(program.applyPhone)}>{t('call')} {program.applyPhone}</a>}
                  {program.applyOnlineUrl && <a className="button" href={program.applyOnlineUrl} target="_blank" rel="noreferrer">{t('website')}</a>}
                  <button className="no-print" onClick={() => onOpen(program.id)}>{t('details')}</button>
                  <button className="text-button no-print" onClick={() => steps.removeProgram(program.id)}>{t('remove')}</button>
                </div>
              </div>
            </details>
          })}
        </section>
      })}
      <div className="button-row no-print steps-tools"><button onClick={print}>{t('print')}</button><button onClick={download}>{t('download')}</button><button className="text-button" onClick={() => setConfirmClear(true)}>{t('clearPlan')}</button></div>
      <p className="hint">{t('planNote')} {t('saveDisclosure')}</p>
    </>}
  </section>
}

function nextOpenStep(entries: Steps['entries']): { programId: string; stepId: string } | null {
  for (const entry of entries) {
    const step = programs.find(program => program.id === entry.programId)?.steps?.find(item => !entry.completed.includes(item.id))
    if (step) return { programId: entry.programId, stepId: step.id }
  }
  return null
}

function StepsProgress({ language, entries }: { language: Language; entries: Steps['entries'] }) {
  const t = createTranslator(language)
  const total = entries.reduce((sum, entry) => sum + (programs.find(program => program.id === entry.programId)?.steps?.length ?? 0), 0)
  const done = entries.reduce((sum, entry) => sum + entry.completed.length, 0)
  if (!total) return null
  return <div className="steps-progress">
    <p><strong>{done} / {total}</strong> {t('progress')}</p>
    <progress max={total} value={done} aria-label={`${done} / ${total} ${t('progress')}`} />
  </div>
}

function CallPrep({ program, language }: { program: Program; language: Language }) {
  const t = createTranslator(language)
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle')
  const script = callScript(program, language)
  const copyScript = async () => {
    try { await navigator.clipboard.writeText(script); setCopy('copied') } catch { setCopy('failed') }
  }
  return <details className="call-prep"><summary>{t('callPrep')}</summary>
    <p className="hint">{t('callPrepIntro')}</p>
    <pre className="call-script">{script}</pre>
    <button onClick={copyScript}>{t(copy === 'copied' ? 'copied' : 'copyScript')}</button>
    {copy === 'failed' && <p role="alert">{t('copyFailed')}</p>}
  </details>
}
