import type { BenefitCategory, Household, HouseholdFlag, Language, Localized, PlaceKind, Program } from '../types'
import { normalize } from './format'
import { emptyHousehold } from './eligibility'
import { detectEmergency, type Emergency } from './emergency'
import { splitCareContext } from './pet-context'

export { rankRecommendations, relevantQuestions } from './eligibility'
export { emergencyContacts } from './emergency'

export const MAX_SITUATION_LENGTH = 4000

/**
 * On-device natural-language interpreter. Turns a free-text description of
 * someone's situation ("I lost my job and can't pay rent, I have two kids", or
 * "my AC broke and I need somewhere cool") into structured signals — household
 * flags, benefit categories, nearby place types, size and income — using
 * bilingual keyword lexicons. No network, no LLM: everything runs locally so
 * nothing about the user ever leaves the device. This is also fully
 * deterministic and unit-testable.
 */

export type NavigatorSignal = {
  flags: HouseholdFlag[]
  deniedFlags: HouseholdFlag[]
  categories: BenefitCategory[]
  /** Kinds of physical places the person seems to be looking for. */
  placeKinds: PlaceKind[]
  /** True when the wording asks for something nearby ("near me", "closest"). */
  wantsNearby: boolean
  size: number | null
  monthlyIncome: number | null
  zip: string | null
  emergency: Emergency | null
  warnings: Localized[]
}

/** Keyword lexicons (English + Spanish, accent-insensitive). */
const flagTerms: Record<HouseholdFlag, string[]> = {
  hasChildrenUnder18: [
    'kid', 'kids', 'child', 'children', 'son', 'daughter', 'teen', 'teenager',
    'hijo', 'hija', 'hijos', 'nino', 'ninos', 'nina', 'ninas', 'adolescente',
  ],
  hasChildUnder5OrPregnant: [
    'baby', 'babies', 'infant', 'toddler', 'newborn', 'pregnant', 'pregnancy',
    'diaper', 'diapers', 'formula',
    'bebe', 'embarazada', 'embarazo', 'recien nacido', 'panal', 'panales',
  ],
  hasSenior60Plus: [
    'senior', 'seniors', 'elderly', 'old age',
    'adulto mayor', 'anciano', 'anciana',
  ],
  hasDisability: [
    'disabled', 'disability', 'wheelchair', 'blind', 'deaf', 'ssi', 'ssdi',
    'handicap', 'special needs',
    'discapacidad', 'discapacitado', 'discapacitada', 'silla de ruedas', 'ciego', 'sordo',
  ],
  isVeteranHousehold: [
    'veteran', 'veterans', 'army', 'navy', 'marine', 'marines', 'military',
    'air force', 'vfw',
    'veterano', 'veterana', 'militar', 'ejercito', 'fuerzas armadas',
  ],
  isUninsured: [
    'uninsured', 'no insurance', 'without insurance', 'no health insurance',
    'sin seguro', 'no tengo seguro', 'sin cobertura', "don't have insurance",
    'do not have insurance', 'no medical insurance', 'no tengo cobertura',
  ],
  isUnemployed: [
    'unemployed', 'lost my job', 'lost job', 'laid off', 'fired', 'no job',
    'out of work', 'jobless', 'unemployment', 'let go',
    'desempleado', 'desempleada', 'sin trabajo', 'sin empleo', 'perdi mi trabajo',
    'me despidieron', 'me quede sin trabajo',
  ],
  isRenter: [
    'rent', 'renter', 'renting', 'rental', 'landlord', 'eviction', 'evicted', 'evict',
    'apartment', 'lease', 'behind on rent',
    'renta', 'alquiler', 'desalojo', 'arrendador', 'apartamento', 'inquilino', 'inquilina',
  ],
  isImmigrantOrNewcomer: [
    'immigrant', 'immigration', 'refugee', 'newcomer', 'undocumented', 'migrant',
    'asylum', 'green card', 'new to the country',
    'inmigrante', 'inmigracion', 'refugiado', 'migrante', 'recien llegado',
    'indocumentado', 'asilo', 'residencia',
  ],
  isStudent: [
    'student', 'studying', 'estudiante', 'estudiando',
  ],
  isHomeowner: ['homeowner', 'own my home', 'own our home', 'own my house', 'own our house', 'soy propietario', 'casa propia'],
  isCaregiver: ['caregiver', 'care for my', 'caring for my', 'cuidador', 'cuidadora', 'cuido a'],
  isHomeless: ['homeless', 'unhoused', 'sleeping outside', 'living in my car', 'sin hogar', 'vivo en la calle', 'sin techo'],
  needsTransportation: ['need transportation', 'need a ride', 'need bus fare', 'bus pass', 'necesito transporte', 'necesito un aventon', 'pase de autobus'],
  hasChildUnder13: ['baby', 'infant', 'toddler', 'newborn', 'bebe', 'recien nacido', 'child under 13', 'children under 13', 'hijo menor de 13', 'hijos menores de 13'],
  isWorkingOrTraining: ['i work', 'i am working', "i'm working", 'we work', 'job training', 'trabajo actualmente', 'estoy trabajando', 'capacitacion laboral'],
}

