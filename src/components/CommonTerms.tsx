import { useState } from 'react'
import type { Language, Localized } from '../types'
import { localize } from '../lib/format'

type Term = { id: string; title: Localized; meaning: Localized; source?: string }
const terms: Term[] = [
  {
    id: 'eligibility',
    title: { en: 'Eligibility', es: 'Elegibilidad' },
    meaning: {
      en: 'The rules a person must meet for a program. A relevant service, a low income, or an application link does not mean you qualify. The administering agency reviews the full application and any exceptions.',
      es: 'Las reglas que una persona debe cumplir para un programa. Un servicio pertinente, ingresos bajos o un enlace de solicitud no significan que califique. La agencia revisa la solicitud completa y las excepciones.',
    },
    source: 'https://www.hhs.texas.gov/services/financial',
  },
  {
    id: 'fpl',
    title: { en: 'Federal Poverty Level (FPL)', es: 'Nivel Federal de Pobreza (FPL)' },
    meaning: {
      en: 'An annual federal income guideline that varies by family size. Some programs use a percentage of it, but not all do. TANF, SSI and the Earned Income Tax Credit generally do not use these guidelines. A percentage alone is not an eligibility decision.',
      es: 'Una guía federal anual de ingresos que varía según el tamaño familiar. Algunos programas usan un porcentaje, pero no todos. TANF, SSI y el Crédito Tributario por Ingreso del Trabajo generalmente no usan estas guías. Un porcentaje no decide la elegibilidad.',
    },
    source: 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines',
  },
  {
    id: 'household',
    title: { en: 'Household', es: 'Hogar' },
    meaning: {
      en: 'The people a particular program counts together. This is not always everyone living at the address. For SNAP, buying and preparing food together matters, and special family rules apply. Ask each agency which people and income to include.',
      es: 'Las personas que un programa cuenta como grupo. No siempre son todas las que viven en la dirección. Para SNAP importa quién compra y prepara alimentos juntos, y hay reglas familiares especiales. Pregunte a cada agencia a quién y qué ingresos incluir.',
    },
    source: 'https://www.fna.usda.gov/snap/recipient/eligibility',
  },
  {
    id: 'gross-income',
    title: { en: 'Gross versus take-home income', es: 'Ingresos brutos y netos recibidos' },
    meaning: {
      en: 'Gross income is before taxes or payroll deductions. Take-home pay is what reaches you after those deductions. A benefit program may use its own countable-income calculation; do not subtract rent or bills unless its instructions allow it.',
      es: 'Los ingresos brutos son antes de impuestos o deducciones de nómina. El pago recibido es después de esas deducciones. Cada programa puede calcular los ingresos contables de otra forma; no reste renta ni facturas salvo que sus instrucciones lo permitan.',
    },
    source: 'https://www.fna.usda.gov/snap/recipient/eligibility',
  },
  {
    id: 'waitlist',
    title: { en: 'Waitlist versus application', es: 'Lista de espera y solicitud' },
    meaning: {
      en: 'Joining a waitlist records interest but does not promise a place, funding, or a start date. An application is a request for the agency to review you. Ask what comes next and how to report changed contact details.',
      es: 'Entrar en una lista de espera registra interés, pero no promete un cupo, fondos ni fecha de inicio. Una solicitud pide que la agencia revise su caso. Pregunte cuál es el siguiente paso y cómo actualizar sus datos de contacto.',
    },
  },
  {
    id: 'referral',
    title: { en: 'Referral and service area', es: 'Referencia y área de servicio' },
    meaning: {
      en: 'A referral points you to another organization; it is not an application or an appointment. A service area is where a provider can help. Nearby distance, an Austin mailing address, or a ZIP code alone may not establish that you are in its area.',
      es: 'Una referencia le dirige a otra organización; no es una solicitud ni una cita. El área de servicio indica dónde ayuda un proveedor. Estar cerca, tener dirección postal de Austin o un código postal no siempre confirma que esté en esa área.',
    },
  },
]

export function CommonTerms({ language }: { language: Language }) {
  const [selected, setSelected] = useState('eligibility')
  const term = terms.find(term => term.id === selected) ?? terms[0]
  const es = language === 'es'
  return (
    <details className="common-terms">
      <summary>{es ? 'Explicar términos comunes' : 'Explain common terms'}</summary>
      <p>{es ? 'Explicaciones revisadas que funcionan sin IA externa ni conexión.' : 'Reviewed explanations that work without external AI or a connection.'}</p>
      <label htmlFor="benefit-term">{es ? '¿Qué término quiere entender?' : 'Which term would you like explained?'}</label>
      <select id="benefit-term" value={selected} onChange={event => setSelected(event.target.value)}>
        {terms.map(term => <option key={term.id} value={term.id}>{localize(term.title, language)}</option>)}
      </select>
      <p role="status">{localize(term.meaning, language)}</p>
      {term.source && <a href={term.source} target="_blank" rel="noreferrer">{es ? 'Fuente oficial (nueva pestaña)' : 'Official source (new tab)'}</a>}
    </details>
  )
}
