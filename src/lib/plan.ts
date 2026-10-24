import type { Household, Localized, Program } from '../types'
import type { Recommendation } from './eligibility'

/**
 * Turns ranked recommendations into a sequenced, explainable action plan.
 * Phases describe a suggested order of effort (stabilize first, then apply,
 * then build), never a deadline set by an agency or an eligibility decision.
 */
export type Phase = 'now' | 'week' | 'month'
export const phases: Phase[] = ['now', 'week', 'month']

export type PlanItem = {
  program: Program
  phase: Phase
  why: Localized
  firstStep?: { id: string; title: Localized; detail: Localized }
}

export type ActionPlan = {
  items: Record<Phase, PlanItem[]>
  /** Unique document reminders across every planned program. */
  documents: Localized[]
  total: number
}

export const phaseCopy: Record<Phase, { title: Localized; intro: Localized }> = {
  now: {
    title: { en: 'Today: get steady', es: 'Hoy: estabilizarse' },
    intro: { en: 'Safety, a place to stay, food, and anything with a court or crisis deadline come first.', es: 'Primero la seguridad, un lugar para quedarse, la comida y todo lo que tenga un plazo judicial o de crisis.' },
  },
  week: {
    title: { en: 'This week: apply', es: 'Esta semana: solicitar' },
    intro: { en: 'Benefits and appointments that take a few days to process. Waitlists are here because joining early matters.', es: 'Beneficios y citas que tardan unos días. Las listas de espera están aquí porque inscribirse pronto importa.' },
  },
  month: {
    title: { en: 'This month: build ahead', es: 'Este mes: avanzar' },
    intro: { en: 'Training, coaching, and longer-term support that help keep things stable.', es: 'Capacitación, asesoría y apoyo a largo plazo que ayudan a mantener la estabilidad.' },
  },
}

const urgentIds = new Set([
  'safe-alliance', 'mental-health-crisis', 'volunteer-legal-services', 'emergency-shelter', 'coordinated-entry',
  'food-bank', 'rental-help', 'eviction-legal-info', 'diaper-bank', 'homeless-document-help',
  'emancipet-free-days', 'ahs-pet-pantry',
])
const buildIds = new Set([
  'career-training', 'adult-education', 'financial-coaching', 'free-tax-prep',
  'acc-basic-needs', 'public-library', 'property-tax', 'medicare-counseling',
  'independent-living', 'vocational-rehabilitation', 'immigrant-support',
])

const reasons = {
  urgent: { en: 'Addresses an immediate need: food, safety, shelter, or a legal deadline.', es: 'Atiende una necesidad inmediata: comida, seguridad, refugio o un plazo legal.' },
  crisisHousing: { en: 'You said you do not have a stable place to stay, so housing help comes first.', es: 'Indicó que no tiene un lugar estable, así que la vivienda va primero.' },
  waitlist: { en: 'Has a waitlist. Joining early can shorten the wait.', es: 'Tiene lista de espera. Inscribirse pronto puede acortar la espera.' },
  apply: { en: 'An application or appointment that usually takes days to process.', es: 'Una solicitud o cita que suele tardar días en procesarse.' },
  claim: { en: 'You reported losing work. TWC says an unemployment claim starts the week you apply, so waiting can cost benefits.', es: 'Indicó que perdió su trabajo. TWC indica que el reclamo empieza la semana en que solicita; esperar puede costarle beneficios.' },
  job: { en: 'You reported losing work. Job services work best when started early.', es: 'Indicó que perdió su trabajo. Los servicios de empleo funcionan mejor si empieza pronto.' },
  build: { en: 'Longer-term support that builds income, skills, or savings.', es: 'Apoyo a largo plazo para aumentar ingresos, habilidades o ahorros.' },
  info: { en: 'A place to get information or a referral when you have a moment.', es: 'Un lugar para obtener información o una referencia cuando tenga un momento.' },
} satisfies Record<string, Localized>

