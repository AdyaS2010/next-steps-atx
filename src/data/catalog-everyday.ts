import { entry, region, source, step, texas, text as t } from './catalog-shared'

// Resources useful to nearly every household, regardless of income.
const tcadUrl = 'https://traviscad.org/protests/'
const tcadPortal = 'https://traviscad.org/portal'
const hoaStatute = 'https://statutes.capitol.texas.gov/Docs/PR/htm/PR.209.htm'
const deedGuide = 'https://texaslawhelp.org/sites/default/files/2022-12/living_with_deed_restrictions.pdf'
const drcUrl = 'https://www.austindrc.org/'
const rebatesUrl = 'https://savings.austinenergy.com/'
const creditUrl = 'https://www.annualcreditreport.com/'
const ftcCreditUrl = 'https://consumer.ftc.gov/articles/free-credit-reports'
const idTheftUrl = 'https://www.identitytheft.gov/'
const freeFileUrl = 'https://www.irs.gov/filing/irs-free-file-do-your-taxes-for-free'
const fafsaUrl = 'https://studentaid.gov/h/apply-for-aid/fafsa'
const national = t('Available nationwide, including Austin and Travis County.', 'Disponible en todo el país, incluidos Austin y el Condado de Travis.')
const anyone = t('Anyone can use this resource. It is not based on income.', 'Cualquier persona puede usar este recurso. No depende de los ingresos.')

