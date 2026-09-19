import type { BenefitCategory, Household, HouseholdFlag, Likelihood, Localized, Program } from '../types'
import type { NavigatorSignal } from './navigator'

/**
 * U.S. Federal Poverty Guidelines (48 contiguous states), annual dollars by
 * household size. 2026 figures (issued January 2026); update each January when
 * HHS publishes new guidelines. Source: https://aspe.hhs.gov/poverty-guidelines
 */
export const FPL_2026: Record<number, number> = {
  1: 15960,
  2: 21640,
  3: 27320,
  4: 33000,
  5: 38680,
  6: 44360,
  7: 50040,
  8: 55720,
}
const FPL_INCREMENT = 5680

export function annualFpl(size: number): number
export function annualFpl(size: number | null): number | null
export function annualFpl(size: number | null): number | null {
  if (size === null) return null
  if (!Number.isSafeInteger(size) || size < 1) throw new RangeError('Household size must be a positive integer.')
  const value = size <= 8 ? FPL_2026[size] : FPL_2026[8] + (size - 8) * FPL_INCREMENT
  if (!Number.isSafeInteger(value)) throw new RangeError('Household size is too large.')
  return value
}

/** A household's annual income as a percent of the Federal Poverty Level. */
export function percentOfFpl(monthlyIncome: number, size: number): number
export function percentOfFpl(monthlyIncome: number | null, size: number | null): number | null
export function percentOfFpl(monthlyIncome: number | null, size: number | null): number | null {
  const fpl = annualFpl(size)
  if (monthlyIncome !== null && (!Number.isFinite(monthlyIncome) || monthlyIncome < 0 || !Number.isFinite(monthlyIncome * 1200))) {
    throw new RangeError('Monthly income must be a finite, nonnegative amount.')
  }
  if (monthlyIncome === null || fpl === null) return null
  return Math.round(((monthlyIncome * 12) / fpl) * 100)
}

const factLabels: Record<HouseholdFlag, Localized> = {
  hasChildrenUnder18: { en: 'children under 18', es: 'menores de 18 años' },
  hasChildUnder5OrPregnant: { en: 'pregnancy or a child under 5', es: 'embarazo o un menor de 5 años' },
  hasSenior60Plus: { en: 'a household member age 60 or older', es: 'una persona de 60 años o más en el hogar' },
  hasDisability: { en: 'a household member with a disability', es: 'una persona con discapacidad en el hogar' },
  isVeteranHousehold: { en: 'a veteran in the household', es: 'un veterano en el hogar' },
  isUninsured: { en: 'someone without health insurance', es: 'alguien sin seguro médico' },
  isUnemployed: { en: 'unemployment or qualifying loss of work', es: 'desempleo o pérdida de trabajo que cumpla los requisitos' },
  isRenter: { en: 'renting a home', es: 'alquilar una vivienda' },
  isImmigrantOrNewcomer: { en: 'an immigrant or newcomer in the household', es: 'una persona inmigrante o recién llegada en el hogar' },
  isStudent: { en: 'student status', es: 'ser estudiante' },
  isHomeowner: { en: 'home ownership', es: 'ser propietario de una vivienda' },
  isCaregiver: { en: 'caregiving responsibilities', es: 'responsabilidades de cuidado' },
  isHomeless: { en: 'housing instability or homelessness', es: 'inestabilidad de vivienda o falta de hogar' },
  needsTransportation: { en: 'a transportation need', es: 'necesidad de transporte' },
  hasChildUnder13: { en: 'a child under 13 (ask about disability-related age exceptions)', es: 'un menor de 13 años (pregunte por excepciones de edad por discapacidad)' },
  isWorkingOrTraining: { en: 'work, education, or qualifying training', es: 'trabajo, estudios o capacitación que cumpla los requisitos' },
}

