import { entry, source, step, texas, text as t } from './catalog-shared'

const clearOrSeal = 'https://texaslawhelp.org/article/clear-or-seal-your-record-expunctions-vs-nondisclosures-in-texas'
const nondisclosure = 'https://texaslawhelp.org/article/nondisclosure-orders-and-sealing-your-criminal-record-in-texas'
const fairChance = 'https://www.austintexas.gov/department/fair-chance-hiring'
const dpsReinstate = 'https://www.dps.texas.gov/section/driver-license/reinstating-your-driver-license-or-driving-privilege'
const dpsFees = 'https://www.dps.texas.gov/section/driver-license/faq/section-7-reinstatement-fees'
const eligibilityUrl = 'https://texas.gov/licenseeligibility'
const waiverUrl = 'https://www.dfps.texas.gov/Child_Protection/Youth_and_Young_Adults/Education/state_college_tuition_waiver.asp'
const etvUrl = 'https://www.dfps.texas.gov/Child_Protection/Youth_and_Young_Adults/Education/ETV.asp'
const bizAidUrl = 'https://www.austintexas.gov/department/bizaid-business-orientation'
const coachingUrl = 'https://www.austintexas.gov/economic-development/programs/small-business-coaching'
const austin = t('City of Austin.', 'Ciudad de Austin.')