export const everydayPrograms = [
  entry({
    id: 'property-tax-protest', name: 'Property Appraisal Protest (Travis Central Appraisal District)', category: 'financial', agency: 'Travis Central Appraisal District (TCAD)',
    provides: t('A formal way for property owners to dispute the appraised value on their Notice of Appraised Value, online, by mail or in person.', 'Un proceso formal para que los propietarios disputen el valor tasado en su Aviso de Valor Tasado, en línea, por correo o en persona.'),
    eligibilitySummary: t('Owners of property appraised by TCAD may protest. TCAD’s deadline is May 15 or 30 days after the notice is mailed, whichever is later.', 'Los dueños de propiedades tasadas por TCAD pueden protestar. El plazo es el 15 de mayo o 30 días después del envío del aviso, lo que ocurra después.'),
    requiresAny: ['isHomeowner'], serviceArea: t('Property located in Travis County.', 'Propiedades ubicadas en el Condado de Travis.'), jurisdiction: 'travis',
    audience: t('Homeowners and other property owners in Travis County.', 'Propietarios de viviendas y otras propiedades en el Condado de Travis.'),
    applicationStatus: 'varies', statusNote: t('Protests follow the yearly notice cycle. Check the date on your notice; this app does not track deadlines for you.', 'Las protestas siguen el ciclo anual de avisos. Revise la fecha de su aviso; esta aplicación no controla plazos por usted.'),
    actionKind: 'apply', screeningNote: t('A protest is not a guarantee of a lower value. This app does not estimate your property value or taxes.', 'Protestar no garantiza un valor menor. Esta aplicación no calcula el valor ni los impuestos de su propiedad.'),
    applyOnlineUrl: tcadPortal, applyPhone: '512-834-9317',
    localHelp: { name: 'TCAD office', address: '850 East Anderson Lane, Austin', phone: '512-834-9317', url: tcadUrl },
    sources: [source('Travis Central Appraisal District: protest deadline, filing methods and online portal', tcadUrl)],
    documents: [t('Your Notice of Appraised Value (it has your owner ID and PIN), plus evidence such as photos of needed repairs or recent sales of similar homes.', 'Su Aviso de Valor Tasado (incluye su ID de propietario y PIN), y pruebas como fotos de reparaciones necesarias o ventas recientes de casas similares.')],
    notes: t('Also check that your homestead exemption is on file; it limits how much the taxable value of a homestead can rise.', 'Revise también que su exención de vivienda principal esté registrada; limita cuánto puede subir el valor gravable.'),
    steps: [
      step('check-notice', t('Review your notice', 'Revise su aviso'), t('Compare the market value and exemptions on your Notice of Appraised Value with your home’s condition and nearby sales.', 'Compare el valor de mercado y las exenciones de su aviso con el estado de su casa y ventas cercanas.')),
      step('file-protest', t('File before the deadline', 'Presente antes del plazo'), t('Use the TCAD online portal with your owner ID and PIN, upload evidence, and review any settlement offer.', 'Use el portal de TCAD con su ID y PIN, suba pruebas y revise cualquier oferta de acuerdo.')),
    ],
  }),
  entry({
    id: 'hoa-rights', name: 'HOA Rights and Deed Restrictions (Texas)', category: 'housing', agency: 'Texas Property Code / TexasLawHelp.org',
    provides: t('Plain-language information about living with deed restrictions and the Texas law that governs property owners’ associations (HOAs).', 'Información sencilla sobre las restricciones de escritura y la ley de Texas que rige las asociaciones de propietarios (HOA).'),
    eligibilitySummary: anyone,
    requiresAny: ['isHomeowner'], serviceArea: texas, jurisdiction: 'texas',
    audience: t('Homeowners dealing with HOA rules, fines, fees or records.', 'Propietarios con reglas, multas, cuotas o registros de una HOA.'),
    applicationStatus: 'varies', statusNote: t('These are published guides and the statute, not an application or a complaint process.', 'Son guías publicadas y la ley, no una solicitud ni un proceso de queja.'),
    actionKind: 'information', screeningNote: t('General legal information, not advice about your HOA. Your association’s dedicatory instruments also matter.', 'Información legal general, no asesoría sobre su HOA. Los documentos de su asociación también importan.'),
    applyOnlineUrl: deedGuide,
    localHelp: { name: 'Dispute Resolution Center (mediation)', phone: '512-371-0033', url: drcUrl },
    sources: [
      source('TexasLawHelp: Living with Deed Restrictions (guide)', deedGuide),
      source('Texas Property Code Chapter 209: Texas Residential Property Owners Protection Act', hoaStatute),
    ],
    documents: [t('Your deed restrictions, HOA bylaws and rules, any violation or fine letters, and payment records.', 'Sus restricciones de escritura, estatutos y reglas de la HOA, cartas de infracción o multas, y registros de pago.')],
    notes: t('Chapter 209 covers topics such as owners’ access to association records, notice before many enforcement actions, and payment plans. Read the statute or ask a lawyer about your situation.', 'El Capítulo 209 trata temas como el acceso a los registros de la asociación, el aviso antes de muchas acciones y los planes de pago. Lea la ley o consulte a un abogado.'),
    steps: [
      step('read-hoa-docs', t('Read your documents and the law', 'Lea sus documentos y la ley'), t('Compare the letter you received with your deed restrictions and the relevant part of Property Code Chapter 209.', 'Compare la carta recibida con sus restricciones de escritura y la parte correspondiente del Capítulo 209.')),
      step('respond-in-writing', t('Respond in writing and keep copies', 'Responda por escrito y guarde copias'), t('Ask for records or a hearing in writing if it applies. Consider mediation before a dispute grows.', 'Pida registros o una audiencia por escrito si corresponde. Considere la mediación antes de que crezca la disputa.')),
    ],
  }),
  entry({
    id: 'dispute-mediation', name: 'Dispute Resolution Center of Austin (Mediation)', category: 'safety', agency: 'Dispute Resolution Center of Austin',
    provides: t('Mediation for civil disputes such as neighbor conflicts, landlord-tenant disagreements, family and divorce matters, and workplace disputes.', 'Mediación de disputas civiles como conflictos entre vecinos, arrendador-inquilino, asuntos familiares y de divorcio, y disputas laborales.'),
    eligibilitySummary: t('The DRC mediates civil, not criminal, matters. Fees range from $50 to $250 per side depending on circumstances.', 'El DRC media asuntos civiles, no penales. Las tarifas van de $50 a $250 por parte según las circunstancias.'),
    serviceArea: region, jurisdiction: 'regional',
    audience: t('Anyone who wants help resolving a civil conflict without going to court first.', 'Cualquier persona que quiera resolver un conflicto civil sin ir primero a la corte.'),
    applicationStatus: 'varies', statusNote: t('Scheduling is handled by a case manager. Both sides must agree to mediate.', 'Un encargado del caso programa la sesión. Ambas partes deben aceptar la mediación.'),
    actionKind: 'appointment', screeningNote: t('Mediation is voluntary and does not replace legal advice or pause a court deadline.', 'La mediación es voluntaria, no reemplaza la asesoría legal ni detiene un plazo judicial.'),
    applyOnlineUrl: drcUrl, applyPhone: '512-371-0033',
    localHelp: { name: 'DRC Spanish line', phone: '512-279-1905', url: drcUrl },
    sources: [source('Dispute Resolution Center of Austin: services, fees and contact', drcUrl)],
    documents: [t('A short written summary of the dispute, key dates, and any letters, leases or agreements involved.', 'Un resumen escrito de la disputa, fechas clave y cartas, contratos o acuerdos relacionados.')],
    notes: t('Useful for HOA and neighbor disagreements, roommate or landlord issues, and co-parenting arrangements.', 'Útil para desacuerdos con la HOA o vecinos, problemas con compañeros de vivienda o arrendadores, y acuerdos de crianza.'),
    steps: [
      step('contact-drc', t('Call or email the DRC', 'Llame o escriba al DRC'), t('Call 512-371-0033 (Spanish: 512-279-1905) or email the center. Describe the dispute and ask about fees.', 'Llame al 512-371-0033 (español: 512-279-1905) o escriba al centro. Describa la disputa y pregunte por las tarifas.')),
      step('prepare-mediation', t('Prepare for the session', 'Prepárese para la sesión'), t('Write down what outcome would work for you and bring your documents.', 'Anote qué resultado le funcionaría y lleve sus documentos.')),
    ],
  }),
  entry({
    id: 'energy-rebates', name: 'Austin Energy Rebates and Incentives', category: 'utilities', agency: 'Austin Energy',
    provides: t('Rebates and incentives for home energy improvements such as efficient air conditioning, water heaters, solar screens and whole-home upgrades.', 'Reembolsos e incentivos para mejoras de energía en el hogar, como aire acondicionado eficiente, calentadores de agua, mallas solares y mejoras integrales.'),
    eligibilitySummary: t('For Austin Energy customers. Funding is limited and first come, first served; some offers require a participating contractor.', 'Para clientes de Austin Energy. Los fondos son limitados y por orden de llegada; algunas ofertas requieren un contratista participante.'),
    serviceArea: t('Austin Energy’s electric service area.', 'El área de servicio eléctrico de Austin Energy.'), jurisdiction: 'austin',
    audience: t('Homeowners and some renters who want lower energy bills.', 'Propietarios y algunos inquilinos que quieren facturas de energía más bajas.'),
    applicationStatus: 'varies', statusNote: t('Offers and funding change. Confirm current rebates before buying equipment.', 'Las ofertas y los fondos cambian. Confirme los reembolsos vigentes antes de comprar equipos.'),
    actionKind: 'apply', screeningNote: t('This app does not estimate rebate amounts or confirm that funding remains.', 'Esta aplicación no calcula reembolsos ni confirma que queden fondos.'),
    applyOnlineUrl: rebatesUrl,
    localHelp: { name: 'Austin Energy rebates portal', url: rebatesUrl },
    sources: [source('Austin Energy: rebates and incentives portal', rebatesUrl)],
    documents: [t('Your Austin Energy account number and, for equipment rebates, contractor quotes and the model numbers you plan to install.', 'Su número de cuenta de Austin Energy y, para equipos, cotizaciones y modelos que planea instalar.')],
    notes: t('If a bill is hard to pay now, also see the Customer Assistance Program (CAP) discounts.', 'Si le cuesta pagar una factura ahora, vea también los descuentos del Programa de Asistencia (CAP).'),
    steps: [
      step('browse-rebates', t('Find the offer that fits', 'Busque la oferta adecuada'), t('Browse residential offers on the Austin Energy rebates portal and read each offer’s requirements.', 'Revise las ofertas residenciales en el portal y lea los requisitos de cada una.')),
      step('use-contractor', t('Confirm before you buy', 'Confirme antes de comprar'), t('Check whether a participating contractor is required and whether funding remains before installing anything.', 'Verifique si se requiere un contratista participante y si quedan fondos antes de instalar.')),
    ],
  }),
  entry({
    id: 'free-credit-reports', name: 'Free Weekly Credit Reports', category: 'financial', agency: 'AnnualCreditReport.com (federally authorized)',
    provides: t('Free credit reports from each of the three nationwide credit bureaus, available once a week.', 'Informes de crédito gratuitos de cada una de las tres agencias nacionales, disponibles una vez por semana.'),
    eligibilitySummary: anyone,
    alwaysShow: false, serviceArea: national, jurisdiction: 'national',
    audience: t('Anyone checking for errors, preparing to rent or borrow, or watching for fraud.', 'Cualquier persona que revise errores, se prepare para rentar o pedir préstamos, o vigile fraudes.'),
    applicationStatus: 'varies', statusNote: t('The FTC reports the bureaus permanently extended free weekly reports.', 'La FTC informa que las agencias extendieron de forma permanente los informes semanales gratuitos.'),
    actionKind: 'information', screeningNote: t('Use only the official site. Reports are free; you do not need to buy a score or a subscription.', 'Use solo el sitio oficial. Los informes son gratuitos; no necesita comprar un puntaje ni una suscripción.'),
    applyOnlineUrl: creditUrl, applyPhone: '1-877-322-8228',
    localHelp: { name: 'FTC: free credit reports', url: ftcCreditUrl },
    sources: [source('FTC: free weekly credit reports and the official site', ftcCreditUrl)],
    documents: [t('Identity verification questions are asked online. Never share your full SSN in response to an unexpected call or text.', 'Se hacen preguntas de verificación en línea. Nunca comparta su número de Seguro Social ante una llamada o texto inesperado.')],
    notes: t('Dispute any error directly with the credit bureau that reported it.', 'Dispute cualquier error directamente con la agencia que lo reportó.'),
    steps: [
      step('pull-reports', t('Pull all three reports', 'Obtenga los tres informes'), t('Request your reports from AnnualCreditReport.com and look for accounts or inquiries you do not recognize.', 'Solicite sus informes en AnnualCreditReport.com y busque cuentas o consultas que no reconozca.')),
      step('dispute-errors', t('Dispute errors', 'Dispute los errores'), t('Contact the bureau that shows the error and keep copies of what you send.', 'Contacte a la agencia que muestra el error y guarde copias de lo que envíe.')),
    ],
  }),
  entry({
    id: 'identity-theft', name: 'Identity Theft Report and Recovery Plan', category: 'safety', agency: 'Federal Trade Commission (IdentityTheft.gov)',
    provides: t('The federal government’s site to report identity theft and get a personalized recovery plan.', 'El sitio del gobierno federal para reportar robo de identidad y obtener un plan de recuperación personalizado.'),
    eligibilitySummary: anyone,
    serviceArea: national, jurisdiction: 'national',
    audience: t('Anyone whose personal information was misused or exposed.', 'Cualquier persona cuya información personal fue usada indebidamente o expuesta.'),
    applicationStatus: 'varies', statusNote: t('Reporting is available online at any time.', 'El reporte está disponible en línea en cualquier momento.'),
    actionKind: 'information', screeningNote: t('This app cannot investigate fraud. Contact your bank or card issuer right away about unauthorized charges.', 'Esta aplicación no investiga fraudes. Contacte a su banco o emisor de tarjeta de inmediato por cargos no autorizados.'),
    applyOnlineUrl: idTheftUrl, applyPhone: '1-877-438-4338',
    localHelp: { name: 'IdentityTheft.gov', url: idTheftUrl },
    sources: [source('FTC: IdentityTheft.gov report and recovery plan', idTheftUrl)],
    documents: [t('Notes about what happened, suspicious accounts, and any letters or statements you received.', 'Notas de lo ocurrido, cuentas sospechosas y cartas o estados de cuenta recibidos.')],
    notes: t('Also pull your free credit reports to check for new accounts.', 'Obtenga también sus informes de crédito gratuitos para buscar cuentas nuevas.'),
    steps: [
      step('report-id-theft', t('Report and get a plan', 'Reporte y obtenga un plan'), t('Go to IdentityTheft.gov, describe what happened, and follow the recovery plan it creates.', 'Vaya a IdentityTheft.gov, describa lo ocurrido y siga el plan de recuperación.')),
      step('secure-accounts', t('Secure your accounts', 'Proteja sus cuentas'), t('Contact affected companies, change passwords, and consider a fraud alert or credit freeze.', 'Contacte a las empresas afectadas, cambie contraseñas y considere una alerta de fraude o congelar su crédito.')),
    ],
  }),
  entry({
    id: 'irs-free-file', name: 'IRS Free File', category: 'financial', agency: 'Internal Revenue Service',
    provides: t('Free federal tax filing through IRS partner software for eligible filers, plus Free File Fillable Forms for any income.', 'Presentación federal gratuita con software asociado del IRS para contribuyentes elegibles, y formularios rellenables gratuitos para cualquier ingreso.'),
    eligibilitySummary: t('Guided software has an income limit set each tax year and partner rules. Fillable Forms have no income limit but no guidance.', 'El software guiado tiene un límite de ingresos anual y reglas de cada socio. Los formularios rellenables no tienen límite, pero no ofrecen guía.'),
    serviceArea: national, jurisdiction: 'national',
    audience: t('People who want to file their own federal return for free.', 'Personas que quieren presentar su declaración federal sin costo.'),
    applicationStatus: 'varies', statusNote: t('Free File opens each filing season. Check the IRS page for dates and this year’s income limit.', 'Free File abre cada temporada. Revise la página del IRS para fechas y el límite de este año.'),
    actionKind: 'information', screeningNote: t('Use the IRS page to reach partners; some offers outside Free File may charge fees.', 'Use la página del IRS para llegar a los socios; algunas ofertas fuera de Free File pueden cobrar.'),
    applyOnlineUrl: freeFileUrl,
    localHelp: { name: 'Free in-person tax help (Foundation Communities)', url: 'https://foundcom.org/austin-tax-help/' },
    sources: [source('IRS: Free File, do your federal taxes for free', freeFileUrl)],
    documents: [t('W-2s, 1099s, last year’s return, and records for credits or deductions you plan to claim.', 'Formularios W-2, 1099, la declaración del año pasado y comprobantes de créditos o deducciones.')],
    notes: t('Texas has no state personal income tax, so most Austin residents file only a federal return.', 'Texas no tiene impuesto estatal sobre ingresos personales; la mayoría en Austin solo presenta la declaración federal.'),
    steps: [
      step('check-free-file', t('Check this year’s options', 'Revise las opciones de este año'), t('Start from the IRS Free File page so you reach genuine free offers, and check the income limit.', 'Empiece en la página de IRS Free File para llegar a ofertas gratuitas reales y revise el límite de ingresos.')),
      step('gather-tax-docs', t('Gather your forms', 'Reúna sus formularios'), t('Collect W-2s, 1099s and records before you start, and keep a copy of what you file.', 'Reúna W-2, 1099 y comprobantes antes de empezar, y guarde una copia de lo que presente.')),
    ],
  }),
  entry({
    id: 'fafsa', name: 'FAFSA: Federal Student Aid', category: 'education', agency: 'U.S. Department of Education',
    provides: t('The application for federal grants, work-study and loans for college or career school. Many colleges and Texas programs also use it.', 'La solicitud de becas federales, estudio-trabajo y préstamos para la universidad o escuela técnica. Muchas universidades y programas de Texas también la usan.'),
    eligibilitySummary: t('Eligibility depends on federal rules, the school and the aid type. Students who cannot file the FAFSA can ask their Texas college about the TASFA.', 'La elegibilidad depende de reglas federales, la escuela y el tipo de ayuda. Quien no pueda llenar la FAFSA puede preguntar en su universidad de Texas por la TASFA.'),
    requiresAny: ['isStudent', 'isWorkingOrTraining'], serviceArea: national, jurisdiction: 'national',
    audience: t('Students and adults planning college or career training, at any income.', 'Estudiantes y adultos que planean estudios o capacitación, con cualquier ingreso.'),
    applicationStatus: 'varies', statusNote: t('The FAFSA is filed for each school year. Schools and states set their own priority deadlines.', 'La FAFSA se presenta para cada año escolar. Las escuelas y estados fijan sus propias fechas prioritarias.'),
    actionKind: 'apply', screeningNote: t('This app does not estimate aid. Only the school’s financial aid office can make an offer.', 'Esta aplicación no calcula ayuda. Solo la oficina de ayuda financiera de la escuela puede hacer una oferta.'),
    applyOnlineUrl: fafsaUrl,
    localHelp: { name: 'ACC student support', url: 'https://students.austincc.edu/care-network-center/' },
    sources: [source('Federal Student Aid: apply for aid with the FAFSA form', fafsaUrl)],
    documents: [t('Tax information for the student (and parents, if dependent), and an account (StudentAid.gov ID) for each person who must sign.', 'Información fiscal del estudiante (y padres, si es dependiente) y una cuenta StudentAid.gov para cada persona que debe firmar.')],
    notes: t('File even if you think your income is too high; some aid and many scholarships still require it.', 'Preséntela aunque crea que sus ingresos son altos; algunas ayudas y muchas becas la exigen.'),
    steps: [
      step('create-fsa-id', t('Create your StudentAid.gov account', 'Cree su cuenta StudentAid.gov'), t('Each person who must sign needs their own account.', 'Cada persona que debe firmar necesita su propia cuenta.')),
      step('submit-fafsa', t('Submit and list your schools', 'Envíe y agregue sus escuelas'), t('Complete the FAFSA, list every school you are considering, and check each school’s deadline.', 'Complete la FAFSA, agregue cada escuela que considera y revise sus fechas límite.')),
    ],
  }),
]