const categoryTerms: Record<BenefitCategory, string[]> = {
  food: [
    'food', 'hungry', 'hunger', 'groceries', 'grocery', 'eat', 'meal', 'meals',
    'snap', 'ebt', 'wic', 'pantry', 'food stamps',
    'comida', 'hambre', 'alimentos', 'despensa', 'comer', 'estampillas',
  ],
  health: [
    'health', 'doctor', 'medical', 'medicine', 'insurance', 'dental', 'hospital',
    'clinic', 'mental', 'therapy', 'prescription', 'sick',
    'salud', 'medico', 'medica', 'seguro', 'hospital', 'clinica', 'enfermo', 'terapia',
  ],
  housing: [
    'rent', 'house', 'home', 'housing', 'eviction', 'homeless', 'shelter',
    'mortgage', 'apartment', 'foster care', 'aging out', 'hoa', 'homeowners association', 'deed restrictions',
    'renta', 'casa', 'vivienda', 'desalojo', 'sin hogar', 'refugio', 'hipoteca',
  ],
  utilities: [
    'electric', 'electricity', 'power', 'water', 'gas', 'utility', 'utilities',
    'bill', 'bills', 'internet', 'phone', 'wifi', 'lights', 'rebate', 'rebates', 'energy efficiency', 'solar',
    'luz', 'electricidad', 'agua', 'factura', 'facturas', 'servicios', 'telefono', 'recibo',
  ],
  family: [
    'child care', 'childcare', 'daycare', 'day care', 'babysitter', 'diaper',
    'preschool', 'head start', 'after school',
    'cuidado de ninos', 'guarderia', 'panal', 'preescolar',
  ],
  financial: [
    'tax', 'taxes', 'money', 'debt', 'credit', 'savings', 'refund', 'eitc',
    'budget', 'loan', 'property tax', 'appraisal', 'credit report', 'credit score', 'identity theft', 'file my taxes', 'small business', 'start a business', 'debt', 'credit card',
    'impuesto', 'impuestos', 'dinero', 'deuda', 'credito', 'ahorro', 'reembolso', 'presupuesto',
  ],
  income: [
    'job', 'unemployed', 'unemployment', 'cash', 'income', 'work', 'benefits',
    'laid off', 'tanf', 'welfare', 'resume', 'career', 'new job', 'better job', 'job training',
    'trabajo', 'empleo', 'desempleo', 'ingreso', 'ingresos', 'efectivo', 'ayuda economica',
  ],
  special: [
    'veteran', 'senior', 'elderly', 'disability', 'disabled', 'immigrant',
    'refugee', 'newcomer',
    'veterano', 'mayor', 'discapacidad', 'inmigrante', 'refugiado',
  ],
  transportation: ['transportation', 'transport', 'bus', 'bus pass', 'bus fare', 'ride', 'transit', 'capmetro', 'transportation help', 'transporte', 'autobus', 'camion', 'pasaje', 'aventon'],
  education: ['education', 'school', 'college', 'university', 'student', 'ged', 'esl', 'learn english', 'tuition', 'fafsa', 'certification', 'certificate', 'course', 'courses', 'training', 'educacion', 'curso', 'cursos', 'certificacion', 'capacitacion', 'escuela', 'universidad', 'estudiante', 'aprender ingles', 'matricula'],
  safety: ['domestic violence', 'expunction', 'expunge', 'nondisclosure', 'criminal record', 'my record', 'antecedentes', 'violence', 'abuse', 'unsafe', 'safety', 'lawyer', 'attorney', 'legal aid', 'legal help', 'court date', 'court papers', 'protective order', 'violencia', 'abuso', 'maltrato', 'peligro', 'seguridad', 'abogado', 'abogada', 'ayuda legal', 'corte', 'orden de proteccion'],
  pets: ['pet', 'pets', 'dog', 'dogs', 'cat', 'cats', 'puppy', 'kitten', 'vet', 'veterinary', 'veterinarian', 'spay', 'neuter', 'emancipet', 'pet food', 'mascota', 'mascotas', 'perro', 'perra', 'gato', 'gata', 'cachorro', 'gatito', 'veterinario', 'veterinaria', 'esterilizacion'],
}

