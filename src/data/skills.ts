import type { Localized } from '../types'
import { text as t } from './catalog-shared'

export type SkillGroup = { id: string; label: Localized; skills: Localized[] }

/** A browsable skill library for the résumé builder. People can also type their own. */
export const skillGroups: SkillGroup[] = [
  {
    id: 'people', label: t('People & communication', 'Personas y comunicación'),
    skills: [t('Customer service', 'Atención al cliente'), t('Active listening', 'Escucha activa'), t('Conflict resolution', 'Resolución de conflictos'),
      t('Bilingual: English and Spanish', 'Bilingüe: inglés y español'), t('Phone and email communication', 'Comunicación por teléfono y correo'),
      t('Public speaking', 'Hablar en público'), t('Written communication', 'Comunicación escrita'), t('Sales', 'Ventas')],
  },
  {
    id: 'work-habits', label: t('Work habits & leadership', 'Hábitos de trabajo y liderazgo'),
    skills: [t('Team leadership', 'Liderazgo de equipos'), t('Training new staff', 'Capacitación de personal nuevo'), t('Problem solving', 'Resolución de problemas'),
      t('Time management', 'Manejo del tiempo'), t('Attention to detail', 'Atención al detalle'), t('Reliability', 'Responsabilidad'),
      t('Adaptability', 'Adaptabilidad'), t('Working under pressure', 'Trabajo bajo presión')],
  },
  {
    id: 'office', label: t('Office & computer', 'Oficina y computación'),
    skills: [t('Microsoft Excel', 'Microsoft Excel'), t('Microsoft Word', 'Microsoft Word'), t('Google Workspace', 'Google Workspace'),
      t('Data entry', 'Captura de datos'), t('Scheduling', 'Agendar citas'), t('Bookkeeping', 'Contabilidad básica'), t('QuickBooks', 'QuickBooks'),
      t('Filing and records', 'Archivo y registros'), t('Typing', 'Mecanografía')],
  },
  {
    id: 'tech', label: t('Technology', 'Tecnología'),
    skills: [t('Technical troubleshooting', 'Solución de problemas técnicos'), t('Windows and macOS', 'Windows y macOS'), t('Networking basics', 'Redes básicas'),
      t('HTML and CSS', 'HTML y CSS'), t('JavaScript', 'JavaScript'), t('SQL basics', 'SQL básico'), t('Cybersecurity fundamentals', 'Fundamentos de ciberseguridad'),
      t('Social media', 'Redes sociales'), t('Charts and dashboards', 'Gráficas y tableros')],
  },
  {
    id: 'trades', label: t('Trades & safety', 'Oficios y seguridad'),
    skills: [t('Hand and power tools', 'Herramientas manuales y eléctricas'), t('Blueprint reading', 'Lectura de planos'), t('Job-site safety', 'Seguridad en obra'),
      t('Electrical basics', 'Electricidad básica'), t('Plumbing basics', 'Plomería básica'), t('HVAC basics', 'HVAC básico'),
      t('Forklift operation', 'Operación de montacargas'), t('Welding', 'Soldadura'), t('Equipment maintenance', 'Mantenimiento de equipo')],
  },
  {
    id: 'care', label: t('Health & care', 'Salud y cuidado'),
    skills: [t('Patient care', 'Cuidado de pacientes'), t('CPR and First Aid', 'RCP y primeros auxilios'), t('Recording vital signs', 'Registro de signos vitales'),
      t('Infection control', 'Control de infecciones'), t('Child development', 'Desarrollo infantil'), t('Elder care', 'Cuidado de adultos mayores'),
      t('Medication reminders', 'Recordatorios de medicamentos'), t('Communicating with families', 'Comunicación con familias')],
  },
  {
    id: 'service', label: t('Food, retail & hospitality', 'Comida, comercio y hospitalidad'),
    skills: [t('Food safety', 'Seguridad alimentaria'), t('Cash handling', 'Manejo de efectivo'), t('Point-of-sale systems', 'Sistemas de punto de venta'),
      t('Inventory', 'Inventario'), t('Food preparation', 'Preparación de alimentos'), t('Merchandising', 'Exhibición de productos'), t('Housekeeping', 'Limpieza')],
  },
  {
    id: 'logistics', label: t('Driving & logistics', 'Manejo y logística'),
    skills: [t('Safe driving record', 'Historial de manejo seguro'), t('Route planning', 'Planificación de rutas'), t('Shipping and receiving', 'Envíos y recepción'),
      t('Inventory control', 'Control de inventario'), t('Loading and unloading', 'Carga y descarga')],
  },
]
