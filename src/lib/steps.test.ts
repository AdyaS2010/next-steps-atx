import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { parseSteps, planText, STEPS_KEY, useSteps } from './steps'

vi.mock('../data/programs', () => ({
  programs: [{
    id: 'fixture', name: 'Example service', provides: { en: 'Helpful service', es: 'Servicio útil' },
    steps: [{ id: 'call', title: { en: 'Call provider', es: 'Llamar al proveedor' }, detail: { en: 'Ask about intake.', es: 'Pregunte por la admisión.' } }],
    sources: [{ label: 'Official', url: 'https://example.org/service', checkedOn: '2026-09-12' }],
  }],
}))

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('optional saved checklists', () => {
  it('does not store anything until the user saves a program', () => {
    const { result } = renderHook(useSteps)
    expect(result.current.entries).toEqual([])
    expect(localStorage.length).toBe(0)
    act(() => result.current.saveProgram('fixture'))
    expect(JSON.parse(localStorage.getItem(STEPS_KEY)!)).toEqual({
      version: 1, entries: [{ programId: 'fixture', completed: [] }],
    })
  })
  it('resumes completed steps and exports only catalog content, not household details', () => {
    const first = renderHook(useSteps)
    act(() => first.result.current.saveProgram('fixture'))
    act(() => first.result.current.toggleStep('fixture', 'call'))
    first.unmount()
    const { result } = renderHook(useSteps)
    expect(result.current.entries[0].completed).toEqual(['call'])
    expect(result.current.exportText('es')).toContain('[x] Llamar al proveedor')
    expect(result.current.exportText('en')).toContain('https://example.org/service')
    expect(localStorage.getItem(STEPS_KEY)).not.toMatch(/income|household|prompt/)
  })
  it('refuses unknown programs, unknown steps and unintended stored fields', () => {
    expect(() => parseSteps('{"version":1,"entries":[{"programId":"missing","completed":[]}]}')).toThrow()
    expect(() => parseSteps('{"version":1,"entries":[{"programId":"fixture","completed":["missing"]}]}')).toThrow()
    expect(() => parseSteps('{"version":1,"entries":[],"household":{}}')).toThrow()
  })
  it('preserves corrupt data until an explicit clear and leaves other app data intact', () => {
    localStorage.setItem(STEPS_KEY, 'corrupted')
    localStorage.setItem('other-app', 'untouched')
    const { result } = renderHook(useSteps)
    expect(result.current.corrupt).toBe(true)
    act(() => result.current.saveProgram('fixture'))
    expect(localStorage.getItem(STEPS_KEY)).toBe('corrupted')
    act(() => result.current.clear())
    expect(result.current.entries).toEqual([])
    expect(result.current.ready).toBe(true)
    expect(localStorage.getItem('other-app')).toBe('untouched')
  })
  it('surfaces read and write storage failures instead of false save success', () => {
    const deny = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    const first = renderHook(useSteps)
    expect(first.result.current.error?.en).toContain('unavailable')
    first.unmount()
    deny.mockRestore()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    const { result } = renderHook(useSteps)
    act(() => result.current.saveProgram('fixture'))
    expect(result.current.entries).toEqual([])
    expect(result.current.error?.en).toContain('not saved')
  })
  it('prints an empty plan honestly', () => {
    expect(planText([], 'en')).toContain('does not submit an application')
  })
})
