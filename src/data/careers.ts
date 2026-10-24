import type { Localized } from '../types'
import { text as t } from './catalog-shared'

/**
 * Career pathways built from free or low-cost, recognized credentials and
 * local Austin training programs. Wages and outlook are never stated here;
 * each track links to O*NET (U.S. Department of Labor) for current data.
 */
export type Cost = 'free' | 'library' | 'aid' | 'low' | 'sponsored'

export type LearningStep = {
  title: Localized
  detail: Localized
  resource: { label: string; url: string }
  cost: Cost
  credential?: boolean
}

export type CareerField = 'tech' | 'health' | 'trades' | 'business' | 'service' | 'education' | 'logistics'

export type CareerTrack = {
  id: string
  field: CareerField
  title: Localized
  roles: Localized
  why: Localized
  onet: { code: string; title: string }
  steps: LearningStep[]
  /** Catalog program IDs for local training or job help. */
  localPrograms: string[]
  skills: string[]
}

export const costLabels: Record<Cost, Localized> = {
  free: t('Free', 'Gratis'),
  library: t('Free with library card', 'Gratis con tarjeta de biblioteca'),
  aid: t('Financial aid available', 'Ayuda financiera disponible'),
  low: t('Low cost', 'Bajo costo'),
  sponsored: t('Free if accepted', 'Gratis si le aceptan'),
}

export const fieldLabels: Record<CareerField, Localized> = {
  tech: t('Technology', 'Tecnología'),
  health: t('Health care', 'Salud'),
  trades: t('Skilled trades', 'Oficios'),
  business: t('Business & office', 'Negocios y oficina'),
  service: t('Food & hospitality', 'Comida y hospitalidad'),
  education: t('Education & child care', 'Educación y cuidado infantil'),
  logistics: t('Driving & logistics', 'Transporte y logística'),
}

const google = { label: 'Google Career Certificates', url: 'https://grow.google/certificates/' }
const courseraAid = { label: 'Coursera: apply for financial aid', url: 'https://www.coursera.support/s/article/209819033-Apply-for-Financial-Aid-or-a-Scholarship' }
const library = { label: 'Austin Public Library: Online Learning', url: 'https://library.austintexas.gov/digital/online-learning' }
const fcc = { label: 'freeCodeCamp certifications', url: 'https://www.freecodecamp.org/learn' }
const capitalIdea = { label: 'Capital IDEA', url: 'https://www.capitalidea.org/eligibility/' }
const skillpoint = { label: 'Skillpoint Alliance', url: 'https://skillpointalliance.org/application/' }
const wfsTraining = { label: 'Workforce Solutions training scholarships', url: 'https://wfscapitalarea.com/job-seekers/career-training/' }
const osha = { label: 'OSHA Outreach Training (10- and 30-hour)', url: 'https://www.osha.gov/training/outreach' }
const foodHandler = { label: 'Texas DSHS: food handler training FAQ', url: 'https://www.dshs.texas.gov/licensing-food-handler-training-programs/frequently-asked-questions-food-handler-education-or-training-programs' }
const cda = { label: 'Council for Professional Recognition: CDA credential', url: 'https://www.cdacouncil.org/' }
const msLearn = { label: 'Microsoft Learn (free training)', url: 'https://learn.microsoft.com/training/' }

const libraryIntro = (topic: Localized): LearningStep => ({
  title: t('Try it free first', 'Pruébelo gratis primero'),
  detail: t(`Take an introductory ${topic.en} course on Udemy through the Austin Public Library before paying for anything.`, `Tome un curso introductorio de ${topic.es} en Udemy con la Biblioteca Pública de Austin antes de pagar algo.`),
  resource: library, cost: 'library',
})
const googleCert = (name: string, es: string): LearningStep => ({
  title: t(`Earn the Google ${name} Certificate`, `Obtenga el certificado de Google en ${es}`),
  detail: t('Self-paced on Coursera, no experience needed; Google lists 3–6 months at under 10 hours a week. Apply for Coursera financial aid if the subscription is a barrier.', 'A su ritmo en Coursera, sin experiencia previa; Google indica 3–6 meses con menos de 10 horas por semana. Solicite ayuda financiera de Coursera si la suscripción es un obstáculo.'),
  resource: google, cost: 'aid', credential: true,
})
const aidStep: LearningStep = {
  title: t('Request financial aid', 'Solicite ayuda financiera'),
  detail: t('On the Coursera course page, choose Financial Aid and explain your goals. Coursera says review can take about two weeks.', 'En la página del curso en Coursera, elija Ayuda financiera y explique sus metas. Coursera indica que la revisión puede tardar unas dos semanas.'),
  resource: courseraAid, cost: 'free',
}

