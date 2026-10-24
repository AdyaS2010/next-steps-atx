import { describe, expect, it } from 'vitest'
import { categoryOrder } from './facts'
import { pathways } from './pathways'
import { programs } from './programs'
import { emptyHousehold, rankRecommendations } from '../lib/eligibility'
import { buildActionPlan } from '../lib/plan'

describe('life-situation pathways', () => {
  it('has unique IDs and complete bilingual copy', () => {
    expect(new Set(pathways.map(pathway => pathway.id)).size).toBe(pathways.length)
    for (const pathway of pathways) {
      for (const value of [pathway.title, pathway.summary, ...pathway.facts.map(fact => fact.text)]) {
        expect(value.en.trim().length).toBeGreaterThan(8)
        expect(value.es.trim().length).toBeGreaterThan(8)
        expect(value.es).not.toBe(value.en)
      }
    }
  })

  it.each(pathways)('$id cites official HTTPS sources for every fact', pathway => {
    expect(pathway.facts.length).toBeGreaterThan(0)
    for (const fact of pathway.facts) {
      expect(new URL(fact.source.url).protocol).toBe('https:')
      expect(fact.source.label.length).toBeGreaterThan(8)
    }
  })

  it.each(pathways)('$id produces a non-empty plan from its suggested details', pathway => {
    expect(pathway.needs.length).toBeGreaterThan(0)
    pathway.needs.forEach(need => expect(categoryOrder).toContain(need))
    const household = { ...emptyHousehold(), needs: pathway.needs }
    for (const flag of pathway.flags) household[flag] = true
    const plan = buildActionPlan(rankRecommendations(programs, household), household)
    expect(plan.total).toBeGreaterThan(1)
  })

  it('offers a quick exit only for the unsafe-home pathway', () => {
    expect(pathways.filter(pathway => pathway.quickExit).map(pathway => pathway.id)).toEqual(['unsafe-home'])
  })
})
