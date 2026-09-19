import { useEffect, useRef, useState } from 'react'
import { getAiStatus, requestAiSuggestions, type AiStatus } from '../lib/ai'
import { categoryLabels } from '../data/facts'
import { localize } from '../lib/format'
import type { BenefitCategory, Language } from '../types'
import styles from './AiAssist.module.css'

export function AiAssist({ text, language, onNeeds }: {
  text: string
  language: Language
  onNeeds: (needs: BenefitCategory[]) => void
}) {
  const es = language === 'es'
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [opened, setOpened] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [consent, setConsent] = useState(false)
  const [consentFor, setConsentFor] = useState('')
  const [result, setResult] = useState<{ text: string; language: Language; needs: BenefitCategory[] } | null>(null)
  const latest = useRef({ text, language })
  const requestNumber = useRef(0)
  useEffect(() => { latest.current = { text, language } }, [text, language])
  const consented = consent && consentFor === `${language}:${text}`
  const tr = (en: string, spanish: string) => es ? spanish : en

  async function open() {
    setOpened(true)
    setBusy(true)
    setNotice('')
    const next = await getAiStatus()
    setStatus(next)
    setBusy(false)
  }

  async function ask() {
    if (!consented || !status?.available || busy) return
    const input = { text, language }
    const id = ++requestNumber.current
    setBusy(true)
    setNotice('')
    setResult(null)
    const response = await requestAiSuggestions(text, language, consented)
    setConsent(false)
    if (id !== requestNumber.current) return
    setBusy(false)
    if (latest.current.text !== input.text || latest.current.language !== input.language) {
      setNotice('changed')
    } else if (response.ok) {
      setResult({ ...input, needs: response.suggestions.needs })
    } else {
      setNotice(response.reason)
    }
  }

  return (
    <section className={styles.assist} aria-label={tr('Optional AI assistance', 'Asistencia de IA opcional')}>
      {!opened ? <button type="button" className={styles.open} onClick={() => void open()}>
        {tr('Optional AI help understanding my request', 'Ayuda de IA opcional para entender mi solicitud')}
      </button> : <>
        <div className={styles.row}>
          <strong>{tr('Optional AI understanding', 'Comprensión de IA opcional')}</strong>
          <button type="button" className={styles.open} disabled={busy} onClick={() => { setOpened(false); setConsent(false) }}>
            {tr('Close', 'Cerrar')}
          </button>
        </div>
        {busy && <p role="status">{tr('Working... You can still use the local guide.', 'Procesando... Puede seguir usando la guía local.')}</p>}
        {status && !status.available && <p role="status">
          {tr('External AI is not connected or is unavailable. The local guide still works: describe your need or use the buttons above. No description has been sent.',
            'La IA externa no está conectada o no está disponible. La guía local sigue funcionando: describa su necesidad o use los botones de arriba. No se ha enviado ninguna descripción.')}
        </p>}
        {status?.available && <>
          <p>{tr('AI can suggest need categories, not determine eligibility. You will confirm its suggestions. The local guide never needs this service.',
            'La IA puede sugerir categorías de ayuda, no determinar elegibilidad. Usted confirmará sus sugerencias. La guía local no necesita este servicio.')}</p>
          <p><strong>{tr('Recipient:', 'Destinatario:')}</strong> {status.provider} {tr('through this app’s server.', 'a través del servidor de esta aplicación.')}</p>
          <p>{tr('Only the following description and your chosen language will be sent. It may contain private circumstances. Do not include identification, account numbers, names, or sensitive documents. The provider’s own data policies apply.',
            'Solo se enviarán la siguiente descripción y el idioma elegido. Puede contener circunstancias privadas. No incluya identificaciones, números de cuenta, nombres ni documentos sensibles. Se aplican las políticas de datos del proveedor.')}</p>
          <pre className={styles.preview}>{text || tr('(No description yet)', '(Todavía no hay descripción)')}</pre>
          <label className={styles.consent}>
            <input type="checkbox" checked={consented} disabled={busy} onChange={event => {
              setConsent(event.target.checked)
              setConsentFor(`${language}:${text}`)
            }} />
            <span>{tr('I agree to send this description for this request.', 'Acepto enviar esta descripción para esta solicitud.')}</span>
          </label>
          <button type="button" className={styles.primary} disabled={!consented || busy || !text.trim() || text.length > 1800} onClick={() => void ask()}>
            {tr('Send to AI and review suggestions', 'Enviar a IA y revisar sugerencias')}
          </button>
          {text.length > 1800 && <p>{tr('Shorten the description to 1,800 characters, or use the local guide.', 'Reduzca la descripción a 1.800 caracteres o use la guía local.')}</p>}
        </>}
        {notice && <p role="status">
          {notice === 'changed'
            ? tr('Your description changed. The earlier AI response was discarded; review the current text before trying again.', 'Su descripción cambió. Se descartó la respuesta anterior; revise el texto antes de volver a intentar.')
            : tr('AI could not provide a confident, validated suggestion. Nothing was applied. Continue with the local guide or choose a need above.', 'La IA no pudo ofrecer una sugerencia validada y confiable. No se aplicó ningún cambio. Continúe con la guía local o elija una necesidad arriba.')}
        </p>}
        {result && <div className={styles.suggestions}>
          <strong>{tr('Suggested needs — please review', 'Necesidades sugeridas — revíselas')}</strong>
          <p>{result.needs.map(need => localize(categoryLabels[need], language)).join(' · ')}</p>
          <button type="button" className={styles.primary}
            disabled={result.text !== text || result.language !== language}
            onClick={() => onNeeds(result.needs)}>
            {tr('Use these needs and confirm details', 'Usar estas necesidades y confirmar los detalles')}
          </button>
        </div>}
      </>}
    </section>
  )
}
