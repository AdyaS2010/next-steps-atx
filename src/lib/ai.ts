import type { Language } from '../types'
import { parseAiSuggestions, type AiSuggestions } from './ai-contract'

export type AiStatus = { available: boolean; provider: string | null }
export type AiResult =
  | { ok: true; suggestions: AiSuggestions }
  | { ok: false; reason: 'consent' | 'unavailable' | 'timeout' | 'uncertain' | 'invalid' }

export async function getAiStatus(): Promise<AiStatus> {
  try {
    const response = await fetch('/api/ai/status', { cache: 'no-store', signal: AbortSignal.timeout(2000) })
    if (!response.ok) return { available: false, provider: null }
    const value: unknown = await response.json()
    if (value && typeof value === 'object' && 'available' in value && value.available === true &&
        'provider' in value && typeof value.provider === 'string' && value.provider.length < 180) {
      return { available: true, provider: value.provider }
    }
  } catch {
    // The calling interface explicitly labels unavailable AI and keeps local guidance.
  }
  return { available: false, provider: null }
}

export async function requestAiSuggestions(text: string, language: Language, consent: boolean): Promise<AiResult> {
  if (!consent) return { ok: false, reason: 'consent' }
  if (!text.trim() || text.length > 1800) return { ok: false, reason: 'invalid' }
  try {
    const response = await fetch('/api/ai/navigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ text, language, consent: true }),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return { ok: false, reason: 'unavailable' }
    const suggestions = parseAiSuggestions(await response.json())
    if (!suggestions) return { ok: false, reason: 'invalid' }
    if (suggestions.confidence !== 'high') return { ok: false, reason: 'uncertain' }
    return { ok: true, suggestions }
  } catch (error) {
    const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : ''
    return { ok: false, reason: /Timeout|Abort/.test(name) ? 'timeout' : 'unavailable' }
  }
}