export const careerTracks: CareerTrack[] = [
  {
    id: 'it-support', field: 'tech',
    title: t('IT support', 'Soporte de TI'),
    roles: t('Help desk technician, IT support specialist, desktop support', 'Técnico de mesa de ayuda, especialista en soporte de TI'),
    why: t('An entry point into tech that values customer service. Many people move on to networking, cloud or cybersecurity.', 'Una entrada a la tecnología que valora el servicio al cliente. Muchas personas avanzan a redes, nube o ciberseguridad.'),
    onet: { code: '15-1232.00', title: 'Computer User Support Specialists' },
    steps: [libraryIntro(t('IT', 'TI')), aidStep, googleCert('IT Support', 'Soporte de TI'),
      { title: t('Go further with free college', 'Avance con estudios gratuitos'), detail: t('Capital IDEA sponsors network administration, cloud and cybersecurity training for eligible working adults.', 'Capital IDEA patrocina formación en redes, nube y ciberseguridad para adultos elegibles que trabajan.'), resource: capitalIdea, cost: 'sponsored' }],
    localPrograms: ['capital-idea', 'career-training', 'goodwill-careers', 'library-learning'],
    skills: ['Technical troubleshooting', 'Customer support', 'Ticketing systems', 'Windows and macOS', 'Networking basics'],
  },
  {
    id: 'cybersecurity', field: 'tech',
    title: t('Cybersecurity', 'Ciberseguridad'),
    roles: t('Security analyst, SOC analyst, security technician', 'Analista de seguridad, analista SOC'),
    why: t('Organizations of every size need people who protect systems and data.', 'Organizaciones de todo tamaño necesitan personas que protejan sistemas y datos.'),
    onet: { code: '15-1212.00', title: 'Information Security Analysts' },
    steps: [libraryIntro(t('cybersecurity', 'ciberseguridad')), aidStep, googleCert('Cybersecurity', 'Ciberseguridad'),
      { title: t('Ask about sponsored training', 'Pregunte por formación patrocinada'), detail: t('Capital IDEA lists cybersecurity among its sponsored IT careers.', 'Capital IDEA incluye ciberseguridad entre sus carreras de TI patrocinadas.'), resource: capitalIdea, cost: 'sponsored' }],
    localPrograms: ['capital-idea', 'career-training', 'library-learning'],
    skills: ['Security fundamentals', 'Risk awareness', 'Linux basics', 'Incident documentation'],
  },
  {
    id: 'data-analytics', field: 'tech',
    title: t('Data analytics', 'Análisis de datos'),
    roles: t('Junior data analyst, reporting analyst, operations analyst', 'Analista de datos junior, analista de reportes'),
    why: t('Spreadsheet and reporting skills are useful in almost every industry, from retail to health care.', 'Las hojas de cálculo y los reportes sirven en casi todas las industrias, del comercio a la salud.'),
    onet: { code: '15-2051.01', title: 'Business Intelligence Analysts' },
    steps: [libraryIntro(t('Excel', 'Excel')),
      { title: t('Earn a free certification', 'Obtenga una certificación gratuita'), detail: t('freeCodeCamp offers a free Data Analysis with Python certification built on hands-on projects.', 'freeCodeCamp ofrece una certificación gratuita de Análisis de Datos con Python basada en proyectos.'), resource: fcc, cost: 'free', credential: true },
      googleCert('Data Analytics', 'Análisis de Datos')],
    localPrograms: ['career-training', 'library-learning', 'workintexas'],
    skills: ['Excel and spreadsheets', 'Data cleaning', 'SQL basics', 'Charts and dashboards', 'Attention to detail'],
  },
  {
    id: 'web-development', field: 'tech',
    title: t('Web development', 'Desarrollo web'),
    roles: t('Junior web developer, front-end developer', 'Desarrollador web junior, desarrollador front-end'),
    why: t('You can learn for free, build a portfolio that shows real work, and start with freelance projects.', 'Puede aprender gratis, crear un portafolio con trabajo real y empezar con proyectos independientes.'),
    onet: { code: '15-1254.00', title: 'Web Developers' },
    steps: [
      { title: t('Earn free certifications', 'Obtenga certificaciones gratuitas'), detail: t('freeCodeCamp’s Responsive Web Design and JavaScript certifications are free and project-based.', 'Las certificaciones de Diseño Web Responsivo y JavaScript de freeCodeCamp son gratuitas y basadas en proyectos.'), resource: fcc, cost: 'free', credential: true },
      { title: t('Build three portfolio projects', 'Cree tres proyectos para su portafolio'), detail: t('A personal site, a small business page and one interactive app show employers what you can do.', 'Un sitio personal, una página para un negocio y una app interactiva muestran lo que sabe hacer.'), resource: fcc, cost: 'free' },
      { title: t('Get résumé and interview coaching', 'Reciba asesoría de currículum y entrevistas'), detail: t('Book live JobNow coaching with your library card.', 'Reserve asesoría en vivo de JobNow con su tarjeta de biblioteca.'), resource: library, cost: 'library' }],
    localPrograms: ['library-learning', 'career-training', 'workintexas'],
    skills: ['HTML and CSS', 'JavaScript', 'Responsive design', 'Git and GitHub', 'Problem solving'],
  },
  {
    id: 'project-management', field: 'business',
    title: t('Project management', 'Gestión de proyectos'),
    roles: t('Project coordinator, operations coordinator, scheduler', 'Coordinador de proyectos, coordinador de operaciones'),
    why: t('If you have organized shifts, events, crews or inventory, you have already done project work.', 'Si ha organizado turnos, eventos, equipos o inventario, ya ha hecho trabajo de proyectos.'),
    onet: { code: '13-1082.00', title: 'Project Management Specialists' },
    steps: [libraryIntro(t('project management', 'gestión de proyectos')), aidStep, googleCert('Project Management', 'Gestión de Proyectos')],
    localPrograms: ['career-training', 'goodwill-careers', 'library-learning'],
    skills: ['Scheduling', 'Budget tracking', 'Team coordination', 'Stakeholder communication', 'Microsoft Office'],
  },
  {
    id: 'office-bookkeeping', field: 'business',
    title: t('Office & bookkeeping', 'Oficina y contabilidad'),
    roles: t('Administrative assistant, bookkeeping clerk, office coordinator', 'Asistente administrativo, auxiliar contable'),
    why: t('Steady roles in nearly every industry that reward accuracy and organization.', 'Puestos estables en casi todas las industrias que premian la precisión y la organización.'),
    onet: { code: '43-3031.00', title: 'Bookkeeping, Accounting, and Auditing Clerks' },
    steps: [libraryIntro(t('Excel and bookkeeping', 'Excel y contabilidad')),
      { title: t('Learn Microsoft 365 for free', 'Aprenda Microsoft 365 gratis'), detail: t('Microsoft Learn has free self-paced modules for Excel, Word and Outlook.', 'Microsoft Learn tiene módulos gratuitos para Excel, Word y Outlook.'), resource: msLearn, cost: 'free' },
      aidStep,
      { title: t('Earn the Intuit Academy Bookkeeping Certificate', 'Obtenga el certificado de contabilidad de Intuit Academy'), detail: t('A beginner-level Coursera program with no degree or experience required; financial aid is available. Finishing it prepares you for the Intuit Academy Bookkeeping exam.', 'Un programa inicial en Coursera sin título ni experiencia previa; hay ayuda financiera. Al terminarlo puede presentar el examen de contabilidad de Intuit Academy.'), resource: { label: 'Coursera: Intuit Academy Bookkeeping Professional Certificate', url: 'https://www.coursera.org/professional-certificates/intuit-bookkeeping' }, cost: 'aid', credential: true }],
    localPrograms: ['goodwill-careers', 'career-training', 'adult-education', 'library-learning'],
    skills: ['Data entry', 'Microsoft Excel', 'Accounts payable and receivable', 'Scheduling', 'Customer communication'],
  },
  {
    id: 'digital-marketing', field: 'business',
    title: t('Digital marketing & sales', 'Marketing digital y ventas'),
    roles: t('Marketing coordinator, social media assistant, inside sales', 'Coordinador de marketing, asistente de redes sociales, ventas'),
    why: t('Retail and customer-service experience translates directly into understanding customers online.', 'La experiencia en ventas y atención al cliente se traduce directamente al mundo digital.'),
    onet: { code: '13-1161.00', title: 'Market Research Analysts and Marketing Specialists' },
    steps: [libraryIntro(t('social media marketing', 'marketing en redes')), aidStep, googleCert('Digital Marketing & E-commerce', 'Marketing Digital y Comercio Electrónico')],
    localPrograms: ['career-training', 'library-learning', 'workintexas'],
    skills: ['Social media', 'Customer insight', 'Content writing', 'Sales', 'Basic analytics'],
  },
  {
    id: 'healthcare', field: 'health',
    title: t('Nursing & health care', 'Enfermería y salud'),
    roles: t('Nurse aide (CNA), LVN, registered nurse, dental hygienist', 'Auxiliar de enfermería, enfermero/a vocacional (LVN), enfermero/a registrado/a'),
    why: t('Caregiving experience is a strong start, and health careers have clear licensed steps you can climb.', 'La experiencia cuidando personas es un buen comienzo, y las carreras de salud tienen pasos claros con licencia.'),
    onet: { code: '31-1131.00', title: 'Nursing Assistants' },
    steps: [
      { title: t('Explore sponsored nursing programs', 'Explore programas de enfermería patrocinados'), detail: t('Capital IDEA pays tuition, books and fees for nursing, LVN and dental hygiene for eligible working adults.', 'Capital IDEA paga matrícula, libros y cuotas de enfermería, LVN e higiene dental para adultos elegibles que trabajan.'), resource: capitalIdea, cost: 'sponsored', credential: true },
      { title: t('Ask about a training scholarship', 'Pregunte por una beca de capacitación'), detail: t('Workforce Solutions may fund shorter health training for eligible job seekers.', 'Workforce Solutions puede financiar capacitaciones cortas de salud para personas elegibles.'), resource: wfsTraining, cost: 'sponsored' },
      { title: t('Prepare for entrance exams', 'Prepárese para exámenes de ingreso'), detail: t('Use library practice tests and live tutoring to get ready.', 'Use exámenes de práctica y tutoría en vivo de la biblioteca.'), resource: library, cost: 'library' }],
    localPrograms: ['capital-idea', 'career-training', 'adult-education'],
    skills: ['Patient care', 'Compassion under pressure', 'Recording vital signs', 'Infection control', 'Teamwork'],
  },
  {
    id: 'skilled-trades', field: 'trades',
    title: t('Electrical, plumbing & HVAC', 'Electricidad, plomería y HVAC'),
    roles: t('Electrician apprentice, plumber’s helper, HVAC technician', 'Aprendiz de electricista, ayudante de plomero, técnico de HVAC'),
    why: t('Fast, free local training leads to apprenticeships where you earn while you learn.', 'Capacitación local rápida y gratuita que lleva a aprendizajes donde gana mientras aprende.'),
    onet: { code: '47-2111.00', title: 'Electricians' },
    steps: [
      { title: t('Join a free pre-apprenticeship', 'Únase a un preaprendizaje gratuito'), detail: t('Skillpoint Alliance runs free 4–8 week electrical, plumbing and HVAC training in Austin and Del Valle.', 'Skillpoint Alliance ofrece capacitación gratuita de 4–8 semanas en electricidad, plomería y HVAC en Austin y Del Valle.'), resource: skillpoint, cost: 'free', credential: true },
      { title: t('Earn an OSHA 10 card', 'Obtenga la tarjeta OSHA 10'), detail: t('Many job sites expect OSHA 10-hour safety training from an authorized trainer; ask your program if it is included.', 'Muchas obras esperan la capacitación de seguridad OSHA de 10 horas con un instructor autorizado; pregunte si su programa la incluye.'), resource: osha, cost: 'low', credential: true },
      { title: t('Ask about union and sponsored paths', 'Pregunte por rutas sindicales y patrocinadas'), detail: t('Capital IDEA lists unions, construction and professional trades among its career areas.', 'Capital IDEA incluye sindicatos, construcción y oficios entre sus áreas.'), resource: capitalIdea, cost: 'sponsored' }],
    localPrograms: ['skillpoint-alliance', 'capital-idea', 'career-training'],
    skills: ['Hand and power tools', 'Reading measurements', 'Job-site safety', 'Troubleshooting', 'Physical stamina'],
  },
  {
    id: 'cdl-logistics', field: 'logistics',
    title: t('Commercial driving (CDL) & logistics', 'Manejo comercial (CDL) y logística'),
    roles: t('Truck driver, delivery driver, warehouse lead', 'Conductor de camión, repartidor, líder de almacén'),
    why: t('Warehouse and delivery experience carries over, and a CDL opens higher-paying driving work.', 'La experiencia en almacén y reparto se aprovecha, y una CDL abre trabajos de manejo mejor pagados.'),
    onet: { code: '53-3032.00', title: 'Heavy and Tractor-Trailer Truck Drivers' },
    steps: [
      { title: t('Practice the CDL permit test free', 'Practique gratis el examen del permiso CDL'), detail: t('The library’s Texas Driving Permit Practice Tests include CDL preparation.', 'Las pruebas de práctica de la biblioteca incluyen preparación para la CDL.'), resource: library, cost: 'library' },
      { title: t('Ask Workforce Solutions to fund CDL school', 'Pida a Workforce Solutions financiar la escuela CDL'), detail: t('Training scholarships may cover approved CDL programs for eligible job seekers.', 'Las becas pueden cubrir programas CDL aprobados para personas elegibles.'), resource: wfsTraining, cost: 'sponsored', credential: true }],
    localPrograms: ['career-training', 'library-learning', 'workintexas'],
    skills: ['Safe driving record', 'Route planning', 'Inventory handling', 'Forklift operation', 'Time management'],
  },
  {
    id: 'food-hospitality', field: 'service',
    title: t('Food service & hospitality', 'Servicio de comida y hospitalidad'),
    roles: t('Line cook, shift lead, kitchen manager, food service manager', 'Cocinero, líder de turno, gerente de cocina'),
    why: t('Austin’s restaurant and hotel industry promotes from within, and certifications show you are ready to lead.', 'La industria de restaurantes y hoteles de Austin promueve desde adentro, y las certificaciones muestran que está listo para liderar.'),
    onet: { code: '11-9051.00', title: 'Food Service Managers' },
    steps: [
      { title: t('Get your Texas food handler card', 'Obtenga su tarjeta de manipulador de alimentos'), detail: t('Texas requires food employees to complete an accredited food handler course; DSHS explains accredited options.', 'Texas exige que los empleados de alimentos completen un curso acreditado; DSHS explica las opciones.'), resource: foodHandler, cost: 'low', credential: true },
      { title: t('Learn management basics', 'Aprenda bases de gestión'), detail: t('Free library courses on supervising teams, inventory and customer service prepare you for a lead role.', 'Los cursos gratuitos de la biblioteca sobre supervisión, inventario y servicio le preparan para liderar.'), resource: library, cost: 'library' }],
    localPrograms: ['goodwill-careers', 'library-learning', 'workintexas'],
    skills: ['Food safety', 'Working under pressure', 'Inventory', 'Team leadership', 'Customer service'],
  },
  {
    id: 'early-childhood', field: 'education',
    title: t('Early childhood education', 'Educación infantil'),
    roles: t('Child care teacher, preschool assistant, family child care owner', 'Maestro/a de cuidado infantil, asistente de preescolar'),
    why: t('Experience caring for children counts. The CDA credential is a nationally recognized next step.', 'La experiencia cuidando niños cuenta. La credencial CDA es un siguiente paso reconocido en todo el país.'),
    onet: { code: '25-2011.00', title: 'Preschool Teachers, Except Special Education' },
    steps: [
      { title: t('Take child development courses', 'Tome cursos de desarrollo infantil'), detail: t('Start with free library courses on child development and classroom management.', 'Empiece con cursos gratuitos de la biblioteca sobre desarrollo infantil y manejo del aula.'), resource: library, cost: 'library' },
      { title: t('Earn the CDA credential', 'Obtenga la credencial CDA'), detail: t('The Child Development Associate credential requires training hours, experience and an assessment. Ask your employer or Workforce Solutions about help with fees.', 'La credencial CDA requiere horas de formación, experiencia y una evaluación. Pregunte a su empleador o a Workforce Solutions por ayuda con las cuotas.'), resource: cda, cost: 'low', credential: true }],
    localPrograms: ['career-training', 'adult-education', 'library-learning'],
    skills: ['Child development', 'Lesson planning', 'Communicating with families', 'Patience', 'Safety awareness'],
  },
]

