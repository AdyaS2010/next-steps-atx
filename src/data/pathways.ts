import type { BenefitCategory, HouseholdFlag, Localized } from '../types'
import { text as t } from './catalog-shared'

export type PathwayFact = { text: Localized; source: { label: string; url: string } }

/**
 * A life-event starting point. Choosing one pre-selects needs and suggests
 * household details, which the person still confirms before any matching.
 * Facts are quoted or paraphrased from the cited official sources.
 */
export type Pathway = {
  id: string
  icon: 'home' | 'briefcase' | 'baby' | 'globe' | 'heart' | 'shield' | 'tent' | 'receipt' | 'key' | 'lock' | 'rocket' | 'refresh' | 'graduation' | 'store'
  title: Localized
  summary: Localized
  needs: BenefitCategory[]
  flags: HouseholdFlag[]
  facts: PathwayFact[]
  /** Offer a quick-exit control for situations where someone may be monitored. */
  quickExit?: boolean
  /** Opens a dedicated tool instead of (or alongside) the plan flow. */
  tool?: 'career'
}

const evictionGuide = { label: 'TexasLawHelp: Eviction', url: 'https://texaslawhelp.org/article/eviction' }
const appealGuide = { label: 'TexasLawHelp: Appealing an Eviction', url: 'https://texaslawhelp.org/article/appealing-an-eviction' }
const twc = { label: 'Texas Workforce Commission: Apply for Benefits', url: 'https://www.twc.texas.gov/services/apply-benefits' }
const sep = { label: 'HealthCare.gov: Special Enrollment Period', url: 'https://www.healthcare.gov/coverage-outside-open-enrollment/special-enrollment-period/' }
const wic = { label: 'Texas WIC: apply', url: 'https://texaswic.org/apply' }
const uscis = { label: 'USCIS: Common Scams', url: 'https://www.uscis.gov/scams-fraud-and-misconduct/avoid-scams/common-scams' }
const capcog = { label: 'CAPCOG: caregiver support', url: 'https://www.capcog.org/divisions/area-agency-on-aging/caregiver-support-care-coordination/' }
const safe = { label: 'The SAFE Alliance: get help', url: 'https://www.safeaustin.org/get-help/' }
const echo = { label: 'ECHO: get help', url: 'https://www.austinecho.org/gethelp/' }
const lifeline = { label: 'USAC Lifeline: how to qualify', url: 'https://www.lifelinesupport.org/how-to-qualify/' }
const tcad = { label: 'Travis Central Appraisal District: protests', url: 'https://traviscad.org/protests/' }
const rebates = { label: 'Austin Energy: rebates and incentives', url: 'https://savings.austinenergy.com/' }
const credit = { label: 'FTC: free credit reports', url: 'https://consumer.ftc.gov/articles/free-credit-reports' }
const idTheft = { label: 'FTC: IdentityTheft.gov', url: 'https://www.identitytheft.gov/' }
const googleCerts = { label: 'Google Career Certificates', url: 'https://grow.google/certificates/' }
const capitalIdea = { label: 'Capital IDEA: eligibility', url: 'https://www.capitalidea.org/eligibility/' }
const clearSeal = { label: 'TexasLawHelp: Expunctions vs. nondisclosures', url: 'https://texaslawhelp.org/article/clear-or-seal-your-record-expunctions-vs-nondisclosures-in-texas' }
const fairChance = { label: 'City of Austin: Fair Chance Hiring', url: 'https://www.austintexas.gov/department/fair-chance-hiring' }
const dps = { label: 'Texas DPS: reinstating your license', url: 'https://www.dps.texas.gov/section/driver-license/reinstating-your-driver-license-or-driving-privilege' }
const waiver = { label: 'DFPS: state college tuition waiver', url: 'https://www.dfps.texas.gov/Child_Protection/Youth_and_Young_Adults/Education/state_college_tuition_waiver.asp' }
const etv = { label: 'DFPS: Education and Training Voucher', url: 'https://www.dfps.texas.gov/Child_Protection/Youth_and_Young_Adults/Education/ETV.asp' }
const bizAid = { label: 'City of Austin: BizAid orientation', url: 'https://www.austintexas.gov/department/bizaid-business-orientation' }
const utility = { label: 'City of Austin Utilities: CAP discounts', url: 'https://coautilities.com/wps/wcm/connect/occ/coa/util/support/customer-assistance/utility-bill-discounts' }

