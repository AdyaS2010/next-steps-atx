import { describe, expect, it } from 'vitest'
import { minimumsOnly, simulatePayoff } from './debt'

const debts = [
  { name: 'Store card', balance: 500, apr: 25, minimum: 25 },
  { name: 'Car loan', balance: 4000, apr: 7, minimum: 150 },
  { name: 'Credit card', balance: 2500, apr: 22, minimum: 60 },
]

describe('debt payoff', () => {
  it('pays the smallest balance first with snowball', () => {
    expect(simulatePayoff(debts, 100, 'snowball').order[0].name).toBe('Store card')
  })

  it('never costs more interest with avalanche than snowball', () => {
    const snowball = simulatePayoff(debts, 100, 'snowball')
    const avalanche = simulatePayoff(debts, 100, 'avalanche')
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest)
    expect(avalanche.order).toHaveLength(3)
  })

  it('finishes sooner and cheaper than paying only minimums', () => {
    const plan = simulatePayoff(debts, 100, 'avalanche')
    const baseline = minimumsOnly(debts)
    expect(plan.months).toBeLessThan(baseline.months)
    expect(plan.totalInterest).toBeLessThan(baseline.totalInterest)
  })

  it('reports when payments cannot cover interest', () => {
    expect(simulatePayoff([{ name: 'Loan', balance: 10000, apr: 30, minimum: 100 }], 0, 'snowball').feasible).toBe(false)
  })

  it('handles zero-interest debt and ignores invalid rows', () => {
    const result = simulatePayoff([{ name: 'Family loan', balance: 300, apr: 0, minimum: 100 }, { name: 'Bad', balance: Number.NaN, apr: 0, minimum: 10 }], 0, 'snowball')
    expect(result).toMatchObject({ feasible: true, months: 3, totalInterest: 0 })
  })
})