const contextualChecks: Record<string, Localized[]> = {
  snap: [
    { en: 'Confirm the SNAP household: people who buy and prepare food together, plus required family members; it may differ from everyone at this address.', es: 'Confirme el hogar de SNAP: quienes compran y preparan alimentos juntos y los familiares obligatorios; puede ser distinto de todas las personas de esta dirección.' },
    { en: 'HHSC must review countable income, allowed deductions, expenses, and applicable work rules; gross income alone cannot decide SNAP eligibility.', es: 'HHSC debe revisar los ingresos contables, las deducciones permitidas, los gastos y las reglas laborales aplicables; los ingresos brutos no determinan por sí solos la elegibilidad para SNAP.' },
  ],
  map: [
    { en: 'Central Health must confirm that the applicant is uninsured, lives in Travis County, and meets current MAP or MAP Basic income rules.', es: 'Central Health debe confirmar que la persona no tenga seguro, viva en el condado de Travis y cumpla las reglas actuales de ingresos de MAP o MAP Basic.' },
  ],
  'healthy-texas-women': [
    { en: 'Confirm the applicant’s age, program criteria for women, pregnancy status, insurance, residency and other current requirements. Low income alone is not enough.', es: 'Confirme la edad, los criterios del programa para mujeres, el embarazo, el seguro, la residencia y los demás requisitos actuales. Tener bajos ingresos no basta.' },
  ],
  'child-care': [
    { en: 'Confirm each child’s age and any disability-related exceptions, parents’ work/training/education hours, service area, and the current State Median Income (SMI) limit—not a generic FPL percentage. Ask about the waitlist.', es: 'Confirme las edades y excepciones por discapacidad, las horas de trabajo/capacitación/estudios de los padres, el área de servicio y el límite actual del ingreso mediano estatal (SMI), no un porcentaje genérico del nivel de pobreza. Pregunte por la lista de espera.' },
  ],
  tanf: [
    { en: 'HHSC must check the eligible family group, countable income, assets, work participation hours and exemptions, and other TANF rules. These details are not established here.', es: 'HHSC debe revisar el grupo familiar elegible, los ingresos contables, los bienes, las horas de participación laboral, las exenciones y otras reglas de TANF. Aquí no se han confirmado esos detalles.' },
  ],
  unemployment: [
    { en: 'TWC must check work history and base-period wages, the reason work ended or hours were reduced, and ability/availability for work. Being unemployed does not guarantee benefits.', es: 'TWC debe revisar el historial laboral y los salarios del período base, la razón de la pérdida de empleo o reducción de horas y la capacidad/disponibilidad para trabajar. Estar desempleado no garantiza beneficios.' },
  ],
  wic: [
    { en: 'WIC must confirm pregnancy/postpartum status or the child’s age, nutrition assessment, residency, and income or qualifying enrollment in another program.', es: 'WIC debe confirmar el embarazo/posparto o la edad del menor, la evaluación nutricional, la residencia y los ingresos o la inscripción en otro programa que cumpla los requisitos.' },
  ],
  chip: [
    { en: 'Confirm the child’s age, insurance, household income group, residency, and current CHIP or Medicaid rules with HHSC.', es: 'Confirme con HHSC la edad del menor, el seguro, el grupo familiar para ingresos, la residencia y las reglas actuales de CHIP o Medicaid.' },
  ],
  'head-start': [
    { en: 'Confirm the child’s age, service area, income or categorical eligibility, and enrollment openings with the provider.', es: 'Confirme con el proveedor la edad del menor, el área de servicio, los ingresos o la elegibilidad por categoría y los cupos disponibles.' },
  ],
}

export type Recommendation = {
  program: Program
  likelihood: Likelihood
  reasons: Localized[]
  missing: Localized[]
}

