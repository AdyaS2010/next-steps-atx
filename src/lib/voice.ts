import type { Language } from '../types'

/**
 * Browser recognition may use a remote service. Never start it without either
 * an enforceable local-only mode or explicit consent to browser-provider processing.
 */

type SpeechResultLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  processLocally?: boolean
  onresult: ((event: SpeechResultLike) => void) | null
  onerror: ((event: unknown) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type RecognitionCtor = new () => RecognitionLike

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const localeFor: Record<Language, string> = {
  en: 'en-US',
  es: 'es-MX',
}

export function isDictationSupported(): boolean {
  return getRecognitionCtor() !== null
}

/** Capability only: a supported language pack may still need to be installed. */
export function isLocalDictationSupported(): boolean {
  const Ctor = getRecognitionCtor()
  if (!Ctor) return false
  try {
    return 'processLocally' in new Ctor()
  } catch {
    return false
  }
}

export type DictationHandlers = {
  onResult: (transcript: string) => void
  onError?: () => void
  onEnd?: () => void
}

/** Start a single dictation turn. Returns a stop() function, or null if unsupported. */
export function startDictation(
  language: Language,
  handlers: DictationHandlers,
  options: { consentToRemote: boolean } = { consentToRemote: false },
): (() => void) | null {
  const Ctor = getRecognitionCtor()
  if (!Ctor) return null

  let recognition: RecognitionLike
  try { recognition = new Ctor() }
  catch { handlers.onError?.(); return null }
  if (!options.consentToRemote) {
    if (!('processLocally' in recognition)) {
      handlers.onError?.()
      return null
    }
    recognition.processLocally = true
  }
  recognition.lang = localeFor[language]
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript ?? ''
    if (transcript) handlers.onResult(transcript)
  }
  recognition.onerror = () => handlers.onError?.()
  recognition.onend = () => handlers.onEnd?.()

  try {
    recognition.start()
  } catch {
    handlers.onError?.()
    return null
  }
  return () => {
    try {
      recognition.stop()
    } catch {
      /* already stopped */
    }
  }
}

export function isReadAloudSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string, language: Language, onEnd?: () => void, onError?: () => void): void {
  if (!isReadAloudSupported()) { onError?.(); return }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = localeFor[language]
  utterance.rate = 0.98
  const localVoice = window.speechSynthesis.getVoices().find(voice => voice.localService && voice.lang.toLowerCase().startsWith(language))
  if (!localVoice) { onError?.(); return }
  utterance.voice = localVoice
  if (onEnd) utterance.onend = onEnd
  if (onError) utterance.onerror = onError
  try { window.speechSynthesis.speak(utterance) }
  catch { onError?.() }
}

export function stopSpeaking(): void {
  if (isReadAloudSupported()) window.speechSynthesis.cancel()
}
