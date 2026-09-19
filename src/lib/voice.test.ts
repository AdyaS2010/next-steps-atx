import { afterEach, describe, expect, it, vi } from 'vitest'
import { isDictationSupported, isLocalDictationSupported, speak, startDictation } from './voice'

afterEach(() => vi.unstubAllGlobals())

describe('voice processing consent', () => {
  it('does not start remote recognition without consent', () => {
    const start = vi.fn()
    vi.stubGlobal('SpeechRecognition', class { start = start })
    const onError = vi.fn()
    expect(startDictation('en', { onResult: vi.fn(), onError })).toBeNull()
    expect(start).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledOnce()
    expect(isLocalDictationSupported()).toBe(false)
  })
  it('enforces local processing when supported and never falls back remotely', () => {
    const settings: boolean[] = []
    vi.stubGlobal('SpeechRecognition', class {
      processLocally = false
      start() { settings.push(this.processLocally) }
      stop() {}
    })
    expect(isLocalDictationSupported()).toBe(true)
    expect(startDictation('es', { onResult: vi.fn() })).toBeTypeOf('function')
    expect(settings).toEqual([true])
  })
  it('allows browser speech processing only for an explicitly consented request', () => {
    const start = vi.fn()
    vi.stubGlobal('SpeechRecognition', class { start = start; stop() {} })
    expect(startDictation('en', { onResult: vi.fn() }, { consentToRemote: true })).toBeTypeOf('function')
    expect(start).toHaveBeenCalledOnce()
  })
  it('keeps typing available when recognition is missing or fails to start', () => {
    vi.stubGlobal('SpeechRecognition', undefined)
    vi.stubGlobal('webkitSpeechRecognition', undefined)
    expect(isDictationSupported()).toBe(false)
    expect(startDictation('en', { onResult: vi.fn() })).toBeNull()
    vi.stubGlobal('SpeechRecognition', class { processLocally = false; start() { throw new Error('Language pack missing') } })
    const onError = vi.fn()
    expect(startDictation('en', { onResult: vi.fn(), onError })).toBeNull()
    expect(onError).toHaveBeenCalledOnce()
  })
  it('does not read private text through an unknown remote voice', () => {
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} })
    const output = vi.fn()
    vi.stubGlobal('speechSynthesis', { cancel() {}, getVoices: () => [{ localService: false, lang: 'en-US' }], speak: output })
    const error = vi.fn()
    speak('Catalog content', 'en', undefined, error)
    expect(output).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledOnce()
  })
})