export const pathways: Pathway[] = [
  {
    id: 'job-loss', icon: 'briefcase',
    title: t('Lost my job or my hours were cut', 'Perdí mi trabajo o me redujeron las horas'),
    summary: t('File for unemployment, keep health coverage, and cover food and bills while you look for work.', 'Solicite desempleo, mantenga su seguro médico y cubra comida y facturas mientras busca trabajo.'),
    needs: ['income', 'food', 'health', 'utilities'], flags: ['isUnemployed'],
    facts: [
      { text: t('TWC says to apply as soon as you are unemployed or your hours are reduced. Your claim starts the week you apply; earlier weeks are not paid.', 'TWC indica solicitar en cuanto quede sin empleo o le reduzcan las horas. Su reclamo empieza la semana en que solicita; no se pagan semanas anteriores.'), source: twc },
      { text: t('Losing job-based health coverage lets you enroll in a Marketplace plan within 60 days through a Special Enrollment Period.', 'Perder el seguro del trabajo le permite inscribirse en un plan del Mercado dentro de 60 días mediante un Período Especial de Inscripción.'), source: sep },
    ],
  },
  {
    id: 'eviction', icon: 'home',
    title: t('Behind on rent or facing eviction', 'Atrasado con la renta o ante un desalojo'),
    summary: t('Know the court timeline, get free legal help, and ask about rent assistance, all at once.', 'Conozca los plazos de la corte, busque ayuda legal gratuita y pregunte por ayuda de renta al mismo tiempo.'),
    needs: ['housing', 'safety', 'utilities'], flags: ['isRenter'],
    facts: [
      { text: t('A notice to vacate is not a court order. In Texas it is usually three days unless your lease says otherwise; only a judge can order an eviction.', 'Un aviso para desocupar no es una orden judicial. En Texas suele ser de tres días salvo que el contrato diga otra cosa; solo un juez puede ordenar un desalojo.'), source: evictionGuide },
      { text: t('Most eviction hearings happen 10–21 days after the landlord files. If you do not go, the judge will likely rule against you.', 'La mayoría de las audiencias ocurren 10–21 días después de la demanda. Si no va, el juez probablemente fallará en su contra.'), source: evictionGuide },
      { text: t('If you lose, you have five days after the judge signs the judgment to appeal. Weekends and holidays count.', 'Si pierde, tiene cinco días desde que el juez firma la sentencia para apelar. Cuentan fines de semana y feriados.'), source: appealGuide },
    ],
  },
  {
    id: 'better-job', icon: 'rocket', tool: 'career',
    title: t('Want a better job or a new career', 'Quiero un mejor trabajo o una nueva carrera'),
    summary: t('Turn your experience into a plan: free courses, recognized certificates, local training and a polished résumé.', 'Convierta su experiencia en un plan: cursos gratis, certificados reconocidos, capacitación local y un currículum profesional.'),
    needs: ['income', 'education'], flags: ['isWorkingOrTraining'],
    facts: [
      { text: t('Google Career Certificates need no experience and take about 3–6 months at under 10 hours a week; Coursera offers financial aid.', 'Los certificados de Google no requieren experiencia y toman unos 3–6 meses con menos de 10 horas semanales; Coursera ofrece ayuda financiera.'), source: googleCerts },
      { text: t('Capital IDEA covers tuition, books and fees for eligible working adults in nursing, IT and skilled trades.', 'Capital IDEA cubre matrícula, libros y cuotas para adultos elegibles que trabajan, en enfermería, TI y oficios.'), source: capitalIdea },
    ],
  },
  {
    id: 'bills', icon: 'receipt',
    title: t('Can’t keep up with bills', 'No alcanzo a pagar las facturas'),
    summary: t('Lower utility and phone costs, stretch food money, and get free help with taxes and budgeting.', 'Baje costos de servicios y teléfono, rinda el dinero de la comida y reciba ayuda gratis con impuestos y presupuesto.'),
    needs: ['utilities', 'food', 'financial'], flags: [],
    facts: [
      { text: t('City of Austin Utilities offers bill discounts (CAP) to eligible customers who take part in qualifying assistance programs.', 'City of Austin Utilities ofrece descuentos (CAP) a clientes elegibles que participan en programas de asistencia que califican.'), source: utility },
      { text: t('Lifeline can lower a phone or internet bill. Taking part in certain benefits, or household income, can qualify you.', 'Lifeline puede bajar la factura de teléfono o internet. Participar en ciertos beneficios, o los ingresos del hogar, pueden calificarle.'), source: lifeline },
    ],
  },
  {
    id: 'new-baby', icon: 'baby',
    title: t('Expecting or have a new baby', 'Espero un bebé o tengo un recién nacido'),
    summary: t('Nutrition, health coverage, diapers, and child care, in the order you will need them.', 'Nutrición, seguro médico, pañales y cuidado infantil, en el orden en que los necesitará.'),
    needs: ['food', 'health', 'family'], flags: ['hasChildUnder5OrPregnant', 'hasChildrenUnder18'],
    facts: [
      { text: t('WIC serves pregnant and postpartum people and children under five. Being on Medicaid, SNAP or TANF can show WIC income eligibility, but you still need the WIC appointment.', 'WIC atiende a personas embarazadas o en posparto y a menores de cinco años. Tener Medicaid, SNAP o TANF puede acreditar ingresos para WIC, pero aún necesita la cita.'), source: wic },
    ],
  },
  {
    id: 'homeowner', icon: 'key',
    title: t('Homeowner: taxes, HOA and energy costs', 'Propietario: impuestos, HOA y energía'),
    summary: t('Protest your appraisal, check exemptions, understand HOA rules and cut energy bills with rebates.', 'Proteste su tasación, revise exenciones, entienda las reglas de la HOA y baje la factura con reembolsos.'),
    needs: ['financial', 'housing', 'utilities'], flags: ['isHomeowner'],
    facts: [
      { text: t('TCAD’s protest deadline is May 15 or 30 days after your Notice of Appraised Value is mailed, whichever is later.', 'El plazo de protesta de TCAD es el 15 de mayo o 30 días después del envío de su Aviso de Valor Tasado, lo que ocurra después.'), source: tcad },
      { text: t('Austin Energy rebates have limited, first-come funding, and some require a participating contractor.', 'Los reembolsos de Austin Energy tienen fondos limitados por orden de llegada y algunos requieren un contratista participante.'), source: rebates },
    ],
  },
  {
    id: 'fresh-start', icon: 'refresh', tool: 'career',
    title: t('A fresh start after a record', 'Un nuevo comienzo con antecedentes'),
    summary: t('Clear or seal your record, know your hiring rights, get your license back, and prepare for interviews.', 'Borre o selle sus antecedentes, conozca sus derechos al buscar empleo, recupere su licencia y prepárese para entrevistas.'),
    needs: ['safety', 'income', 'transportation'], flags: [],
    facts: [
      { text: t('In Austin, private employers with 15 or more employees cannot ask about criminal history until after a conditional job offer.', 'En Austin, los empleadores privados con 15 o más empleados no pueden preguntar por antecedentes penales hasta después de una oferta condicional.'), source: fairChance },
      { text: t('Nondisclosure seals some records from the public after a waiting period of 180 days to five years; expunction removes records but is very limited.', 'La no divulgación sella algunos registros del público tras una espera de 180 días a cinco años; la expunción los elimina pero es muy limitada.'), source: clearSeal },
      { text: t('The Texas License Eligibility system shows every item blocking a suspended license and lets you pay reinstatement fees online.', 'El sistema de elegibilidad de Texas muestra cada requisito pendiente de una licencia suspendida y permite pagar en línea.'), source: dps },
    ],
  },
  {
    id: 'unsafe-home', icon: 'shield', quickExit: true,
    title: t('Not safe at home', 'No estoy seguro en casa'),
    summary: t('Confidential 24/7 support, safety planning, shelter, and legal help such as protective orders.', 'Apoyo confidencial 24/7, plan de seguridad, refugio y ayuda legal como órdenes de protección.'),
    needs: ['safety', 'housing'], flags: [],
    facts: [
      { text: t('The SAFE Alliance SAFEline is 24/7: call 512-267-7233 or text SAFE to 737-888-7233. If you are in immediate danger, call 911 if it is safe.', 'La SAFEline de SAFE Alliance es 24/7: llame al 512-267-7233 o envíe SAFE al 737-888-7233. Si está en peligro inmediato, llame al 911 si es seguro.'), source: safe },
    ],
  },
  {
    id: 'protect-money', icon: 'lock',
    title: t('Protect my money and identity', 'Proteger mi dinero e identidad'),
    summary: t('Check your credit for free, recover from identity theft, and get free help with taxes and budgeting.', 'Revise su crédito gratis, recupérese de un robo de identidad y reciba ayuda gratis con impuestos y presupuesto.'),
    needs: ['financial', 'safety'], flags: [],
    facts: [
      { text: t('You can get a free credit report from each nationwide bureau every week at AnnualCreditReport.com.', 'Puede obtener un informe de crédito gratis de cada agencia nacional cada semana en AnnualCreditReport.com.'), source: credit },
      { text: t('If your identity was stolen, IdentityTheft.gov creates a personalized recovery plan.', 'Si le robaron la identidad, IdentityTheft.gov crea un plan de recuperación personalizado.'), source: idTheft },
    ],
  },
  {
    id: 'caregiving', icon: 'heart',
    title: t('Caring for an aging parent or loved one', 'Cuido a un padre mayor o ser querido'),
    summary: t('Meals, Medicare counseling, rides, and a break for you as the caregiver.', 'Comidas, orientación de Medicare, transporte y un descanso para usted como cuidador.'),
    needs: ['special', 'health', 'transportation', 'food'], flags: ['isCaregiver', 'hasSenior60Plus'],
    facts: [
      { text: t('The Area Agency on Aging (CAPCOG) supports caregivers of adults 60 and older and of anyone with Alzheimer’s or related dementia, including short-term respite.', 'La Agencia del Área para Adultos Mayores (CAPCOG) apoya a cuidadores de adultos de 60 años o más y de personas con Alzheimer o demencia, incluido descanso temporal.'), source: capcog },
    ],
  },
  {
    id: 'small-business', icon: 'store',
    title: t('Start or grow a small business', 'Iniciar o hacer crecer un negocio'),
    summary: t('Free city coaching, business classes, tax basics, and money tools for owners.', 'Asesoría gratuita de la ciudad, clases, conceptos de impuestos y herramientas financieras.'),
    needs: ['financial', 'income'], flags: [],
    facts: [
      { text: t('The City of Austin offers a free BizAid orientation several times a month; it unlocks no-cost, confidential one-on-one coaching.', 'La Ciudad de Austin ofrece una orientación BizAid gratuita varias veces al mes; da acceso a asesoría individual gratuita y confidencial.'), source: bizAid },
    ],
  },
  {
    id: 'newcomer', icon: 'globe',
    title: t('New to Austin or to the U.S.', 'Nuevo en Austin o en EE. UU.'),
    summary: t('Trusted immigration legal help, English classes, a library card, and health care options.', 'Ayuda legal migratoria confiable, clases de inglés, tarjeta de biblioteca y opciones de salud.'),
    needs: ['special', 'education', 'health'], flags: ['isImmigrantOrNewcomer'],
    facts: [
      { text: t('USCIS warns that a “notario público” cannot give immigration legal help. Only an attorney or an accredited representative of a DOJ-recognized organization can.', 'USCIS advierte que un “notario público” no puede dar ayuda legal migratoria. Solo un abogado o un representante acreditado de una organización reconocida por el DOJ puede.'), source: uscis },
    ],
  },
  {
    id: 'foster-youth', icon: 'graduation',
    title: t('Aging out of foster care', 'Saliendo del sistema de cuidado de crianza'),
    summary: t('Free college tuition, money for living costs, housing and a first job.', 'Universidad sin matrícula, dinero para gastos de vida, vivienda y un primer empleo.'),
    needs: ['education', 'housing', 'income'], flags: ['isStudent'],
    facts: [
      { text: t('If you were in DFPS conservatorship the day before you turned 18, Texas state colleges waive tuition and fees if you enroll before age 27.', 'Si estuvo bajo tutela de DFPS el día antes de cumplir 18, las universidades estatales de Texas le eximen de matrícula y cuotas si se inscribe antes de los 27.'), source: waiver },
      { text: t('The Education and Training Voucher gives eligible students up to $5,000 a year for rent, books, childcare, transportation and more.', 'El Vale de Educación y Capacitación da a estudiantes elegibles hasta $5,000 al año para renta, libros, cuidado infantil, transporte y más.'), source: etv },
    ],
  },
  {
    id: 'no-home', icon: 'tent',
    title: t('Without a stable place to stay', 'Sin un lugar estable donde quedarme'),
    summary: t('Shelter, the housing assessment, ID documents, food, and health care.', 'Refugio, la evaluación de vivienda, documentos de identidad, comida y atención médica.'),
    needs: ['housing', 'food', 'health'], flags: ['isHomeless'],
    facts: [
      { text: t('Housing programs for people experiencing homelessness in Austin/Travis County are reached through a Coordinated Assessment at an access point.', 'Los programas de vivienda para personas sin hogar en Austin/Travis se alcanzan mediante una Evaluación Coordinada en un punto de acceso.'), source: echo },
    ],
  },
]
