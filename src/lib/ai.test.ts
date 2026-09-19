import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseAiSuggestions } from './ai-contract'
import { getAiStatus, requestAiSuggestions } from './ai'

afterEach(() => vi.unstubAllGlobals())

describe('optional AI boundaries', () => {
  it('never sends a description without consent', async () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    expect(await requestAiSuggestions('Help with transport', 'en', false)).toEqual({ ok: false, reason: 'consent' })
    expect(request).not.toHaveBeenCalled()
  })
  it('accepts only known categories and no invented facts, URLs or explanations', () => {
    expect(parseAiSuggestions({ needs: ['transportation'], confidence: 'high' })).not.toBeNull()
    expect(parseAiSuggestions({ needs: ['transportation'], confidence: 'high', url: 'https://bad.example' })).toBeNull()
    expect(parseAiSuggestions({ needs: ['made-up'], confidence: 'high' })).toBeNull()
    expect(parseAiSuggestions({ needs: ['food', 'food'], confidence: 'high' })).toBeNull()
    expect(parseAiSuggestions({ needs: [], confidence: 'high' })).toBeNull()
  })
  it('returns a clearly unavailable mode without a server or with malformed output', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Static app</html>')))
    expect((await getAiStatus()).available).toBe(false)
    expect((await requestAiSuggestions('Need food', 'en', true)).ok).toBe(false)
  })
  it('does not apply low-confidence or malformed model suggestions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ needs: [], confidence: 'low' }))))
    expect(await requestAiSuggestions('Unclear question', 'en', true)).toEqual({ ok: false, reason: 'uncertain' })
  })
  it('uses only a same-origin endpoint, sends only consented text and language', async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ needs: ['food'], confidence: 'high' })))
    vi.stubGlobal('fetch', request)
    expect((await requestAiSuggestions('Need food', 'en', true)).ok).toBe(true)
    const [url, options] = request.mock.calls[0]
    expect(url).toBe('/api/ai/navigate')
    expect(JSON.parse(options.body)).toEqual({ text: 'Need food', language: 'en', consent: true })
    expect(options.cache).toBe('no-store')
  })
  it('fails back on offline or timed out service, without retries', async () => {
    const request = vi.fn().mockRejectedValue(new DOMException('Timeout', 'TimeoutError'))
    vi.stubGlobal('fetch', request)
    expect(await requestAiSuggestions('Need food', 'en', true)).toEqual({ ok: false, reason: 'timeout' })
    expect(request).toHaveBeenCalledTimes(1)
  })
})