export function phaseFor(program: Program, household: Household): { phase: Phase; why: Localized } {
  if (household.isHomeless === true && program.category === 'housing') return { phase: 'now', why: reasons.crisisHousing }
  if (urgentIds.has(program.id)) return { phase: 'now', why: reasons.urgent }
  if (household.isUnemployed === true && program.id === 'unemployment') return { phase: 'now', why: reasons.claim }
  if (buildIds.has(program.id) || program.category === 'education' || program.category === 'financial') return { phase: 'month', why: reasons.build }
  if (program.applicationStatus === 'waitlist') return { phase: 'week', why: reasons.waitlist }
  if (household.isUnemployed === true && program.id === 'job-search') return { phase: 'week', why: reasons.job }
  if (program.actionKind === 'apply' || program.actionKind === 'appointment') return { phase: 'week', why: reasons.apply }
  return { phase: 'month', why: reasons.info }
}

const PER_PHASE = 4

/** Audience-specific programs join the plan only when the person confirmed that audience. */
function audienceConfirmed(program: Program, household: Household): boolean {
  const all = program.requiresAll ?? []
  const any = program.requiresAny ?? []
  if (!all.length && !any.length) return true
  return all.every(flag => household[flag] === true) && (!any.length || any.some(flag => household[flag] === true))
}

/** Builds a plan from ranked results. Unlikely, closed and unconfirmed-audience matches are left out. */
export function buildActionPlan(recommendations: Recommendation[], household: Household): ActionPlan {
  const items: Record<Phase, PlanItem[]> = { now: [], week: [], month: [] }
  for (const { program, likelihood } of recommendations) {
    if (likelihood === 'unlikely' || program.applicationStatus === 'closed' || !audienceConfirmed(program, household)) continue
    const { phase, why } = phaseFor(program, household)
    if (items[phase].length >= PER_PHASE) continue
    items[phase].push({ program, phase, why, firstStep: program.steps?.[0] })
  }
  const seen = new Set<string>()
  const documents: Localized[] = []
  for (const phase of phases) {
    for (const { program } of items[phase]) {
      for (const document of program.documents) {
        if (seen.has(document.en)) continue
        seen.add(document.en)
        documents.push(document)
      }
    }
  }
  return { items, documents, total: phases.reduce((sum, phase) => sum + items[phase].length, 0) }
}

/** Questions to ask on a first call, for any provider. */
export const callQuestions: Localized[] = [
  { en: 'Are you taking new applications or requests right now?', es: '¿Están recibiendo solicitudes nuevas en este momento?' },
  { en: 'Is my address in your service area?', es: '¿Mi dirección está en su área de servicio?' },
  { en: 'Which documents should I bring or send, and what can I use if I do not have one?', es: '¿Qué documentos debo llevar o enviar, y qué puedo usar si no tengo alguno?' },
  { en: 'How long does it usually take to hear back, and how will you contact me?', es: '¿Cuánto tardan en responder y cómo me contactarán?' },
  { en: 'Can I get help in my language?', es: '¿Pueden atenderme en mi idioma?' },
  { en: 'If this program is not a fit, who else should I contact?', es: 'Si este programa no me corresponde, ¿a quién más debo llamar?' },
]

export function callScript(program: Program, language: 'en' | 'es'): string {
  const opening = language === 'en'
    ? `Hi, I'm calling about ${program.name}. I'd like to find out whether it could help my household and how to get started.`
    : `Hola, llamo por ${program.name}. Quisiera saber si podría ayudar a mi hogar y cómo empezar.`
  const questions = callQuestions.map((question, index) => `${index + 1}. ${question[language]}`)
  const notes = language === 'en'
    ? 'Write down: the date, the name of the person you spoke with, what they said, and your next step.'
    : 'Anote: la fecha, el nombre de la persona, lo que le dijeron y su próximo paso.'
  return [opening, ...questions, notes].join('\n')
}
