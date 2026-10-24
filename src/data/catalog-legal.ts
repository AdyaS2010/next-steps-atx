import { entry, region, source, step, texas, text as t } from './catalog-shared'

const safeUrl = 'https://www.safeaustin.org/get-help/'
const safeLegalUrl = 'https://www.safeaustin.org/our-services/face-to-face-support/legal-services/'
const vlsUrl = 'https://www.vlsoct.org/get-help/'
const evictionUrl = 'https://texaslawhelp.org/article/eviction'
const answerUrl = 'https://texaslawhelp.org/guide/eviction-answer-and-defense-guide'
const appealUrl = 'https://texaslawhelp.org/article/appealing-an-eviction'
const lawLibraryUrl = 'https://lawlibrary.traviscountytx.gov/eviction-appeal'

// Legal information here is general and sourced; it is not legal advice for a specific case.
export const legalPrograms = [
  entry({
    id: 'safe-alliance', name: 'The SAFE Alliance SAFEline', category: 'safety', agency: 'The SAFE Alliance',
    provides: t('A 24/7 confidential line for people affected by domestic violence, sexual assault, sex trafficking or child abuse, with connections to shelter, counseling, advocacy and legal services.', 'Una línea confidencial 24/7 para personas afectadas por violencia doméstica, agresión sexual, trata o abuso infantil, con conexión a refugio, consejería, apoyo y servicios legales.'),
    eligibilitySummary: t('The SAFEline is a starting point for anyone affected by abuse. Shelter, counseling and legal services have separate intake and capacity.', 'La SAFEline es un punto de partida para cualquier persona afectada por abuso. El refugio, la consejería y los servicios legales tienen recepción y capacidad propias.'),
    serviceArea: t('Based in Austin; ask the SAFEline about Travis County and other local options.', 'Con sede en Austin; pregunte en la SAFEline por opciones en Travis y otras zonas.'), jurisdiction: 'regional',
    audience: t('Survivors of abuse, and people helping someone they are worried about.', 'Sobrevivientes de abuso y personas que ayudan a alguien que les preocupa.'),
    applicationStatus: 'varies', statusNote: t('The provider publishes a 24/7 line. Shelter space, counseling and legal help depend on staff assessment and capacity.', 'El proveedor publica una línea 24/7. El refugio, la consejería y la ayuda legal dependen de la evaluación y la capacidad.'),
    actionKind: 'referral', screeningNote: t('Do not wait for a benefits result to seek safety support. This app cannot assess danger. Call 911 if you are in immediate danger and it is safe to call.', 'No espere un resultado de beneficios para buscar apoyo. Esta aplicación no evalúa el peligro. Llame al 911 si está en peligro inmediato y puede hacerlo con seguridad.'),
    applyOnlineUrl: safeUrl, applyPhone: '512-267-7233',
    localHelp: { name: 'SAFE legal services', url: safeLegalUrl },
    sources: [source('The SAFE Alliance: get help, SAFEline phone, text and chat', safeUrl), source('The SAFE Alliance: legal services', safeLegalUrl)],
    documents: [t('Reach out without gathering paperwork first. If it is safe, an advocate can explain which records help with a protective order or housing.', 'Comuníquese sin reunir documentos primero. Si es seguro, una persona de apoyo puede explicar qué ayuda para una orden de protección o vivienda.')],
    notes: t('The provider also lists text (send SAFE to 737-888-7233) and online chat. If your phone or computer may be monitored, use a safer device and clear this browser’s history.', 'El proveedor también ofrece texto (envíe SAFE al 737-888-7233) y chat. Si su teléfono o computadora puede estar vigilado, use otro dispositivo y borre el historial.'),
    steps: [
      step('contact-safeline', t('Contact the SAFEline when it is safe', 'Contacte la SAFEline cuando sea seguro'), t('Call 512-267-7233, text SAFE to 737-888-7233, or use the chat on the official site. Tell the advocate if you need another language.', 'Llame al 512-267-7233, envíe SAFE al 737-888-7233 o use el chat del sitio oficial. Diga si necesita otro idioma.')),
      step('plan-safety', t('Make a safety plan with an advocate', 'Haga un plan de seguridad con una persona de apoyo'), t('Ask about shelter, counseling, and legal help such as protective orders. Decide together what is safe to keep on your phone.', 'Pregunte por refugio, consejería y ayuda legal como órdenes de protección. Decidan juntos qué es seguro guardar en su teléfono.')),
    ],
  }),
  entry({
    id: 'volunteer-legal-services', name: 'Volunteer Legal Services of Central Texas', category: 'safety', agency: 'Volunteer Legal Services of Central Texas (VLS)',
    provides: t('Free civil legal advice, clinics and possible representation from volunteer attorneys, including landlord-tenant, employment, consumer, family, wills and expunction matters.', 'Asesoría legal civil gratuita, clínicas y posible representación por abogados voluntarios, incluidos casos de inquilinos, empleo, consumo, familia, testamentos y borrado de antecedentes.'),
    eligibilitySummary: t('VLS considers household income, assets, service area, the legal matter and its capacity. It does not handle criminal, immigration or civil rights cases.', 'VLS considera ingresos, bienes, área de servicio, el asunto legal y su capacidad. No atiende casos penales, de inmigración ni de derechos civiles.'),
    serviceArea: region, jurisdiction: 'regional',
    audience: t('People with low income facing a civil legal problem.', 'Personas de bajos ingresos con un problema legal civil.'),
    applicationStatus: 'varies', statusNote: t('Applying does not guarantee advice or representation. Capacity varies; contact VLS about any court deadline.', 'Solicitar no garantiza asesoría ni representación. La capacidad varía; informe a VLS de cualquier plazo judicial.'),
    actionKind: 'apply', screeningNote: t('This app does not give legal advice or decide whether VLS can take your case.', 'Esta aplicación no da asesoría legal ni decide si VLS puede tomar su caso.'),
    applyOnlineUrl: vlsUrl, applyPhone: '512-476-5550',
    localHelp: { name: 'VLS office (1812 Centre Creek Drive, Suite 215)', phone: '512-476-5550', url: vlsUrl },
    sources: [source('Volunteer Legal Services of Central Texas: get help and eligibility', vlsUrl)],
    documents: [t('Have any court papers, notices, lease or contract, and income information nearby when you apply. Ask VLS what else they need.', 'Tenga a mano papeles judiciales, avisos, contrato y datos de ingresos al solicitar. Pregunte a VLS qué más necesita.')],
    notes: t('If you have a court date, say so first. Applying for help does not pause a court deadline.', 'Si tiene una fecha en la corte, dígalo primero. Solicitar ayuda no detiene un plazo judicial.'),
    steps: [
      step('apply-vls', t('Apply online or by phone', 'Solicite en línea o por teléfono'), t('Use the official VLS get-help page or call 512-476-5550. Describe the legal problem and any dates on your papers.', 'Use la página oficial de VLS o llame al 512-476-5550. Describa el problema y las fechas de sus papeles.')),
      step('keep-deadlines', t('Keep your own deadlines', 'Cumpla sus propios plazos'), t('Until a lawyer tells you otherwise, attend every hearing and meet every court deadline on your papers.', 'Hasta que un abogado le diga otra cosa, asista a cada audiencia y cumpla cada plazo de sus papeles.')),
    ],
  }),
  entry({
    id: 'eviction-legal-info', name: 'Texas Eviction Guides and Court Forms', category: 'housing', agency: 'TexasLawHelp.org / Travis County Law Library',
    provides: t('Free plain-language guides to the Texas eviction process, answering an eviction case, appealing a judgment, and Travis County appeal forms.', 'Guías gratuitas y sencillas sobre el desalojo en Texas, cómo responder a un caso, apelar una sentencia y formularios de apelación del Condado de Travis.'),
    eligibilitySummary: t('Anyone can read the guides. They are general legal information, not advice about your case.', 'Cualquier persona puede leer las guías. Son información legal general, no asesoría sobre su caso.'),
    requiresAny: ['isRenter', 'isHomeless'], serviceArea: texas, jurisdiction: 'texas',
    audience: t('Texas renters who received a notice to vacate or eviction court papers.', 'Inquilinos en Texas que recibieron un aviso de desalojo o papeles de la corte.'),
    applicationStatus: 'varies', statusNote: t('These are published guides and forms, not an application. Court procedures can change; confirm with the court or a lawyer.', 'Son guías y formularios publicados, no una solicitud. Los procedimientos pueden cambiar; confirme con la corte o un abogado.'),
    actionKind: 'information', screeningNote: t('General information only. Timelines described here come from the cited guides and may not fit every case.', 'Solo información general. Los plazos descritos vienen de las guías citadas y pueden no aplicar a todos los casos.'),
    applyOnlineUrl: evictionUrl,
    localHelp: { name: 'Travis County Law Library: eviction appeals', url: lawLibraryUrl },
    sources: [
      source('TexasLawHelp: Eviction (notice to vacate, hearing timing, missing a hearing)', evictionUrl),
      source('TexasLawHelp: Eviction Answer and Defense Guide', answerUrl),
      source('TexasLawHelp: Appealing an Eviction (five-day deadline)', appealUrl),
      source('Travis County Law Library: eviction appeal from Justice Court to County Court', lawLibraryUrl),
    ],
    documents: [t('Keep your lease, every notice, rent receipts or payment records, photos of repair problems, and all court papers together.', 'Guarde juntos su contrato, cada aviso, recibos o registros de pago, fotos de problemas de reparación y todos los papeles de la corte.')],
    notes: t('TexasLawHelp says notice to vacate is three days unless the lease says otherwise, most hearings happen 10–21 days after the landlord files, and an appeal must be filed within five days after the judgment is signed (weekends and holidays count). Missing the hearing usually means losing the case.', 'TexasLawHelp indica que el aviso para desocupar es de tres días salvo que el contrato diga otra cosa, la mayoría de las audiencias ocurren 10–21 días después de la demanda y la apelación debe presentarse dentro de cinco días tras la sentencia (cuentan fines de semana y feriados). Faltar a la audiencia suele significar perder el caso.'),
    steps: [
      step('read-eviction-guide', t('Understand where you are in the process', 'Entienda en qué etapa está'), t('Compare your papers with the TexasLawHelp eviction guide: a notice to vacate is not a court order, and only a judge can order an eviction.', 'Compare sus papeles con la guía de TexasLawHelp: un aviso para desocupar no es una orden judicial y solo un juez puede ordenar un desalojo.')),
      step('go-to-hearing', t('Go to the hearing', 'Vaya a la audiencia'), t('Write down the hearing date on your citation and attend. Bring your lease, notices, payment records and any photos.', 'Anote la fecha de la audiencia en su citatorio y asista. Lleve su contrato, avisos, pagos y fotos.')),
      step('ask-legal-help-eviction', t('Contact free legal help right away', 'Contacte ayuda legal gratuita de inmediato'), t('Call Texas RioGrande Legal Aid or Volunteer Legal Services as soon as you get papers. Ask about the five-day appeal deadline if a judgment was signed.', 'Llame a Texas RioGrande Legal Aid o Volunteer Legal Services en cuanto reciba papeles. Pregunte por el plazo de apelación de cinco días si ya hay sentencia.')),
    ],
  }),
]
