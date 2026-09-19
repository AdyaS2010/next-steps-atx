// @vitest-environment node
import { createServer } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { classifyNeeds, createAiHandler, parseRequest, readAiConfig } from './ai-service.ts'

const env = {
  BENEFITS_AI_URL: 'https://api.openai.com/v1/chat/completions',
  BENEFITS_AI_KEY: 'test-placeholder-not-a-real-key',
  BENEFITS_AI_MODEL: 'test-model',
}
const input = { text: 'I need food', language: 'en' as const, consent: true as const }
afterEach(() => vi.restoreAllMocks())

describe('server AI boundary', () => {
  it('stays unconfigured without keys and rejects unsafe provider destinations', () => {
    expect(readAiConfig({})).toBeNull()
    expect(readAiConfig({ ...env, BENEFITS_AI_URL: 'http://127.0.0.1/private' })).toBeNull()
    expect(readAiConfig({ ...env, BENEFITS_AI_URL: 'https://api.openai.com.evil.example/v1/chat/completions' })).toBeNull()
    expect(readAiConfig({ ...env, BENEFITS_AI_URL: 'https://user:pass@api.openai.com/v1/chat/completions' })).toBeNull()
    expect(readAiConfig(env)?.url.hostname).toBe('api.openai.com')
  })
  it('requires explicit consent and rejects unnecessary identifiers and oversized input', () => {
    expect(parseRequest({ ...input, consent: false })).toBeNull()
    expect(parseRequest({ ...input, text: 'My SSN is 123-45-6789' })).toBeNull()
    expect(parseRequest({ ...input, text: 'x'.repeat(1801) })).toBeNull()
    expect(parseRequest({ ...input, household: {} })).toBeNull()
    expect(parseRequest(input)).toEqual(input)
  })
  it('does not accept invented facts, contact details or unknown categories', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"needs":["food"],"confidence":"high","phone":"555"}' } }] })))
    await expect(classifyNeeds(input, readAiConfig(env)!, request)).rejects.toThrow()
  })
  it('bounds latency even if an adapter ignores AbortSignal', async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(() => new Promise(() => {}))
    await expect(classifyNeeds(input, readAiConfig(env)!, request, 10)).rejects.toThrow('timed out')
  })
  it('keeps keys on the provider request and accepts only validated output', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"needs":["food"],"confidence":"high"}' } }] })))
    const result = await classifyNeeds(input, readAiConfig(env)!, request)
    expect(result).toEqual({ needs: ['food'], confidence: 'high' })
    expect(JSON.stringify(result)).not.toContain(env.BENEFITS_AI_KEY)
    expect(request.mock.calls[0][1]?.redirect).toBe('error')
  })
  it('serves unavailable status, rejects foreign origins, and rate-limits requests', async () => {
    const providerFetch = vi.fn<typeof fetch>().mockImplementation(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"needs":["food"],"confidence":"high"}' } }] })))
    const handler = createAiHandler({ env, providerFetch })
    const server = createServer((request, response) => { void handler(request, response) })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server did not start')
    const base = `http://127.0.0.1:${address.port}`
    try {
      const status = await fetch(`${base}/api/ai/status`)
      expect(status.headers.get('cache-control')).toBe('no-store')
      expect(await status.json()).toEqual({ available: true, provider: 'api.openai.com' })
      const body = JSON.stringify(input)
      expect((await fetch(`${base}/api/ai/navigate`, { method: 'POST', headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' }, body })).status).toBe(403)
      for (let i = 0; i < 6; i++) expect((await fetch(`${base}/api/ai/navigate`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body })).status).toBe(200)
      expect((await fetch(`${base}/api/ai/navigate`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body })).status).toBe(429)
      expect(providerFetch).toHaveBeenCalledTimes(6)
    } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
  })
})