function assessProgram(program: Program, household: Household): Recommendation {
  const reasons: Localized[] = []
  const missing: Localized[] = []
  let mismatch = false
  const all = [...(program.requiresAll ?? [])]
  // Also protect older catalog records that predate explicit metadata.
  if (program.id === 'map' && !all.includes('isUninsured')) all.push('isUninsured')
  const any = program.requiresAny ?? []
  for (const flag of all) {
    const label = factLabels[flag]
    if (household[flag] === false) {
      mismatch = true
      reasons.push({ en: `Your stated facts do not match this required detail: ${label.en}.`, es: `Sus datos no coinciden con este requisito: ${label.es}.` })
    } else if (household[flag] !== true) {
      missing.push({ en: `Confirm: ${label.en}.`, es: `Confirme: ${label.es}.` })
    } else {
      reasons.push({ en: `You reported ${label.en}, which matches a listed audience.`, es: `Usted indicó ${label.es}, lo que coincide con un grupo atendido.` })
    }
  }
  if (any.length > 0) {
    const match = any.find((flag) => household[flag] === true)
    if (match) {
      reasons.push({ en: `You reported ${factLabels[match].en}, which matches a listed audience.`, es: `Usted indicó ${factLabels[match].es}, lo que coincide con un grupo atendido.` })
    } else if (any.every((flag) => household[flag] === false)) {
      mismatch = true
      reasons.push({ en: 'Your stated facts do not match any of the listed household requirements.', es: 'Sus datos no coinciden con ninguno de los requisitos del hogar indicados.' })
    } else {
      missing.push({
        en: `Confirm whether any apply: ${any.filter((flag) => household[flag] !== false).map((flag) => factLabels[flag].en).join('; ')}.`,
        es: `Confirme si alguno corresponde: ${any.filter((flag) => household[flag] !== false).map((flag) => factLabels[flag].es).join('; ')}.`,
      })
    }
  }
  if (program.jurisdiction === 'travis' || program.id === 'map') {
    if (household.county === 'other') {
      mismatch = true
      reasons.push({ en: 'This service requires Travis County residence; you selected another county.', es: 'Este servicio requiere residencia en el condado de Travis; usted seleccionó otro condado.' })
    } else if (household.county !== 'travis') {
      missing.push({ en: 'Confirm whether you live in Travis County. A ZIP code alone does not establish county residence.', es: 'Confirme si vive en el condado de Travis. Un código postal por sí solo no establece el condado de residencia.' })
    }
  } else if (program.jurisdiction === 'austin' || program.jurisdiction === 'regional') {
    missing.push({ en: 'Confirm that your address is in this provider’s service area; county or ZIP alone is not sufficient.', es: 'Confirme que su dirección esté en el área de servicio del proveedor; el condado o código postal por sí solo no basta.' })
  }

  if (program.fplLimit !== undefined) {
    if (household.size === null) missing.push({ en: 'Confirm the household size used by this program.', es: 'Confirme el tamaño del hogar que utiliza este programa.' })
    if (household.monthlyIncome === null) missing.push({ en: 'Confirm monthly household income before taxes and which income this program counts.', es: 'Confirme los ingresos mensuales del hogar antes de impuestos y cuáles cuenta este programa.' })
    missing.push({ en: 'Income screening needs agency review. A listed FPL percentage is only a reference, not an eligibility cutoff in this navigator.', es: 'La agencia debe revisar los ingresos. El porcentaje del nivel de pobreza indicado es solo una referencia, no un límite de elegibilidad en este navegador.' })
  }
  missing.push(...(contextualChecks[program.id] ?? []))
  if (program.screeningNote) missing.push(program.screeningNote)
  if (program.applicationStatus && program.applicationStatus !== 'accepting') {
    missing.push(program.statusNote ?? { en: 'Confirm current application availability, funding, and waitlists before making a trip.', es: 'Confirme la disponibilidad de solicitudes, los fondos y las listas de espera antes de viajar.' })
  }
  if (reasons.length === 0) {
    reasons.push({ en: 'This resource addresses the selected need; a match is not an approval or a guarantee of help.', es: 'Este recurso atiende la necesidad seleccionada; una coincidencia no es aprobación ni garantía de ayuda.' })
  }
  if (program.alwaysShow || program.actionKind === 'information' || program.actionKind === 'referral') {
    reasons.push({ en: 'General information or referral; this does not mean eligibility or an available opening.', es: 'Información general o referencia; no significa elegibilidad ni un cupo disponible.' })
    return { program, likelihood: 'info', reasons, missing }
  }
  if (!all.length && !any.length && missing.length === 0) {
    missing.push({ en: 'Confirm this program’s current eligibility requirements and availability with the provider.', es: 'Confirme con el proveedor los requisitos actuales de elegibilidad y la disponibilidad del programa.' })
  }
  return { program, likelihood: mismatch ? 'unlikely' : missing.length ? 'maybe' : 'likely', reasons, missing }
}

/** Labels describe relevance and uncertainty, never an eligibility determination. */
export function evaluateProgram(program: Program, household: Household): Likelihood {
  return assessProgram(program, household).likelihood
}

const order: Record<Likelihood, number> = { likely: 0, maybe: 1, info: 2, unlikely: 3 }

export type ScreenedProgram = { program: Program; likelihood: Likelihood }

/** Screen every program and sort best matches first (unlikely ones last). */
export function screenPrograms(programs: Program[], household: Household): ScreenedProgram[] {
  return programs
    .map((program) => ({ program, likelihood: evaluateProgram(program, household) }))
    .sort((a, b) => {
      const rank = order[a.likelihood] - order[b.likelihood]
      if (rank !== 0) return rank
      return a.program.name.localeCompare(b.program.name)
    })
}