/** Past-job families recognized from what people type, with transferable skills. */
export type JobFamily = {
  id: string
  terms: string[]
  tracks: string[]
  skills: Localized[]
  bullets: Localized[]
}

export const jobFamilies: JobFamily[] = [
  {
    id: 'retail', terms: ['retail', 'cashier', 'sales', 'store', 'associate', 'stocker', 'merchandiser', 'cajero', 'cajera', 'tienda', 'ventas', 'vendedor', 'vendedora'],
    tracks: ['digital-marketing', 'it-support', 'office-bookkeeping'],
    skills: [t('Customer service', 'Atención al cliente'), t('Cash handling', 'Manejo de efectivo'), t('Point-of-sale systems', 'Sistemas de punto de venta'), t('Inventory', 'Inventario')],
    bullets: [t('Served about [number] customers per shift while keeping the cash drawer accurate.', 'Atendí a unos [número] clientes por turno manteniendo la caja exacta.'), t('Restocked and organized [area] to keep shelves full during peak hours.', 'Reabastecí y organicé [área] para mantener los estantes llenos en horas pico.')],
  },
  {
    id: 'food', terms: ['cook', 'chef', 'server', 'waiter', 'waitress', 'barista', 'restaurant', 'kitchen', 'dishwasher', 'host', 'bartender', 'cocinero', 'cocinera', 'mesero', 'mesera', 'restaurante', 'cocina'],
    tracks: ['food-hospitality', 'project-management', 'healthcare'],
    skills: [t('Food safety', 'Seguridad alimentaria'), t('Working under pressure', 'Trabajo bajo presión'), t('Teamwork', 'Trabajo en equipo'), t('Customer service', 'Atención al cliente')],
    bullets: [t('Prepared [number] orders per shift while meeting food safety standards.', 'Preparé [número] pedidos por turno cumpliendo normas de seguridad alimentaria.'), t('Trained [number] new team members on kitchen procedures.', 'Capacité a [número] compañeros nuevos en los procedimientos de cocina.')],
  },
  {
    id: 'warehouse', terms: ['warehouse', 'forklift', 'delivery', 'driver', 'courier', 'shipping', 'packer', 'loader', 'mover', 'almacen', 'montacargas', 'repartidor', 'chofer', 'conductor'],
    tracks: ['cdl-logistics', 'skilled-trades', 'project-management'],
    skills: [t('Inventory handling', 'Manejo de inventario'), t('Safe equipment operation', 'Operación segura de equipo'), t('Route planning', 'Planificación de rutas'), t('Reliability', 'Responsabilidad')],
    bullets: [t('Picked and packed about [number] orders per shift with [accuracy]% accuracy.', 'Preparé y empaqué unos [número] pedidos por turno con [precisión]% de exactitud.'), t('Completed [number] deliveries a day on schedule.', 'Completé [número] entregas al día a tiempo.')],
  },
  {
    id: 'construction', terms: ['construction', 'handyman', 'painter', 'carpenter', 'roofer', 'landscaping', 'landscaper', 'laborer', 'maintenance', 'mechanic', 'construccion', 'pintor', 'carpintero', 'jardinero', 'mantenimiento', 'mecanico'],
    tracks: ['skilled-trades', 'cdl-logistics', 'project-management'],
    skills: [t('Hand and power tools', 'Herramientas manuales y eléctricas'), t('Job-site safety', 'Seguridad en obra'), t('Reading plans and measurements', 'Lectura de planos y medidas'), t('Problem solving', 'Resolución de problemas')],
    bullets: [t('Completed [type of] projects for [number] clients on time and within budget.', 'Terminé proyectos de [tipo] para [número] clientes a tiempo y dentro del presupuesto.'), t('Followed safety procedures on job sites with no incidents over [time].', 'Seguí los procedimientos de seguridad sin incidentes durante [tiempo].')],
  },
  {
    id: 'care', terms: ['caregiver', 'home health', 'cna', 'nanny', 'babysitter', 'daycare', 'teacher aide', 'nurse', 'aide', 'cuidador', 'cuidadora', 'ninera', 'enfermera', 'enfermero', 'guarderia'],
    tracks: ['healthcare', 'early-childhood'],
    skills: [t('Patient and child care', 'Cuidado de pacientes y niños'), t('Compassion', 'Compasión'), t('Record keeping', 'Registro de información'), t('Communicating with families', 'Comunicación con familias')],
    bullets: [t('Provided daily care for [number] clients, including [meals, medication reminders, mobility help].', 'Brindé cuidado diario a [número] personas, incluido [comidas, recordatorios de medicamentos, movilidad].'), t('Kept accurate daily care notes and updated families on progress.', 'Mantuve notas diarias exactas y actualicé a las familias.')],
  },
  {
    id: 'office', terms: ['receptionist', 'admin', 'administrative', 'office', 'secretary', 'data entry', 'clerk', 'assistant', 'call center', 'customer service', 'recepcionista', 'oficina', 'secretaria', 'asistente', 'servicio al cliente'],
    tracks: ['office-bookkeeping', 'project-management', 'data-analytics', 'it-support'],
    skills: [t('Microsoft Office', 'Microsoft Office'), t('Scheduling', 'Agendar citas'), t('Data entry', 'Captura de datos'), t('Phone and email communication', 'Comunicación por teléfono y correo')],
    bullets: [t('Handled about [number] calls and emails a day and resolved most on first contact.', 'Atendí unas [número] llamadas y correos al día y resolví la mayoría al primer contacto.'), t('Maintained schedules and records for [number] staff or clients.', 'Mantuve agendas y registros de [número] empleados o clientes.')],
  },
  {
    id: 'tech', terms: ['it support', 'it specialist', 'it technician', 'help desk', 'computer', 'technician', 'developer', 'programmer', 'software', 'tech support', 'computadora', 'tecnico', 'programador'],
    tracks: ['it-support', 'cybersecurity', 'web-development', 'data-analytics'],
    skills: [t('Technical troubleshooting', 'Solución de problemas técnicos'), t('Documentation', 'Documentación'), t('Learning new tools quickly', 'Aprender herramientas rápido')],
    bullets: [t('Resolved about [number] support requests a week for [users/customers].', 'Resolví unas [número] solicitudes de soporte por semana.'), t('Set up and maintained [devices/software] for [number] users.', 'Instalé y mantuve [equipos/software] para [número] usuarios.')],
  },
  {
    id: 'military', terms: ['military', 'army', 'navy', 'marine', 'marines', 'air force', 'veteran', 'national guard', 'militar', 'ejercito', 'marina', 'veterano'],
    tracks: ['it-support', 'cybersecurity', 'cdl-logistics', 'project-management', 'skilled-trades'],
    skills: [t('Leadership', 'Liderazgo'), t('Working under pressure', 'Trabajo bajo presión'), t('Following procedures precisely', 'Seguir procedimientos con precisión'), t('Team coordination', 'Coordinación de equipos')],
    bullets: [t('Led a team of [number] in [mission/operation], meeting every deadline.', 'Dirigí un equipo de [número] en [misión/operación], cumpliendo cada plazo.'), t('Maintained equipment valued at [amount] with zero losses.', 'Mantuve equipo valorado en [monto] sin pérdidas.')],
  },
]

export const actionVerbs: Localized[] = [
  t('Led', 'Dirigí'), t('Trained', 'Capacité'), t('Organized', 'Organicé'), t('Resolved', 'Resolví'),
  t('Improved', 'Mejoré'), t('Managed', 'Administré'), t('Built', 'Construí'), t('Served', 'Atendí'),
  t('Reduced', 'Reduje'), t('Coordinated', 'Coordiné'), t('Delivered', 'Entregué'), t('Maintained', 'Mantuve'),
]
