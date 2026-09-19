import type { Localized, Program } from '../types'

export const reviewedOn = '2026-09-12'
export const text = (en: string, es: string): Localized => ({ en, es })
export const source = (label: string, url: string) => ({ label, url, checkedOn: reviewedOn })
export const step = (id: string, title: Localized, detail: Localized) => ({ id, title, detail })

type CatalogEntry = Program & Required<Pick<Program,
  | 'sources' | 'serviceArea' | 'jurisdiction' | 'applicationStatus'
  | 'statusNote' | 'actionKind' | 'audience' | 'screeningNote' | 'steps' | 'notes'
>>

// Review dates describe the cited content, not live appointment or funding availability.
export function entry(program: CatalogEntry): Program {
  return { ...program, reviewedOn }
}

export const texas = text('Texas, including Austin and Travis County.', 'Texas, incluidos Austin y el Condado de Travis.')
export const travis = text('Travis County residents; an Austin mailing address alone does not establish county residency.', 'Residentes del Condado de Travis; una dirección postal de Austin no confirma el condado.')
export const region = text('Central Texas; confirm that your address is in the provider’s service area.', 'Centro de Texas; confirme que su dirección esté en el área atendida.')
export const capcogRegion = text(
  'Bastrop, Blanco, Burnet, Caldwell, Fayette, Hays, Lee, Llano, Travis and Williamson counties.',
  'Condados de Bastrop, Blanco, Burnet, Caldwell, Fayette, Hays, Lee, Llano, Travis y Williamson.',
)
export const benefitReview = text(
  'This short screen cannot decide eligibility. The agency reviews the complete application, household rules and any exceptions.',
  'Esta orientación breve no decide la elegibilidad. La agencia revisa la solicitud completa, las reglas del hogar y las excepciones.',
)
export const intakeUnknown = text(
  'Application instructions are published; current intake or processing availability has not been confirmed. Check with the agency.',
  'Hay instrucciones para solicitar; no se confirmó la disponibilidad actual de recepción o trámite. Consulte a la agencia.',
)
export const appointmentVaries = text(
  'Appointments and service capacity vary. Contact the provider before traveling; a listed service is not a confirmed appointment.',
  'Las citas y la capacidad varían. Contacte al proveedor antes de viajar; un servicio publicado no es una cita confirmada.',
)
export const hhscHelp = {
  name: 'Texas HHSC / 2-1-1 Texas',
  phone: '211',
  url: 'https://www.211texas.org/',
}