// Starting points for the stated need, not eligibility or live-availability claims.
// Career training also addresses income needs although its catalog category is education.
const needStarters: Partial<Record<BenefitCategory, string[]>> = {
  food: ['food-bank'],
  health: ['communitycare', 'insure-central-texas'],
  transportation: ['capmetro-transit', 'capmetro-pickup'],
  income: ['job-search', 'career-training'],
  pets: ['emancipet-clinics', 'emancipet-free-days', 'apa-pass'],
}

/** The UI owns the result limit. Explicitly selected needs take precedence over text. */
export function rankRecommendations(programs: Program[], household: Household, signal?: NavigatorSignal): Recommendation[] {
  if (signal?.emergency) return []
  const needs = household.needs.length ? household.needs : signal?.categories ?? []
  const starters = [...new Set(needs.flatMap((need) => needStarters[need] ?? []))]
  const flags = (Object.keys(factLabels) as HouseholdFlag[]).filter((flag) => household[flag] === true)
  const matchesAudience = (program: Program) => [...(program.requiresAny ?? []), ...(program.requiresAll ?? [])].some((flag) => flags.includes(flag))
  const priority = ({ program, likelihood }: Recommendation): number => {
    if (program.applicationStatus === 'closed') return 6
    const all = program.requiresAll ?? []
    const any = program.requiresAny ?? []
    const constrained = all.length > 0 || any.length > 0
    const contradicted = all.some((flag) => household[flag] === false) || (any.length > 0 && any.every((flag) => household[flag] === false))
    if (likelihood === 'unlikely' || contradicted) return 5
    if (constrained && all.every((flag) => household[flag] === true) && (!any.length || any.some((flag) => household[flag] === true))) return 0
    if (starters.includes(program.id)) return 1
    if (constrained) return 4
    if (program.alwaysShow || program.actionKind === 'information' || program.actionKind === 'referral' || program.actionKind === 'appointment') return 2
    return 3
  }
  return programs
    .filter((program) => needs.length ? needs.includes(program.category) || starters.includes(program.id) : !flags.length || matchesAudience(program) || program.alwaysShow)
    .map((program) => assessProgram(program, household))
    .sort((a, b) => priority(a) - priority(b)
      || (priority(a) === 1 ? starters.indexOf(a.program.id) - starters.indexOf(b.program.id) : 0)
      || a.program.name.localeCompare(b.program.name))
}

const questionsByNeed: Record<BenefitCategory, HouseholdFlag[]> = {
  food: ['hasChildUnder5OrPregnant', 'hasChildrenUnder18', 'hasSenior60Plus', 'hasDisability'],
  health: ['isUninsured', 'hasChildrenUnder18', 'hasChildUnder5OrPregnant', 'hasDisability', 'hasSenior60Plus'],
  housing: ['isHomeless', 'isRenter', 'isHomeowner', 'hasChildrenUnder18', 'isVeteranHousehold'],
  utilities: ['isRenter', 'isHomeowner', 'hasSenior60Plus', 'hasDisability'],
  family: ['hasChildUnder13', 'isWorkingOrTraining', 'hasChildUnder5OrPregnant', 'hasChildrenUnder18', 'isCaregiver'],
  financial: ['isHomeowner', 'hasChildrenUnder18', 'isStudent'],
  income: ['isUnemployed', 'isWorkingOrTraining', 'hasChildrenUnder18', 'hasDisability'],
  special: ['hasSenior60Plus', 'hasDisability', 'isVeteranHousehold', 'isCaregiver', 'isImmigrantOrNewcomer'],
  transportation: ['needsTransportation', 'hasDisability', 'hasSenior60Plus', 'isStudent'],
  education: ['isStudent', 'isWorkingOrTraining', 'hasChildrenUnder18'],
  safety: ['isHomeless', 'hasChildrenUnder18'],
  pets: [],
}

export function relevantQuestions(needs: BenefitCategory[]): HouseholdFlag[] {
  return [...new Set(needs.flatMap((need) => questionsByNeed[need] ?? []))]
}

export function emptyHousehold(): Household {
  return {
    size: null,
    monthlyIncome: null,
    zip: null,
    county: null,
    needs: [],
    hasChildrenUnder18: null,
    hasChildUnder5OrPregnant: null,
    hasSenior60Plus: null,
    hasDisability: null,
    isVeteranHousehold: null,
    isUninsured: null,
    isUnemployed: null,
    isRenter: null,
    isImmigrantOrNewcomer: null,
    isStudent: null,
    isHomeowner: null,
    isCaregiver: null,
    isHomeless: null,
    needsTransportation: null,
    hasChildUnder13: null,
    isWorkingOrTraining: null,
  }
}
