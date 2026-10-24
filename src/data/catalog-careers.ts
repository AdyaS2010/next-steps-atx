import { entry, region, source, step, texas, text as t } from './catalog-shared'

const capitalIdeaEligibility = 'https://www.capitalidea.org/eligibility/'
const capitalIdeaApply = 'https://www.capitalidea.org/how-to-apply/'
const skillpointUrl = 'https://skillpointalliance.org/application/'
const goodwillUrl = 'https://www.goodwillcentraltexas.org/programs-and-services/workforce-advancement/'
const aplLearningUrl = 'https://library.austintexas.gov/digital/online-learning'
const workInTexasUrl = 'https://www.workintexas.com/'

export const careerPrograms = [
  entry({
    id: 'capital-idea', name: 'Capital IDEA: Free College for Careers', category: 'education', agency: 'Capital IDEA',
    provides: t('Free tuition, textbooks and fees plus coaching for careers in nursing and healthcare, IT and cybersecurity, and skilled trades. Child care assistance is available.', 'Matrícula, libros y cuotas gratuitos con acompañamiento para carreras en enfermería y salud, TI y ciberseguridad, y oficios. Hay ayuda con cuidado infantil.'),
    eligibilitySummary: t('For working adults living in Bastrop, Caldwell, Hays, Travis or Williamson County. Income-based rules apply; use the provider’s eligibility checker.', 'Para adultos que trabajan y viven en Bastrop, Caldwell, Hays, Travis o Williamson. Aplican reglas de ingresos; use el verificador del proveedor.'),
    serviceArea: t('Bastrop, Caldwell, Hays, Travis and Williamson counties.', 'Condados de Bastrop, Caldwell, Hays, Travis y Williamson.'), jurisdiction: 'regional',
    audience: t('Working adults ready for a longer training program toward a career.', 'Adultos que trabajan y están listos para un programa de formación más largo.'),
    applicationStatus: 'varies', statusNote: t('The provider runs information sessions and an application process. Acceptance is not guaranteed.', 'El proveedor ofrece sesiones informativas y un proceso de solicitud. La aceptación no está garantizada.'),
    actionKind: 'apply', screeningNote: t('This app does not determine eligibility. Capital IDEA reviews income and other criteria.', 'Esta aplicación no determina la elegibilidad. Capital IDEA revisa ingresos y otros criterios.'),
    applyOnlineUrl: capitalIdeaApply, applyPhone: '512-457-8610',
    localHelp: { name: 'Capital IDEA office', address: '835 N. Pleasant Valley Rd, 3rd Floor, Austin', phone: '512-457-8610', url: capitalIdeaEligibility },
    sources: [source('Capital IDEA: eligibility checker and careers', capitalIdeaEligibility), source('Capital IDEA: how to apply', capitalIdeaApply)],
    documents: [t('Ask Capital IDEA which income, residency and education records the application needs.', 'Pregunte a Capital IDEA qué comprobantes de ingresos, residencia y estudios necesita.')],
    notes: t('Start with an information session to learn which career tracks are open.', 'Empiece con una sesión informativa para saber qué carreras están abiertas.'),
    steps: [
      step('check-capital-idea', t('Check eligibility', 'Verifique la elegibilidad'), t('Use the eligibility checker on the official site or call 512-457-8610.', 'Use el verificador del sitio oficial o llame al 512-457-8610.')),
      step('attend-info-session', t('Attend an information session', 'Asista a una sesión informativa'), t('Sessions explain career tracks, time commitment and the application steps.', 'Las sesiones explican las carreras, el tiempo requerido y los pasos para solicitar.')),
    ],
  }),
  entry({
    id: 'skillpoint-alliance', name: 'Skillpoint Alliance: Free Trades Training', category: 'education', agency: 'Skillpoint Alliance',
    provides: t('Free, short, intensive training (about 4–8 weeks) for electrical and plumbing pre-apprenticeship, HVAC technician and manufacturing technician careers.', 'Capacitación gratuita, corta e intensiva (unas 4–8 semanas) en preaprendizaje eléctrico y de plomería, técnico de HVAC y técnico de manufactura.'),
    eligibilitySummary: t('Serves Greater Austin residents, including Travis, Williamson and Hays counties. Program requirements vary by track.', 'Atiende a residentes del área de Austin, incluidos Travis, Williamson y Hays. Los requisitos varían por programa.'),
    serviceArea: region, jurisdiction: 'regional',
    audience: t('Adults who want a fast path into skilled trades.', 'Adultos que buscan un camino rápido hacia los oficios.'),
    applicationStatus: 'varies', statusNote: t('Classes run year-round; start dates and seats vary.', 'Las clases son todo el año; las fechas y cupos varían.'),
    actionKind: 'apply', screeningNote: t('This app does not confirm a seat. The provider reviews each application.', 'Esta aplicación no confirma un cupo. El proveedor revisa cada solicitud.'),
    applyOnlineUrl: skillpointUrl, applyPhone: '512-323-6773',
    localHelp: { name: 'Skillpoint Alliance Austin', address: '8868 Research Blvd, Suite 505, Austin', phone: '512-323-6773', url: skillpointUrl },
    sources: [source('Skillpoint Alliance: free training programs and application', skillpointUrl)],
    documents: [t('Ask the provider which ID, education and eligibility records the application needs.', 'Pregunte al proveedor qué identificación, estudios y comprobantes necesita.')],
    notes: t('Skillpoint Alliance is a Texas Workforce Commission eligible training provider.', 'Skillpoint Alliance es un proveedor de capacitación aprobado por la Comisión de la Fuerza Laboral de Texas.'),
    steps: [
      step('pick-trade', t('Choose a trade', 'Elija un oficio'), t('Compare electrical, plumbing, HVAC and manufacturing tracks on the official site.', 'Compare los programas de electricidad, plomería, HVAC y manufactura en el sitio oficial.')),
      step('apply-skillpoint', t('Apply online or by phone', 'Solicite en línea o por teléfono'), t('Submit the online application or call 512-323-6773 to ask about the next start date.', 'Envíe la solicitud en línea o llame al 512-323-6773 para preguntar por la próxima fecha.')),
    ],
  }),
  entry({
    id: 'goodwill-careers', name: 'Goodwill Central Texas: Career Coaching and Training', category: 'income', agency: 'Goodwill Central Texas',
    provides: t('One-on-one career coaching, interview practice, job readiness classes, training certifications and resume reviews, plus fast-track technical training and a free adult high school.', 'Asesoría profesional individual, práctica de entrevistas, clases de preparación laboral, certificaciones y revisión de currículum, además de formación técnica rápida y una preparatoria gratuita para adultos.'),
    eligibilitySummary: t('Program rules differ. Ask Goodwill which services fit your goals and circumstances.', 'Las reglas varían por programa. Pregunte a Goodwill qué servicios se ajustan a sus metas.'),
    serviceArea: region, jurisdiction: 'regional',
    audience: t('Job seekers who want coaching, a credential, or a high school diploma.', 'Personas que buscan empleo y quieren asesoría, una credencial o un diploma de preparatoria.'),
    applicationStatus: 'varies', statusNote: t('Services and class schedules vary by location.', 'Los servicios y horarios varían por sede.'),
    actionKind: 'referral', screeningNote: t('This app does not enroll you. Contact Goodwill to confirm services.', 'Esta aplicación no le inscribe. Contacte a Goodwill para confirmar servicios.'),
    applyOnlineUrl: goodwillUrl,
    localHelp: { name: 'Goodwill Workforce Advancement', url: goodwillUrl },
    sources: [source('Goodwill Central Texas: workforce advancement services', goodwillUrl)],
    documents: [t('Bring a current resume if you have one, or a list of past jobs and dates.', 'Lleve su currículum si lo tiene, o una lista de trabajos anteriores y fechas.')],
    notes: t('Goodwill also runs The Excel Center, a free high school for adults.', 'Goodwill también opera The Excel Center, una preparatoria gratuita para adultos.'),
    steps: [
      step('contact-goodwill', t('Request career coaching', 'Solicite asesoría profesional'), t('Use the Workforce Advancement page to connect with a career coach.', 'Use la página de Workforce Advancement para conectarse con un asesor.')),
      step('choose-goodwill-training', t('Pick a next step together', 'Elijan juntos el siguiente paso'), t('Ask about certifications, technical training or finishing high school.', 'Pregunte por certificaciones, formación técnica o terminar la preparatoria.')),
    ],
  }),
  entry({
    id: 'library-learning', name: 'Free Online Courses and Job Coaching with a Library Card', category: 'education', agency: 'Austin Public Library',
    provides: t('With an Austin Public Library card: thousands of Udemy video courses, live online job coaching and resume help (JobNow), practice tests for professional exams, language learning, and driver and CDL permit practice tests.', 'Con la tarjeta de la Biblioteca Pública de Austin: miles de cursos de Udemy, asesoría laboral y de currículum en vivo (JobNow), exámenes de práctica profesionales, idiomas y prácticas para permisos de manejo y CDL.'),
    eligibilitySummary: t('Requires an Austin Public Library card. Card rules are set by the library.', 'Requiere una tarjeta de la Biblioteca Pública de Austin. La biblioteca fija las reglas.'),
    serviceArea: t('Austin Public Library cardholders.', 'Personas con tarjeta de la Biblioteca Pública de Austin.'), jurisdiction: 'austin',
    audience: t('Anyone building skills, preparing for an exam, or looking for work.', 'Cualquier persona que desarrolla habilidades, se prepara para un examen o busca trabajo.'),
    applicationStatus: 'varies', statusNote: t('Resources are listed by the library. Live coaching hours are set by the provider.', 'La biblioteca publica los recursos. El proveedor fija las horas de asesoría en vivo.'),
    actionKind: 'information', screeningNote: t('Library resources can change. Confirm what your card includes on the library site.', 'Los recursos pueden cambiar. Confirme en el sitio de la biblioteca qué incluye su tarjeta.'),
    applyOnlineUrl: aplLearningUrl,
    localHelp: { name: 'Get a library card', url: 'https://library.austintexas.gov/mylibrarycard' },
    sources: [source('Austin Public Library: online learning resources (Udemy, JobNow, LearningExpress, Mango)', aplLearningUrl)],
    documents: [t('Your library card number and PIN to sign in to each resource.', 'Su número de tarjeta y PIN para entrar a cada recurso.')],
    notes: t('Pair a Udemy course with a practice test before paying for any certification exam.', 'Combine un curso de Udemy con un examen de práctica antes de pagar cualquier certificación.'),
    steps: [
      step('get-library-card', t('Get or renew your card', 'Obtenga o renueve su tarjeta'), t('Follow the library’s card page for current requirements.', 'Siga la página de tarjetas de la biblioteca para ver los requisitos.')),
      step('start-course', t('Start a course or book coaching', 'Empiece un curso o pida asesoría'), t('Open the Online Learning page and choose Udemy, JobNow or LearningExpress.', 'Abra la página de Aprendizaje en Línea y elija Udemy, JobNow o LearningExpress.')),
    ],
  }),
  entry({
    id: 'workintexas', name: 'WorkInTexas.com Job Board', category: 'income', agency: 'Texas Workforce Commission / Workforce Solutions',
    provides: t('The state’s free job-matching site: search jobs, build a résumé, and find education, training and veteran services.', 'El sitio gratuito del estado para buscar empleo, crear un currículum y encontrar educación, capacitación y servicios para veteranos.'),
    eligibilitySummary: t('Free for anyone looking for work. It is not based on income.', 'Gratis para cualquier persona que busca trabajo. No depende de los ingresos.'),
    serviceArea: texas, jurisdiction: 'texas',
    audience: t('Job seekers anywhere in Texas.', 'Personas que buscan trabajo en todo Texas.'),
    applicationStatus: 'varies', statusNote: t('Job listings are posted by employers and change daily.', 'Las ofertas las publican los empleadores y cambian cada día.'),
    actionKind: 'information', screeningNote: t('A listing is not a job offer. Verify employers before sharing personal details.', 'Una oferta publicada no es un empleo. Verifique a los empleadores antes de compartir datos personales.'),
    applyOnlineUrl: workInTexasUrl,
    localHelp: { name: 'Workforce Solutions Capital Area', url: 'https://wfscapitalarea.com/job-seekers/' },
    sources: [source('WorkInTexas: job search, résumé and training services', workInTexasUrl)],
    documents: [t('Your résumé, work history with dates, and any licenses or certifications.', 'Su currículum, historial laboral con fechas y licencias o certificaciones.')],
    notes: t('Registering on WorkInTexas is often part of Texas unemployment work-search requirements; ask TWC what applies to you.', 'Registrarse en WorkInTexas suele ser parte de los requisitos de búsqueda de empleo del desempleo en Texas; pregunte a TWC qué le aplica.'),
    steps: [
      step('create-workintexas', t('Create a profile', 'Cree un perfil'), t('Register on WorkInTexas.com or the mobile app and upload your résumé.', 'Regístrese en WorkInTexas.com o la app y suba su currículum.')),
      step('set-job-alerts', t('Save searches', 'Guarde búsquedas'), t('Search by title and ZIP and save searches that match your skills.', 'Busque por puesto y código postal y guarde búsquedas que coincidan con sus habilidades.')),
    ],
  }),
]
