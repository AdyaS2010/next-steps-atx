import { describe, expect, it } from 'vitest'
import { programs } from '../data/programs'
import { emptyHousehold, rankRecommendations } from './eligibility'
import { buildActionPlan, callQuestions, callScript, phaseFor, phases } from './plan'
import type { BenefitCategory, Household, HouseholdFlag } from '../types'

function household(needs: BenefitCategory[], flags: Partial<Record<HouseholdFlag, boolean>> = {}, extra: Partial<Household> = {}): Household {
  return { ...emptyHousehold(), needs, ...flags, ...extra }
}

function planFor(value: Household) {
  return buildActionPlan(rankRecommendations(programs, value), value)
}

describe('action plan', () => {
  it('puts legal deadlines and safety first for a renter facing eviction', () => {
    const plan = planFor(household(['housing', 'safety', 'utilities'], { isRenter: true }))
    const now = plan.items.now.map(item => item.program.id)
    expect(now).toContain('eviction-legal-info')
    expect(now.some(id => ['safe-alliance', 'volunteer-legal-services'].includes(id))).toBe(true)
    expect(plan.items.week.length + plan.items.month.length).toBeGreaterThan(0)
  })

  it('treats housing as immediate for someone without a stable place to stay', () => {
    const value = household(['housing'], { isHomeless: true })
    const shelter = programs.find(program => program.id === 'emergency-shelter')!
    expect(phaseFor(shelter, value).phase).toBe('now')
    expect(planFor(value).items.now.map(item => item.program.id)).toContain('coordinated-entry')
  })

  it('never plans a result that contradicts stated facts', () => {
    const value = household(['health'], { isUninsured: true }, { county: 'other' })
    const plan = planFor(value)
    const planned = phases.flatMap(phase => plan.items[phase].map(item => item.program.id))
    expect(planned).not.toContain('map')
    for (const phase of phases) expect(plan.items[phase].length).toBeLessThanOrEqual(4)
  })

  it('schedules waitlists this week and skill-building later', () => {
    const value = household(['family', 'education'], { hasChildUnder13: true, isWorkingOrTraining: true })
    const childCare = programs.find(program => program.id === 'child-care')!
    const training = programs.find(program => program.id === 'career-training')!
    expect(phaseFor(childCare, value).phase).toBe('week')
    expect(phaseFor(training, value).phase).toBe('month')
  })

  it('combines document reminders without duplicates and counts every item', () => {
    const plan = planFor(household(['food', 'health', 'income'], { isUnemployed: true }))
    expect(new Set(plan.documents.map(document => document.en)).size).toBe(plan.documents.length)
    expect(plan.total).toBe(phases.reduce((sum, phase) => sum + plan.items[phase].length, 0))
    expect(plan.items.now.map(item => item.program.id)).toContain('unemployment')
  })

  it('leaves out audience-specific programs the person has not confirmed', () => {
    const plan = planFor(household(['income', 'food', 'health', 'utilities'], { isUnemployed: true }))
    const planned = phases.flatMap(phase => plan.items[phase].map(item => item.program.id))
    for (const id of ['medicare-counseling', 'senior-meals', 'school-meals', 'wic']) expect(planned).not.toContain(id)
    const senior = planFor(household(['food'], { hasSenior60Plus: true }))
    expect(phases.flatMap(phase => senior.items[phase].map(item => item.program.id))).toContain('senior-meals')
  })

  it('returns an empty plan without recommendations', () => {
    expect(buildActionPlan([], emptyHousehold()).total).toBe(0)
  })

  it('writes a bilingual call script with the provider name and every question', () => {
    const snap = programs.find(program => program.id === 'snap')!
    for (const language of ['en', 'es'] as const) {
      const script = callScript(snap, language)
      expect(script).toContain(snap.name)
      for (const question of callQuestions) expect(script).toContain(question[language])
    }
  })
})