/** Words that point at a physical place someone can walk into. */
const placeTerms: Record<PlaceKind, string[]> = {
  library: [
    'library', 'libraries', 'book', 'books', 'computer', 'computers', 'internet',
    'wifi', 'wi fi', 'print', 'printer', 'printing', 'scan', 'online application',
    'biblioteca', 'bibliotecas', 'libro', 'computadora', 'computadoras',
    'imprimir', 'impresora', 'internet gratis',
  ],
  cooling: [
    'cooling', 'cooling center', 'cool off', 'cool down', 'somewhere cool',
    'air conditioning', 'air conditioner', 'ac broke', 'ac is broken', 'no ac',
    'a c broke', 'swimming', 'swim', 'pool', 'splash pad', 'too hot', 'so hot',
    'heat', 'heatstroke', 'overheating',
    'refrescar', 'refrescarme', 'aire acondicionado', 'sin aire', 'piscina',
    'alberca', 'nadar', 'mucho calor', 'calor extremo', 'lugar fresco',
  ],
  'neighborhood-center': [
    'neighborhood center', 'community center', 'food pantry', 'pantry',
    'food bank', 'free food', 'groceries', 'basic needs', 'social services',
    'centro vecinal', 'centro comunitario', 'despensa', 'banco de alimentos',
    'comida gratis', 'servicios sociales', 'necesidades basicas',
  ],
  clinic: [
    'clinic', 'clinics', 'doctor', 'health center', 'medical', 'checkup',
    'check up', 'dentist', 'dental', 'prescription', 'medicine', 'urgent care',
    'sick', 'hurt', 'pain',
    'clinica', 'clinicas', 'medico', 'doctora', 'centro de salud', 'dentista',
    'medicina', 'receta', 'enfermo', 'enferma', 'dolor',
  ],
  wic: [
    'wic', 'wic office', 'wic clinic', 'formula', 'breastfeeding', 'baby food',
    'oficina de wic', 'clinica wic', 'formula infantil', 'lactancia',
  ],
  'senior-center': [
    'senior center', 'senior activity', 'older adult', 'elderly center',
    'centro para mayores', 'centro de ancianos', 'adulto mayor',
  ],
  'rec-center': [
    'rec center', 'recreation center', 'gym', 'after school', 'summer camp',
    'kids program', 'youth program', 'activities for kids',
    'centro recreativo', 'gimnasio', 'campamento', 'programa juvenil',
    'actividades para ninos',
  ],
  nonprofit: [
    'nonprofit', 'non profit', 'charity', 'organization', 'shelter',
    'domestic violence', 'counseling', 'support group',
    'organizacion', 'caridad', 'refugio', 'violencia domestica', 'consejeria',
  ],
}

