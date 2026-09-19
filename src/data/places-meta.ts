import type { Localized, PlaceKind } from '../types'

export const placeLabels: Record<PlaceKind, Localized> = {
  'neighborhood-center': { en: 'Neighborhood Center', es: 'Centro Vecinal' },
  wic: { en: 'WIC Clinic', es: 'Clínica WIC' },
  clinic: { en: 'Health Clinic', es: 'Clínica de Salud' },
  library: { en: 'Public Library', es: 'Biblioteca Pública' },
  'rec-center': { en: 'Recreation Center', es: 'Centro Recreativo' },
  'senior-center': { en: 'Senior Center', es: 'Centro para Mayores' },
  nonprofit: { en: 'Nonprofit & Social Services', es: 'Organización Social' },
  cooling: { en: 'Public pool (not emergency cooling)', es: 'Piscina pública (no refugio de emergencia)' },
}

/** Why each kind of place matters to someone seeking help. */
export const placeWhy: Record<PlaceKind, Localized> = {
  'neighborhood-center': {
    en: 'City-run centers offering basic needs help, food, and benefit application assistance.',
    es: 'Centros de la ciudad que ofrecen ayuda con necesidades básicas, comida y solicitudes de beneficios.',
  },
  wic: {
    en: 'Apply for WIC and get nutrition support for pregnancy and young children.',
    es: 'Solicite WIC y obtenga apoyo nutricional para el embarazo y niños pequeños.',
  },
  clinic: {
    en: 'Health centers. Ask about appointments, fees and financial assistance.',
    es: 'Centros de salud. Pregunte sobre citas, costos y asistencia financiera.',
  },
  library: {
    en: 'Ask about public computers, WiFi and printing costs for applications.',
    es: 'Pregunte sobre computadoras públicas, WiFi y costos de impresión para solicitudes.',
  },
  'rec-center': {
    en: 'Youth and family activities. Confirm fees, schedules and services.',
    es: 'Actividades juveniles y familiares. Confirme costos, horarios y servicios.',
  },
  'senior-center': {
    en: 'Activities, meals and benefits help for older adults.',
    es: 'Actividades, comidas y ayuda con beneficios para adultos mayores.',
  },
  nonprofit: {
    en: 'Local nonprofits contracted by Austin Public Health for social services.',
    es: 'Organizaciones locales contratadas por Austin Public Health para servicios sociales.',
  },
  cooling: {
    en: 'Recorded pool locations, not verified cooling shelters. Confirm seasonal schedules, admission and current operation. For heat illness, call 9-1-1.',
    es: 'Piscinas registradas, no refugios de calor verificados. Confirme horarios de temporada, entrada y funcionamiento actual. Para enfermedad por calor, llame al 9-1-1.',
  },
}

export const placeColors: Record<PlaceKind, string> = {
  'neighborhood-center': 'var(--cp-accent)',
  wic: 'var(--cp-accent)',
  clinic: 'var(--cp-accent)',
  library: 'var(--cp-accent)',
  'rec-center': 'var(--cp-accent)',
  'senior-center': 'var(--cp-accent)',
  nonprofit: 'var(--cp-accent)',
  cooling: 'var(--cp-accent)',
}

export const placeOrder: PlaceKind[] = [
  'neighborhood-center',
  'clinic',
  'wic',
  'library',
  'nonprofit',
  'rec-center',
  'senior-center',
  'cooling',
]

/** Things Austin 3-1-1 can help with that most residents don't know about. */
export type Service311 = {
  id: string
  title: Localized
  body: Localized
  /** The official 311 service request type this maps to. */
  requestType: string
}

