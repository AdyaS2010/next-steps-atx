import { useEffect, useRef, useState } from 'react'
import { Mic } from 'lucide-react'
import { isDictationSupported, startDictation } from '../lib/voice'
import { createTranslator } from '../lib/i18n'
import type { Language } from '../types'

export default function VoiceInput({ language, onText }: { language: Language; onText: (text: string) => void }) {
  const t = createTranslator(language)
  const [consentPrompt, setConsentPrompt] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(false)
  const stop = useRef<(() => void) | null>(null)
  useEffect(() => () => { stop.current?.() }, [language])
  if (!isDictationSupported()) return null
  const start = () => {
    setConsentPrompt(false); setError(false)
    let failed = false
    let ended = false
    const controller = startDictation(language, {
      onResult: onText,
      onError: () => { failed = true; setError(true); setListening(false) },
      onEnd: () => { ended = true; setListening(false); stop.current = null },
    }, { consentToRemote: true })
    stop.current = failed || ended ? null : controller
    setListening(Boolean(controller) && !failed && !ended)
    if (!controller) setError(true)
  }
  return <div className="voice-input">
    {listening ? <button type="button" onClick={() => { stop.current?.(); stop.current = null; setListening(false) }}>{t('stopVoice')}</button> :
      <button type="button" aria-expanded={consentPrompt} onClick={() => setConsentPrompt(value => !value)}><Mic size={18} aria-hidden="true" />{t('voice')}</button>}
    {listening && <span role="status">{t('listening')}</span>}
    {consentPrompt && <div className="notice" role="region" aria-label={t('voice')}>
      <p>{t('voiceDisclosure')}</p><div className="button-row">
        <button type="button" onClick={start}>{t('allowVoice')}</button><button type="button" onClick={() => setConsentPrompt(false)}>{t('denyVoice')}</button>
      </div></div>}
    {error && <p role="alert">{t('voiceError')}</p>}
  </div>
}