/** Phrases that mean "show me something close to me". */
const nearbyTerms = [
  'near me', 'nearby', 'near by', 'close to me', 'closest', 'nearest',
  'around me', 'in my area', 'by my house', 'walking distance', 'where can i',
  'where do i go', 'how do i get to', 'find a', 'find me', 'looking for a',
  'is there a', 'address', 'location', 'directions', 'open now',
  'cerca de mi', 'cerca', 'mas cercano', 'mas cercana', 'donde puedo',
  'donde queda', 'donde hay', 'buscar un', 'buscar una', 'direccion',
  'ubicacion', 'como llego',
]

const numberWords: Record<string, number> = {  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12,
  uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7,
  ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
}

function termMatches(text: string, term: string): RegExpMatchArray[] {
  const escaped = normalize(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  return [...text.matchAll(new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'g'))]
}

function clauseBefore(text: string, index: number): string {
  return text.slice(Math.max(0, index - 120), index).split(/[.!?;,\n]|\b(?:but|pero|and|y)\b/).at(-1) ?? ''
}

function isNegated(text: string, index: number): boolean {
  const before = clauseBefore(text, index)
  if (/\b(?:not sure|not only|no se|no estoy segur[oa])\b/.test(before)) return false
  return /\b(?:not|no|never|without|sin|ni|don'?t|doesn'?t|do not|does not)\b(?:\s+[a-z']+){0,5}\s*$/.test(before)
}

function isUncertainOrPast(text: string, index: number, lossOfJobEvent = false): boolean {
  const before = clauseBefore(text, index)
  return /\b(?:used to|previously|in the past|antes|era|estaba|not sure|no se|maybe|perhaps|quizas|tal vez|if|whether|might be|may be|could be|creo que)\b[^.!?;]*$/.test(before)
    || (!lossOfJobEvent && /\b(?:was|were)\b[^.!?;]*$/.test(before))
}

function intentDenied(text: string, index: number): boolean {
  const before = clauseBefore(text, index)
  return /\b(?:don'?t need|do not need|no need for|not looking for|no necesito|no necesitamos|no busco)\b[^.!?;]*$/.test(before)
    || (isNegated(text, index) && /\b(?:not|no soy|no estoy|no es)\b/.test(before))
}

function matchTerms<K extends string>(haystack: string, lexicon: Record<K, string[]>): K[] {
  const hits: K[] = []
  for (const key of Object.keys(lexicon) as K[]) {
    if (lexicon[key].some((term) => termMatches(haystack, term).some((match) => !intentDenied(haystack, match.index!)))) hits.push(key)
  }
  return hits
}

const directDenials: Partial<Record<HouseholdFlag, string[]>> = {
  hasChildrenUnder18: ['kid', 'kids', 'child', 'children', 'hijos', 'ninos', 'ninas'],
  hasChildUnder13: ['child under 13', 'children under 13', 'hijo menor de 13', 'hijos menores de 13'],
  hasDisability: ['disabled', 'disability', 'discapacidad', 'discapacitado', 'discapacitada'],
  isVeteranHousehold: ['veteran', 'veterans', 'veterano', 'veterana'],
  isUnemployed: ['unemployed', 'jobless', 'desempleado', 'desempleada', 'no job', 'out of work', 'sin trabajo', 'sin empleo'],
  isRenter: ['renter', 'renting', 'rent', 'inquilino', 'inquilina', 'alquiler', 'renta'],
  isImmigrantOrNewcomer: ['immigrant', 'refugee', 'newcomer', 'inmigrante', 'refugiado', 'recien llegado'],
  isCaregiver: ['caregiver', 'cuidador', 'cuidadora'],
  isHomeless: ['homeless', 'unhoused', 'sin hogar', 'sin techo'],
  needsTransportation: ['need transportation', 'necesito transporte'],
  // Not working alone cannot deny the education/training alternatives.
  isWorkingOrTraining: [],
}

function canDenyFlag(flag: HouseholdFlag, term: string, text: string, match: RegExpMatchArray): boolean {
  if (directDenials[flag] && !directDenials[flag]!.includes(term)) return false
  const after = text.slice(match.index! + match[0].length, match.index! + match[0].length + 50)
  if (flag === 'hasChildrenUnder18' && /^\s+(?:under|over|younger|older|menores|mayores)\b/.test(after) && !/^\s+(?:under 18|menores de 18)\b/.test(after)) return false
  if (flag === 'isRenter' && /\b(?:behind|pay|paying|pagar|atrasad[oa])\b/.test(clauseBefore(text, match.index!))) return false
  return true
}

function detectFlags(text: string, warnings: Localized[]): Pick<NavigatorSignal, 'flags' | 'deniedFlags'> {
  const yes = new Set<HouseholdFlag>()
  const no = new Set<HouseholdFlag>()
  for (const flag of Object.keys(flagTerms) as HouseholdFlag[]) {
    for (const term of flagTerms[flag]) {
      for (const match of termMatches(text, term)) {
        const lossOfJobEvent = flag === 'isUnemployed' && ['laid off', 'fired', 'lost my job', 'lost job', 'let go', 'perdi mi trabajo', 'me despidieron', 'me quede sin trabajo'].includes(term)
        if (isUncertainOrPast(text, match.index!, lossOfJobEvent)) continue
        if (lossOfJobEvent && /\b(?:last year|years? ago|el ano pasado|hace \d+ anos|now (?:i )?have a job|ahora tengo trabajo)\b/.test(text.slice(match.index!, match.index! + 120))) continue
        if (isNegated(text, match.index!)) {
          if (canDenyFlag(flag, term, text, match)) no.add(flag)
        }
        else yes.add(flag)
      }
    }
  }
  // Explicit insurance statements only: a doctor/clinic request says nothing about coverage.
  for (const term of ['i have insurance', 'i have health insurance', 'i am insured', "i'm insured", 'we have insurance', 'tengo seguro', 'tenemos seguro', 'estoy asegurado', 'estoy asegurada']) {
    for (const match of termMatches(text, term)) {
      if (isUncertainOrPast(text, match.index!)) continue
      if (isNegated(text, match.index!)) yes.add('isUninsured')
      else no.add('isUninsured')
    }
  }

  const agePatterns = [
    /\b(?:my |mi |our |nuestro |nuestra )?(?:child|son|daughter|hijo|hija|nino|nina)\s+(?:is |tiene |de )?(\d{1,3})\s*(?:years? old|anos)?\b/g,
    /\b(\d{1,2})[ -](?:year[ -]old|anos)\s+(?:child|son|daughter|hijo|hija|nino|nina)\b/g,
  ]
  const childAges: number[] = []
  for (const pattern of agePatterns) {
    for (const match of text.matchAll(pattern)) {
      if (!isNegated(text, match.index) && !isUncertainOrPast(text, match.index)) childAges.push(Number(match[1]))
    }
  }
  if (childAges.some((age) => age < 18)) yes.add('hasChildrenUnder18')
  if (childAges.some((age) => age < 13)) yes.add('hasChildUnder13')
  if (childAges.some((age) => age < 5)) yes.add('hasChildUnder5OrPregnant')
  if (childAges.length && childAges.every((age) => age >= 18)) yes.delete('hasChildrenUnder18')
  if (yes.has('hasChildUnder13')) yes.add('hasChildrenUnder18')
  for (const match of text.matchAll(/\b(?:i am|i'm|my (?:mother|father) is|tengo|mi (?:madre|padre) tiene)\s+(\d{2,3})\s*(?:years? old|anos)?\b/g)) {
    if (Number(match[1]) >= 60 && Number(match[1]) <= 120 && !isNegated(text, match.index)) yes.add('hasSenior60Plus')
  }

  // The combined flag is an OR: denying pregnancy alone cannot deny a young child.
  const pregnancyDenied = ['pregnant', 'pregnancy', 'embarazada', 'embarazo'].some((term) => termMatches(text, term).some((match) => isNegated(text, match.index!)))
  const youngChildDenied = no.has('hasChildrenUnder18') || /\b(?:no children under 5|no kids under 5|no tengo hijos menores de 5)\b/.test(text)
  if (!(pregnancyDenied && youngChildDenied)) no.delete('hasChildUnder5OrPregnant')
  if (no.has('hasChildrenUnder18')) no.add('hasChildUnder13')
  for (const flag of [...yes]) {
    if (no.has(flag)) {
      yes.delete(flag)
      no.delete(flag)
      warnings.push({ en: 'Some household statements conflict. Please confirm the suggested answers; conflicting facts were left unknown.', es: 'Algunas declaraciones sobre el hogar se contradicen. Confirme las respuestas sugeridas; los datos contradictorios se dejaron sin responder.' })
    }
  }
  return { flags: [...yes], deniedFlags: [...no] }
}

function detectSize(text: string, warnings: Localized[]): number | null {
  // "family of 4", "household of 3", "somos 5", "familia de 6", "4 people"
  const digitPatterns = [
    /\b(?:family|household|home)\s+of\s+(\d+(?:\.\d+)?)/g,
    /\b(?:familia|hogar|somos)\s+(?:de\s+)?(\d+(?:\.\d+)?)/g,
    /\b(\d+(?:\.\d+)?)\s+(?:people|persons|personas|members?)\b/g,
  ]
  const sizes = new Set<number>()
  for (const pattern of digitPatterns) {
    for (const match of text.matchAll(pattern)) {
      if (isNegated(text, match.index)) continue
      const value = Number(match[1])
      sizes.add(value)
    }
  }
  // number words: "three people", "family of four"
  const wordPeople = text.match(/\b([a-z]+)\s+(?:people|persons|personas)\b/)
  if (wordPeople && numberWords[wordPeople[1]]) sizes.add(numberWords[wordPeople[1]])
  const wordFamily = text.match(
    /(?:family|household|home|familia|hogar|somos)\s+(?:of\s+|de\s+)?([a-z]+)/,
  )
  if (wordFamily && numberWords[wordFamily[1]]) sizes.add(numberWords[wordFamily[1]])
  if (sizes.size === 0) return null
  const [size] = sizes
  if (sizes.size !== 1 || !Number.isInteger(size) || size < 1 || size > 20) {
    warnings.push({ en: 'Confirm household size as a whole number from 1 to 20. Program-specific household definitions may differ.', es: 'Confirme el tamaño del hogar con un número entero de 1 a 20. Cada programa puede definir el hogar de forma distinta.' })
    return null
  }
  return size
}

const incomePeriod = '(?:every (?:two|2) weeks|cada (?:dos|2) semanas|twice (?:a|per) month|dos veces al mes|bi[ -]?weekly|semimonthly|quincenal|(?:a |per |/ ?)?(?:month|week|year)|monthly|weekly|yearly|annually|annual|al mes|por mes|mensual(?:es)?|por semana|a la semana|semanal(?:es)?|al ano|por ano|anual(?:es)?|anualmente)'
const incomeCue = '(?:household income|total income|income|earnings|earn|earns|earning|make|salary|wages|ingresos del hogar|ingresos|ingreso|gano|ganamos|gana|salario|sueldo)'
const incomePattern = new RegExp(`\\b(?:(?<before>${incomePeriod})\\s+)?${incomeCue}\\b(?:\\s+(?:is|are|of|about|around|approximately|total|gross|es|son|de|aproximadamente|bruto|brutos)){0,3}\\s*(?<middle>${incomePeriod})?\\s*(?:(?:is|are|es|son|de)\\s+)?[:=]?\\s*\\$?\\s*(?<amount>\\d+(?:[.,]\\d+)*)(?:\\s*(?:dollars|dolares|usd))?\\s*(?<after>${incomePeriod})?(?![a-z0-9])`, 'g')

function parseAmount(text: string): number | null {
  if (/^\d+(?:\.\d{1,2})?$/.test(text)) return Number(text)
  if (/^\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?$/.test(text)) return Number(text.replace(/,/g, ''))
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text)) return Number(text.replace(/\./g, '').replace(',', '.'))
  if (/^\d+,\d{1,2}$/.test(text)) return Number(text.replace(',', '.'))
  return null
}

function detectIncome(text: string, warnings: Localized[]): number | null {
  const amounts = new Set<number>()
  let unconfirmed = false
  for (const match of text.matchAll(/\b(?:no income|zero income|sin ingresos|cero ingresos)\b/g)) {
    if (!isNegated(text, match.index) && !isUncertainOrPast(text, match.index)) amounts.add(0)
  }
  for (const match of text.matchAll(incomePattern)) {
    if (isNegated(text, match.index) || isUncertainOrPast(text, match.index)) continue
    const groups = match.groups!
    const amount = parseAmount(groups.amount)
    const periods = [groups.before, groups.middle, groups.after].filter(Boolean)
    const period = periods[0] ?? ''
    if (amount === null || !period || period === 'quincenal') {
      unconfirmed = true
      continue
    }
    const multiplier = (value: string) => /(?:twice|dos veces|semimonthly)/.test(value) ? 2
      : /(?:bi[ -]?weekly|every (?:two|2)|cada (?:dos|2))/.test(value) ? 26 / 12
        : /(?:week|semana)/.test(value) ? 52 / 12
          : /(?:year|annual|ano|anual)/.test(value) ? 1 / 12 : 1
    const factor = multiplier(period)
    if (periods.some((value) => multiplier(value) !== factor)) {
      unconfirmed = true
      continue
    }
    const monthly = Math.round(amount * factor * 100) / 100
    if (!Number.isFinite(monthly) || monthly < 0 || monthly > 1000000) {
      unconfirmed = true
      continue
    }
    amounts.add(monthly)
    warnings.push(factor === 1
      ? { en: 'Confirm that this amount is total monthly household income before taxes, not an expense or only one person’s income.', es: 'Confirme que esta cantidad sea el ingreso mensual total del hogar antes de impuestos, no un gasto ni solo el ingreso de una persona.' }
      : { en: `Estimated monthly income: $${monthly.toFixed(2)}. Converted using ${factor === 1 / 12 ? 'annual income ÷ 12' : factor === 52 / 12 ? 'weekly income × 52 ÷ 12' : factor === 26 / 12 ? 'income every two weeks × 26 ÷ 12' : 'twice-monthly income × 2'}. Confirm or correct this estimate and the total household amount before using it.`, es: `Ingreso mensual estimado: $${monthly.toFixed(2)}. Conversión: ${factor === 1 / 12 ? 'ingreso anual ÷ 12' : factor === 52 / 12 ? 'ingreso semanal × 52 ÷ 12' : factor === 26 / 12 ? 'ingreso cada dos semanas × 26 ÷ 12' : 'ingreso dos veces al mes × 2'}. Confirme o corrija esta estimación y el total del hogar antes de usarlo.` })
  }
  if (unconfirmed || amounts.size > 1) {
    warnings.push({ en: 'Income was left unknown: confirm one total household amount and whether it is monthly, annual, weekly, or every two weeks. Expenses and bare numbers are not income.', es: 'Los ingresos se dejaron sin responder: confirme una cantidad total del hogar e indique si es mensual, anual, semanal o cada dos semanas. Los gastos y los números sin contexto no son ingresos.' })
    return null
  }
  return amounts.size === 1 ? [...amounts][0] : null
}

function detectZip(text: string): string | null {
  const matches = [...text.matchAll(/\b(?:zip(?: code)?|codigo postal|postal code|live in|vivo en|in|en)\s*[:#]?\s*(\d{5})(?:-\d{4})?\b/g)]
  if (/^\d{5}(?:-\d{4})?$/.test(text)) return text.slice(0, 5)
  const values = new Set(matches.map((match) => match[1]))
  return values.size === 1 ? [...values][0] : null
}

export function interpretSituation(text: string, _language: Language): NavigatorSignal {
  void _language
  const warnings: Localized[] = []
  const empty: NavigatorSignal = {
    flags: [], deniedFlags: [], categories: [], placeKinds: [], wantsNearby: false,
    size: null, monthlyIncome: null, zip: null, emergency: null, warnings,
  }
  if (typeof text !== 'string') return empty
  if (text.length > MAX_SITUATION_LENGTH) {
    warnings.push({ en: `Please shorten your description to ${MAX_SITUATION_LENGTH} characters. Only the beginning was checked for urgent safety concerns; household details were not filled in.`, es: `Reduzca su descripción a ${MAX_SITUATION_LENGTH} caracteres. Solo se revisó el inicio para detectar riesgos urgentes; no se completaron datos del hogar.` })
    return { ...empty, emergency: detectEmergency(text.slice(0, MAX_SITUATION_LENGTH)) }
  }
  const haystack = normalize(text).replace(/[’‘]/g, "'").replace(/\p{Cc}/gu, ' ')
  if (!haystack) return empty

  const { humanText, petText } = splitCareContext(haystack)
  const placeKinds = matchTerms(humanText, placeTerms)
  const categories: BenefitCategory[] = matchTerms(humanText, categoryTerms).filter(category => category !== 'pets')
  const petNeeds = petText.split(';').filter(clause => !/\b(?:no pets?|no dogs?|no cats?|no tengo mascotas|do not have (?:a |any )?(?:pets?|dogs?|cats?)|don'?t have (?:a |any )?(?:pets?|dogs?|cats?))\b/.test(clause)).join('; ')
  if (petNeeds && matchTerms(petNeeds, { pets: categoryTerms.pets }).length) categories.push('pets')
  if (petNeeds && /\b(?:my family|my children|my kids|myself|mi familia|mis hijos)\b/.test(humanText) &&
      matchTerms(petNeeds, { food: categoryTerms.food }).length && !categories.includes('food')) categories.push('food')

  // A broken AC or extreme heat is both a "somewhere cool" need and a
  // utilities/housing problem the city can help with.
  if (placeKinds.includes('cooling') && !categories.includes('utilities')) {
    categories.push('utilities')
  }
  // Recreation centers double as cooling spots on dangerous-heat days.
  if (placeKinds.includes('cooling') && !placeKinds.includes('rec-center')) {
    placeKinds.push('rec-center')
  }

  return {
    ...detectFlags(humanText, warnings),
    categories,
    placeKinds,
    // The historic place directory has no verified veterinary locations.
    // Keep pet requests on the sourced service results, never human clinic pins.
    wantsNearby: !categories.includes('pets') && nearbyTerms.some((term) => termMatches(humanText, term).some((match) => !intentDenied(humanText, match.index!))),
    size: detectSize(humanText, warnings),
    monthlyIncome: detectIncome(humanText, warnings),
    zip: detectZip(haystack),
    emergency: detectEmergency(haystack),
    warnings,
  }
}

/** True when we understood at least one useful signal. */
export function hasSignal(signal: NavigatorSignal): boolean {
  return (
    signal.flags.length > 0 ||
    signal.deniedFlags.length > 0 ||
    signal.categories.length > 0 ||
    signal.placeKinds.length > 0 ||
    signal.size !== null ||
    signal.monthlyIncome !== null ||
    signal.zip !== null ||
    signal.emergency !== null
  )
}

/**
 * Decide where to send someone after they describe their situation. Asking for
 * a place ("find a library near me") should open the map; describing a hardship
 * should open matched benefit programs.
 */
export function navigatorDestination(signal: NavigatorSignal): 'nearme' | 'results' {
  if (signal.emergency) return 'results'
  if (signal.placeKinds.length === 0) return 'results'
  if (signal.wantsNearby) return 'nearme'
  // No explicit household hardship mentioned — they're looking for a place.
  if (signal.flags.length === 0) return 'nearme'
  return 'results'
}

/** How closely a program matches what the user described (higher = more relevant). */
export function programRelevance(program: Program, signal: NavigatorSignal): number {
  let score = 0
  if (signal.categories.includes(program.category)) score += 2
  if (program.requiresAny?.some((flag) => signal.flags.includes(flag))) score += 3
  if (program.requiresAll?.some((flag) => signal.flags.includes(flag))) score += 3
  return score
}

/** Every submission starts over; no inferred household is carried into another person's session. */
export function householdFromSignal(signal: NavigatorSignal): Household {
  const household = emptyHousehold()
  household.size = signal.size
  household.monthlyIncome = signal.monthlyIncome
  household.zip = signal.zip
  household.needs = [...signal.categories]
  for (const flag of signal.flags) household[flag] = true
  for (const flag of signal.deniedFlags) household[flag] = signal.flags.includes(flag) ? null : false
  return household
}