// Second-chance and fresh-start resources: records, licenses, foster youth and small business.
export const freshStartPrograms = [
  entry({
    id: 'record-clearing', name: 'Clear or Seal a Criminal Record (Expunction and Nondisclosure)', category: 'safety', agency: 'TexasLawHelp.org / Volunteer Legal Services',
    provides: t('Plain-language guides and forms to check whether an arrest or case can be cleared (expunction) or sealed from public view (nondisclosure) in Texas.', 'Guías y formularios sencillos para saber si un arresto o caso puede borrarse (expunción) o sellarse del público (no divulgación) en Texas.'),
    eligibilitySummary: t('Rules depend on the offense and how the case ended. Expunction is very limited; nondisclosure can require a waiting period of 180 days to five years and is not available for offenses the court found involved family violence.', 'Las reglas dependen del delito y de cómo terminó el caso. La expunción es muy limitada; la no divulgación puede requerir una espera de 180 días a cinco años y no aplica a delitos con violencia familiar según el tribunal.'),
    serviceArea: texas, jurisdiction: 'texas',
    audience: t('People whose past arrest or case is holding back work, housing or school.', 'Personas cuyo arresto o caso pasado limita su trabajo, vivienda o estudios.'),
    applicationStatus: 'varies', statusNote: t('Petitions are filed with a court. Filing fees apply unless you qualify to file a statement of inability to afford costs.', 'Las peticiones se presentan en un tribunal. Hay cuotas, salvo que califique para declarar que no puede pagarlas.'),
    actionKind: 'information', screeningNote: t('General legal information only. A lawyer or legal aid office can check your record and eligibility.', 'Solo información legal general. Un abogado o asistencia legal puede revisar su historial y elegibilidad.'),
    applyOnlineUrl: clearOrSeal,
    localHelp: { name: 'Volunteer Legal Services (expunctions and nondisclosures)', phone: '512-476-5550', url: 'https://www.vlsoct.org/get-help/' },
    sources: [
      source('TexasLawHelp: Clear or seal your record? Expunctions vs. nondisclosures', clearOrSeal),
      source('TexasLawHelp: Nondisclosure orders and sealing your criminal record', nondisclosure),
    ],
    documents: [t('Case numbers, the court and county, dates, and the final outcome (dismissal, deferred adjudication, conviction). A copy of your criminal history helps.', 'Números de caso, tribunal y condado, fechas y el resultado final (desestimación, adjudicación diferida, condena). Una copia de sus antecedentes ayuda.')],
    notes: t('Nondisclosure hides a record from the public, but criminal justice and licensing agencies may still see it.', 'La no divulgación oculta el registro al público, pero las agencias de justicia y de licencias aún pueden verlo.'),
    steps: [
      step('learn-clear-seal', t('Learn which option might fit', 'Vea qué opción podría aplicar'), t('Read TexasLawHelp’s comparison of expunction and nondisclosure and note how each of your cases ended.', 'Lea la comparación de TexasLawHelp y anote cómo terminó cada caso.')),
      step('get-record-help', t('Ask for free legal help', 'Pida ayuda legal gratuita'), t('Volunteer Legal Services handles expunctions and nondisclosures for eligible clients. Apply online or call 512-476-5550.', 'Volunteer Legal Services atiende expunciones y no divulgaciones para clientes elegibles. Solicite en línea o llame al 512-476-5550.')),
    ],
  }),
  entry({
    id: 'fair-chance-hiring', name: 'Austin Fair Chance Hiring (Ban the Box)', category: 'income', agency: 'City of Austin Office of Civil Rights',
    provides: t('Information about Austin’s ordinance that stops many private employers from asking about criminal history until after a conditional job offer, and how to file a complaint.', 'Información sobre la ordenanza de Austin que impide a muchos empleadores privados preguntar por antecedentes penales hasta después de una oferta condicional, y cómo presentar una queja.'),
    eligibilitySummary: t('Applies to private employers with 15 or more employees. Complaints must be filed within 90 days of discovering a violation.', 'Aplica a empleadores privados con 15 o más empleados. Las quejas deben presentarse dentro de 90 días de descubrir la infracción.'),
    serviceArea: austin, jurisdiction: 'austin',
    audience: t('Job seekers with a past arrest or conviction.', 'Personas que buscan empleo con un arresto o condena en el pasado.'),
    applicationStatus: 'varies', statusNote: t('The Office of Civil Rights receives and investigates complaints.', 'La Oficina de Derechos Civiles recibe e investiga las quejas.'),
    actionKind: 'information', screeningNote: t('Some jobs are exempt. This app cannot decide whether an employer broke the rule.', 'Algunos empleos están exentos. Esta aplicación no puede decidir si un empleador infringió la regla.'),
    applyOnlineUrl: fairChance,
    localHelp: { name: 'City of Austin Office of Civil Rights', url: fairChance },
    sources: [source('City of Austin: Fair Chance Hiring ordinance and complaints', fairChance)],
    documents: [t('Keep job postings, applications and any messages that asked about criminal history, with dates.', 'Guarde anuncios, solicitudes y mensajes que preguntaron por antecedentes, con fechas.')],
    notes: t('Pair this with the career builder’s interview practice on explaining your background with confidence.', 'Combínelo con la práctica de entrevistas para explicar su historia con confianza.'),
    steps: [
      step('know-fair-chance', t('Know your rights', 'Conozca sus derechos'), t('Read the City’s Fair Chance Hiring page before you apply to jobs in Austin.', 'Lea la página de Contratación Justa de la Ciudad antes de solicitar empleos en Austin.')),
      step('report-fair-chance', t('Report a violation', 'Reporte una infracción'), t('If a covered employer asks too early, contact the Office of Civil Rights within 90 days.', 'Si un empleador cubierto pregunta antes de tiempo, contacte a la Oficina de Derechos Civiles dentro de 90 días.')),
    ],
  }),
  entry({
    id: 'license-reinstatement', name: 'Reinstate a Texas Driver License', category: 'transportation', agency: 'Texas Department of Public Safety',
    provides: t('The official online system to see why a license is suspended, what is needed to reinstate it, and to pay reinstatement fees.', 'El sistema oficial en línea para ver por qué está suspendida una licencia, qué se necesita para restablecerla y pagar las cuotas.'),
    eligibilitySummary: t('Requirements depend on the suspension. DPS lists reinstatement fees such as $100 for many suspensions and $125 for administrative license revocations, plus other compliance items.', 'Los requisitos dependen de la suspensión. DPS indica cuotas como $100 para muchas suspensiones y $125 para revocaciones administrativas, además de otros requisitos.'),
    serviceArea: texas, jurisdiction: 'texas',
    audience: t('Texans whose license is suspended, revoked or denied.', 'Personas en Texas con licencia suspendida, revocada o denegada.'),
    applicationStatus: 'varies', statusNote: t('DPS says online payments are applied quickly; processing can take 24–48 hours.', 'DPS indica que los pagos en línea se aplican rápido; el trámite puede tardar 24–48 horas.'),
    actionKind: 'apply', screeningNote: t('Court holds (like unpaid tickets) are handled by the court, not DPS. Ask the court what options it offers if you cannot pay.', 'Los bloqueos judiciales (como multas sin pagar) los maneja el tribunal, no DPS. Pregunte al tribunal qué opciones ofrece si no puede pagar.'),
    applyOnlineUrl: eligibilityUrl,
    localHelp: { name: 'Texas DPS: reinstating your license', url: dpsReinstate },
    sources: [source('Texas DPS: reinstating your driver license or driving privilege', dpsReinstate), source('Texas DPS: reinstatement fees FAQ', dpsFees)],
    documents: [t('Your driver license number, date of birth and the last four digits of your SSN for the eligibility system; any court releases or SR-22 proof it asks for.', 'Su número de licencia, fecha de nacimiento y últimos cuatro dígitos del SSN; y documentos de la corte o SR-22 que se pidan.')],
    notes: t('A valid license can open delivery, driving and CDL jobs; see the career builder’s driving track.', 'Una licencia válida abre empleos de reparto, manejo y CDL; vea la ruta de manejo del creador de carrera.'),
    steps: [
      step('check-eligibility', t('Check your eligibility online', 'Revise su elegibilidad en línea'), t('Use the Texas License Eligibility system to see every item blocking your license.', 'Use el sistema de elegibilidad de Texas para ver cada requisito pendiente.')),
      step('clear-items', t('Clear each item', 'Resuelva cada requisito'), t('Pay DPS fees online, and contact any listed court about holds and payment options.', 'Pague las cuotas de DPS en línea y contacte a cada tribunal indicado por bloqueos y opciones de pago.')),
    ],
  }),
  entry({
    id: 'foster-youth-education', name: 'College Tuition Waiver and ETV for Foster Youth', category: 'education', agency: 'Texas Department of Family and Protective Services',
    provides: t('A Texas tuition and fee waiver at state colleges and universities, plus the Education and Training Voucher (up to $5,000 a year) for costs like rent, books, childcare and transportation.', 'Una exención de matrícula y cuotas en universidades estatales de Texas, y el Vale de Educación y Capacitación (hasta $5,000 al año) para renta, libros, cuidado infantil y transporte.'),
    eligibilitySummary: t('The waiver is for youth in DFPS conservatorship the day before their 18th birthday (and certain adopted youth) who enroll before age 27. ETV serves eligible students ages 16 up to 23.', 'La exención es para jóvenes bajo tutela de DFPS el día antes de cumplir 18 (y ciertos adoptados) que se inscriben antes de los 27. ETV atiende a estudiantes elegibles de 16 a 23 años.'),
    serviceArea: texas, jurisdiction: 'texas',
    audience: t('Current and former Texas foster youth.', 'Jóvenes que están o estuvieron en cuidado de crianza en Texas.'),
    applicationStatus: 'varies', statusNote: t('Eligibility letters come from DFPS; each college applies the waiver.', 'DFPS emite las cartas de elegibilidad; cada universidad aplica la exención.'),
    actionKind: 'apply', screeningNote: t('This app does not confirm foster care history. DFPS verifies eligibility.', 'Esta aplicación no confirma el historial de cuidado de crianza. DFPS verifica la elegibilidad.'),
    applyOnlineUrl: waiverUrl,
    localHelp: { name: 'DFPS Education and Training Voucher', url: etvUrl },
    sources: [source('DFPS: state college tuition and fee waiver', waiverUrl), source('DFPS: Education and Training Voucher (ETV) program', etvUrl)],
    documents: [t('Your DFPS tuition waiver eligibility letter, college acceptance and FAFSA or TASFA.', 'Su carta de elegibilidad de DFPS, la aceptación de la universidad y la FAFSA o TASFA.')],
    notes: t('Preparation for Adult Living (PAL) also offers life skills training and transitional support; the waiver does not require PAL participation.', 'Preparación para la Vida Adulta (PAL) ofrece capacitación y apoyo de transición; la exención no requiere participar en PAL.'),
    steps: [
      step('request-waiver-letter', t('Request your waiver letter', 'Pida su carta de exención'), t('Ask your caseworker, PAL staff or DFPS for the tuition waiver eligibility letter.', 'Pídala a su trabajador social, al personal de PAL o a DFPS.')),
      step('apply-etv', t('Apply for ETV', 'Solicite ETV'), t('Apply for the Education and Training Voucher to help with living costs while in school.', 'Solicite el Vale de Educación y Capacitación para gastos de vida mientras estudia.')),
    ],
  }),
  entry({
    id: 'small-business', name: 'Austin Small Business Classes and Free Coaching', category: 'financial', agency: 'City of Austin Economic Development (Small Business Division)',
    provides: t('A free BizAid orientation to local business resources, low-cost classes, and no-cost, confidential one-on-one business coaching.', 'Una orientación gratuita BizAid sobre recursos locales, clases de bajo costo y asesoría empresarial individual gratuita y confidencial.'),
    eligibilitySummary: t('For people starting or running a business in Austin. BizAid orientation is required before one-on-one coaching.', 'Para quienes inician o dirigen un negocio en Austin. La orientación BizAid es requisito para la asesoría individual.'),
    serviceArea: austin, jurisdiction: 'austin',
    audience: t('New and existing small business owners, including home and side businesses.', 'Dueños de negocios nuevos y existentes, incluidos negocios en casa y adicionales.'),
    applicationStatus: 'varies', statusNote: t('BizAid is offered several times a month, virtually and in person.', 'BizAid se ofrece varias veces al mes, en línea y en persona.'),
    actionKind: 'appointment', screeningNote: t('This app does not give tax or legal advice for your business.', 'Esta aplicación no da asesoría fiscal ni legal para su negocio.'),
    applyOnlineUrl: bizAidUrl,
    localHelp: { name: 'Small business coaching', url: coachingUrl },
    sources: [source('City of Austin: BizAid business orientation', bizAidUrl), source('City of Austin: small business coaching', coachingUrl)],
    documents: [t('A short description of your business idea or current business, and any questions about permits, taxes or funding.', 'Una breve descripción de su idea o negocio, y sus preguntas sobre permisos, impuestos o financiamiento.')],
    notes: t('An IRS Employer Identification Number (EIN) is free from the IRS; be cautious of sites that charge for it.', 'El Número de Identificación Patronal (EIN) del IRS es gratuito; tenga cuidado con sitios que cobran por él.'),
    steps: [
      step('attend-bizaid', t('Attend BizAid', 'Asista a BizAid'), t('Register for a free BizAid orientation, online or in person.', 'Inscríbase en una orientación gratuita BizAid, en línea o en persona.')),
      step('book-coaching', t('Book free coaching', 'Reserve asesoría gratuita'), t('After BizAid, request one-on-one coaching on your plan, permits, marketing or funding.', 'Después de BizAid, solicite asesoría sobre su plan, permisos, mercadeo o financiamiento.')),
    ],
  }),
]
