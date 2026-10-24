import { describe, expect, it } from 'vitest'
import { programs } from '../data/programs'
import { expenseLines, summarizeBudget } from './money'

describe('money check', () => {
  it('computes the monthly balance and ranks the biggest costs first', () => {
    const summary = summarizeBudget({ income: 3000, housing: 1200, food: 500, phone: 80 })
    expect(summary.totalExpenses).toBe(1780)
    expect(summary.balance).toBe(1220)
    expect(summary.ranked.map(line => line.key)).toEqual(['housing', 'food', 'phone'])
  })

  it('reports a shortfall as a negative balance', () => {
    expect(summarizeBudget({ income: 1500, housing: 1400, utilities: 200 }).balance).toBe(-100)
  })

  it('uses HUD burden thresholds with utilities counted as housing cost', () => {
    expect(summarizeBudget({ income: 4000, housing: 1000, utilities: 150 }).housingBurden).toBe('none')
    expect(summarizeBudget({ income: 3000, housing: 1000, utilities: 150 }).housingBurden).toBe('burdened')
    expect(summarizeBudget({ income: 2000, housing: 900, utilities: 150 }).housingBurden).toBe('severe')
  })

  it('does not guess when income or housing is missing', () => {
    const summary = summarizeBudget({ income: null, housing: 1000 })
    expect(summary.balance).toBeNull()
    expect(summary.housingBurden).toBeNull()
    expect(summarizeBudget({ income: 0, housing: 500 }).housingShare).toBeNull()
  })

  it('ignores invalid and negative amounts', () => {
    const summary = summarizeBudget({ income: 1000, housing: -50, food: Number.NaN, phone: 40 })
    expect(summary.totalExpenses).toBe(40)
    expect(summary.ranked).toHaveLength(1)
  })

  it('only points to programs that exist in the catalog', () => {
    const ids = new Set(programs.map(program => program.id))
    for (const line of expenseLines) {
      expect(line.programIds.length).toBeGreaterThan(0)
      for (const id of line.programIds) expect(ids.has(id), id).toBe(true)
    }
  })
})