export const services311: Service311[] = [
  {
    id: 'code',
    title: {
      en: 'Report unsafe or unhealthy rental housing',
      es: 'Reportar vivienda de alquiler insegura o insalubre',
    },
    body: {
      en: 'Ask how to report unsafe rental conditions, including plumbing, electrical or heating problems. The City can explain the inspection process. For legal advice about your tenancy, contact a legal-aid service.',
      es: 'Pregunte cómo reportar condiciones inseguras de alquiler, como problemas de plomería, electricidad o calefacción. La Ciudad puede explicar el proceso de inspección. Para asesoramiento legal sobre su alquiler, contacte a un servicio de ayuda legal.',
    },
    requestType: 'Austin Code - Request Code Officer',
  },
  {
    id: 'water',
    title: {
      en: 'Water emergencies and high bills',
      es: 'Emergencias de agua y facturas altas',
    },
    body: {
      en: 'Report a broken water line, no water service, or a leak that could be driving up your bill. Austin Water can also discuss bill relief.',
      es: 'Reporte una línea de agua rota, falta de servicio o una fuga que podría estar aumentando su factura. Austin Water también puede hablar sobre alivio de facturas.',
    },
    requestType: 'AW - Emergency Water Issues',
  },
  {
    id: 'heat',
    title: {
      en: 'Extreme heat help',
      es: 'Ayuda por calor extremo',
    },
    body: {
      en: 'Ask 3-1-1 about current non-emergency cooling locations. If someone may have heat stroke or is seriously ill, call 9-1-1, not 3-1-1.',
      es: 'Pregunte al 3-1-1 por lugares frescos para situaciones que no sean emergencias. Si alguien puede sufrir un golpe de calor o está gravemente enfermo, llame al 9-1-1, no al 3-1-1.',
    },
    requestType: 'HSEM - Heat Advisory',
  },
  {
    id: 'lead',
    title: {
      en: 'Lead safety in older homes',
      es: 'Seguridad frente al plomo en casas antiguas',
    },
    body: {
      en: 'Homes built before 1978 may have lead paint. Ask about current lead-safety programs, inspections and any requirements for assistance.',
      es: 'Las casas construidas antes de 1978 pueden tener pintura con plomo. Pregunte por programas actuales de seguridad, inspecciones y requisitos de asistencia.',
    },
    requestType: 'LeadSmart Program',
  },
  {
    id: 'trash',
    title: {
      en: 'Missed trash, bulk pickup and dumping',
      es: 'Basura no recogida, recolección de voluminosos y tiradero',
    },
    body: {
      en: 'Ask about bulk item pickup and any service requirements, report missed collection, or report illegal dumping.',
      es: 'Pregunte sobre la recolección de artículos voluminosos y sus requisitos, reporte recolección perdida o tiraderos ilegales.',
    },
    requestType: 'ARR - Bulk',
  },
  {
    id: 'housingprog',
    title: {
      en: 'Home repair and housing programs',
      es: 'Programas de reparación de vivienda',
    },
    body: {
      en: 'Ask about City home repair assistance and neighborhood housing programs for income-eligible homeowners.',
      es: 'Pregunte sobre la asistencia de la Ciudad para reparación de vivienda y programas de vivienda para propietarios elegibles.',
    },
    requestType: 'AH (HD) - Neighborhood Home Programs',
  },
]

export const datasetSources = [
  { id: '6v78-dj3u', title: { en: 'Austin Public Health locations', es: 'Ubicaciones de Salud Pública de Austin' }, snapshot: '2026-07-25', published: '2018-07', kinds: ['wic', 'neighborhood-center', 'clinic'] },
  { id: '87b4-3p9b', title: { en: 'Safety-net health providers', es: 'Proveedores de salud de la red de apoyo' }, snapshot: '2026-07-25', published: '2019-04', kinds: ['clinic'] },
  { id: 'tc36-hn4j', title: { en: 'Austin Public Library locations', es: 'Ubicaciones de bibliotecas públicas de Austin' }, snapshot: '2026-07-25', published: '2025-10', kinds: ['library'] },
  { id: '8dff-2vkt', title: { en: 'Recreation centers', es: 'Centros recreativos' }, snapshot: '2026-07-25', published: '2024-06', kinds: ['rec-center'] },
  { id: '3yna-uh9e', title: { en: 'Senior activity centers', es: 'Centros de actividades para mayores' }, snapshot: '2026-07-25', published: '2024-06', kinds: ['senior-center'] },
  { id: 'iicu-im5w', title: { en: 'Public health social-service vendors', es: 'Proveedores de servicios sociales de salud pública' }, snapshot: '2026-07-25', published: '2019-12', kinds: ['nonprofit'] },
  { id: 'xaxa-886r', title: { en: 'Austin pool schedule', es: 'Horarios de piscinas de Austin' }, snapshot: '2026-07-25', published: '2026-06', kinds: ['cooling'] },
  { id: 'ifzc-3xz8', title: { en: 'Affordable housing inventory', es: 'Inventario de vivienda asequible' }, snapshot: '2026-07-25', published: '2026-07', kinds: ['housing'] },
] as const
