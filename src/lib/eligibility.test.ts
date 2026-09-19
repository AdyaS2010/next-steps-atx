import { describe, expect, it } from 'vitest'
import {
  annualFpl,
  emptyHousehold,
  evaluateProgram,
  percentOfFpl,
  rankRecommendations,
  relevantQuestions,
  screenPrograms,
} from './eligibility'
import type { Household, Program } from '../types'
import { programs } from '../data/programs'

const snap: Program = {
  id: 'snap',
  name: 'SNAP',
  category: 'food',
  agency: 'Texas HHS',
  provides: { en: 'Food benefits', es: 'Beneficios de alimentos' },
  eligibilitySummary: { en: '', es: '' },
  fplLimit: 165,
  documents: [],
}

const wic: Program = {
  ...snap,
  id: 'wic',
  name: 'WIC',
  fplLimit: 185,
  requiresAny: ['hasChildUnder5OrPregnant'],
}

const taxPrep: Program = {
  ...snap,
  id: 'tax',
  name: 'Free Tax Prep',
  category: 'financial',
  fplLimit: undefined,
  alwaysShow: true,
}

function household(overrides: Partial<Household>): Household {
  return { ...emptyHousehold(), ...overrides }
}

describe('eligibility engine', () => {
  it('computes Federal Poverty Level by household size', () => {
    expect(annualFpl(1)).toBe(15960)
    expect(annualFpl(4)).toBe(33000)
    expect(annualFpl(10)).toBe(55720 + 2 * 5680)
  })

  it('computes percent of FPL from monthly income', () => {
    // Family of 4, $2000/mo = $24,000/yr; FPL(4)=$33,000 -> ~73%
    expect(percentOfFpl(2000, 4)).toBe(73)
  })

  it('does not establish SNAP eligibility from low gross income alone', () => {
    expect(evaluateProgram(snap, household({ size: 4, monthlyIncome: 2000 }))).toBe('maybe')
  })

  it('leaves approximate income comparisons for agency review', () => {
    expect(evaluateProgram(snap, household({ size: 4, monthlyIncome: 5000 }))).toBe('maybe')
  })

  it('does not exclude a household using a universal FPL cutoff', () => {
    expect(evaluateProgram(snap, household({ size: 4, monthlyIncome: 9000 }))).toBe('maybe')
  })

  it('treats unknown income as maybe for income programs', () => {
    expect(evaluateProgram(snap, household({ size: 4, monthlyIncome: null }))).toBe('maybe')
  })

  it('requires categorical match (WIC needs a young child or pregnancy)', () => {
    expect(evaluateProgram(wic, household({ size: 3, monthlyIncome: 1500 }))).toBe('maybe')
    expect(
      evaluateProgram(
        wic,
        household({ size: 3, monthlyIncome: 1500, hasChildUnder5OrPregnant: true }),
      ),
    ).toBe('maybe')
    expect(evaluateProgram(wic, household({ hasChildUnder5OrPregnant: false }))).toBe('unlikely')
  })

  it('always shows awareness programs as info', () => {
    expect(evaluateProgram(taxPrep, household({ monthlyIncome: 100000 }))).toBe('info')
  })

  it('sorts likely first and unlikely last', () => {
    const audienceMatch: Program = { ...snap, id: 'audience', fplLimit: undefined, requiresAll: ['isRenter'] }
    const result = screenPrograms(
      [snap, wic, taxPrep, audienceMatch],
      household({ size: 4, monthlyIncome: 2000, isRenter: true, hasChildUnder5OrPregnant: false }),
    )
    expect(result[0].likelihood).toBe('likely')
    expect(result[result.length - 1].likelihood).toBe('unlikely')
  })

  it('creates entirely unknown households with independent arrays', () => {
    const first = emptyHousehold()
    expect(first).toMatchObject({ size: null, monthlyIncome: null, county: null, zip: null, needs: [] })
    expect(Object.entries(first).filter(([key]) => !['needs', 'size', 'monthlyIncome', 'county', 'zip'].includes(key)).every(([, value]) => value === null)).toBe(true)
    first.needs.push('food')
    expect(emptyHousehold().needs).toEqual([])
  })

  it('guards unknown FPL inputs without guessing a size', () => {
    expect(annualFpl(null)).toBeNull()
    expect(percentOfFpl(2000, null)).toBeNull()
    expect(percentOfFpl(null, 4)).toBeNull()
    expect(percentOfFpl(0, 1)).toBe(0)
  })

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])('rejects invalid FPL household size %s', (size) => {
    expect(() => annualFpl(size)).toThrow(RangeError)
  })

  it.each([-1, NaN, Infinity, Number.MAX_VALUE])('rejects invalid FPL income %s', (income) => {
    expect(() => percentOfFpl(income, 2)).toThrow(RangeError)
  })

  it('implements requiresAll with true, false, and unknown values', () => {
    const program = { ...snap, id: 'categorical', fplLimit: undefined, requiresAll: ['isRenter', 'hasChildrenUnder18'] as const }
    const record: Program = { ...program, requiresAll: [...program.requiresAll] }
    expect(evaluateProgram(record, household({ isRenter: true }))).toBe('maybe')
    expect(evaluateProgram(record, household({ isRenter: true, hasChildrenUnder18: false }))).toBe('unlikely')
    expect(evaluateProgram(record, household({ isRenter: true, hasChildrenUnder18: true }))).toBe('likely')
  })

  it('only rejects requiresAny when every alternative is explicitly false', () => {
    const program: Program = { ...snap, id: 'categorical', fplLimit: undefined, requiresAny: ['hasSenior60Plus', 'hasDisability'] }
    expect(evaluateProgram(program, household({ hasSenior60Plus: false }))).toBe('maybe')
    expect(evaluateProgram(program, household({ hasSenior60Plus: false, hasDisability: false }))).toBe('unlikely')
    expect(evaluateProgram(program, household({ hasSenior60Plus: false, hasDisability: true }))).toBe('likely')
  })

  it('requires both All and Any groups to match', () => {
    const program: Program = { ...snap, requiresAll: ['isRenter'], requiresAny: ['hasSenior60Plus', 'hasDisability'] }
    expect(evaluateProgram(program, household({ isRenter: false, hasDisability: true }))).toBe('unlikely')
    expect(evaluateProgram(program, household({ isRenter: true, hasDisability: false }))).toBe('maybe')
  })

  it('does not treat programs with no screening rules as open eligibility', () => {
    expect(evaluateProgram({ ...snap, id: 'unknown-rules', fplLimit: undefined }, household({}))).toBe('maybe')
    expect(evaluateProgram({ ...snap, actionKind: 'referral' }, household({}))).toBe('info')
  })
})

describe('ranked recommendations and contextual follow-ups', () => {
  function missing(id: string, overrides: Partial<Household> = {}): string {
    const [result] = rankRecommendations([{ ...snap, id, category: 'health' }], household({ needs: ['health'], ...overrides }))
    return result.missing.map((item) => item.en).join(' ')
  }

  it('filters by selected needs, without an engine-level count cap', () => {
    const programs = Array.from({ length: 8 }, (_, index) => ({ ...snap, id: `food-${index}` }))
    const ranked = rankRecommendations([...programs, taxPrep], household({ needs: ['food'] }))
    expect(ranked).toHaveLength(8)
    expect(ranked.every((item) => item.program.category === 'food')).toBe(true)
  })

  describe('published catalog matching', () => {
    it('never excludes an entirely unknown household or promises general-resource eligibility', () => {
      const results = rankRecommendations(programs, emptyHousehold())
      expect(results).toHaveLength(programs.length)
      expect(results.every((result) => result.likelihood !== 'unlikely')).toBe(true)
      expect(results.filter((result) => result.program.alwaysShow).every((result) => result.likelihood === 'info')).toBe(true)
      expect(results.every((result) => [...result.reasons, ...result.missing].every((text) => Boolean(text.en && text.es)))).toBe(true)
    })

    it('keeps transit recommendations relevant and contextual MAP details intact', () => {
      const transit = rankRecommendations(programs, household({ needs: ['transportation'] }))
      expect(transit.length).toBeGreaterThan(0)
      expect(transit.every((result) => result.program.category === 'transportation')).toBe(true)
      const map = rankRecommendations(programs, household({ needs: ['health'] })).find((result) => result.program.id === 'map')
      expect(map).toBeDefined()
      expect(map!.missing.some((text) => text.en.includes('Travis County'))).toBe(true)
      expect(map!.missing.some((text) => /uninsured|without health insurance/.test(text.en))).toBe(true)
    })

    it('puts broad food help in the first three rather than only unknown categorical programs', () => {
      const results = rankRecommendations(programs, household({ needs: ['food'] }))
      const ids = results.map((result) => result.program.id)
      expect(ids.slice(0, 3)).toContain('food-bank')
      expect(ids.indexOf('food-bank')).toBeLessThan(ids.indexOf('wic'))
      expect(ids.indexOf('food-bank')).toBeLessThan(ids.indexOf('school-meals'))
      expect(results.find((result) => result.program.id === 'food-bank')!.likelihood).toBe('info')
    })

    it('starts general health requests with clinics and coverage navigation', () => {
      const ids = rankRecommendations(programs, household({ needs: ['health'] })).map((result) => result.program.id)
      expect(ids.slice(0, 2)).toEqual(['communitycare', 'insure-central-texas'])
      expect(ids.indexOf('communitycare')).toBeLessThan(ids.indexOf('medicare-counseling'))
      expect(ids.indexOf('insure-central-texas')).toBeLessThan(ids.indexOf('chip'))
    })

    it('starts unknown transportation requests with regular transit and Pickup, not paratransit', () => {
      const ids = rankRecommendations(programs, household({ needs: ['transportation'] })).map((result) => result.program.id)
      expect(ids.slice(0, 2)).toEqual(['capmetro-transit', 'capmetro-pickup'])
      expect(ids.indexOf('capmetro-access')).toBeGreaterThan(ids.indexOf('capmetro-pickup'))
    })

    it('offers employment and related training before TANF when children are unknown', () => {
      const results = rankRecommendations(programs, household({ needs: ['income'] }))
      const ids = results.map((result) => result.program.id)
      expect(ids.slice(0, 2)).toEqual(['job-search', 'career-training'])
      expect(ids.indexOf('career-training')).toBeLessThan(ids.indexOf('tanf'))
      expect(ids).not.toContain('public-library')
      expect(results.find((result) => result.program.id === 'career-training')!.program.category).toBe('education')
    })

    it('promotes confirmed audiences without changing uncertainty labels or screening details', () => {
      const cases: Partial<Household>[] = [
        { needs: ['transportation'], hasDisability: true },
        { needs: ['health'], hasSenior60Plus: true },
        { needs: ['income'], hasChildrenUnder18: true },
        { needs: ['food'], hasChildUnder5OrPregnant: true },
      ]
      const relevantIds = ['capmetro-access', 'medicare-counseling', 'tanf', 'wic']
      for (const [index, details] of cases.entries()) {
        const facts = household(details)
        const results = rankRecommendations(programs, facts)
        expect(results.slice(0, 2).map((result) => result.program.id)).toContain(relevantIds[index])
        expect(results.every((result) => result.likelihood === evaluateProgram(result.program, facts))).toBe(true)
        expect(results.find((result) => result.program.id === relevantIds[index])!.missing.length).toBeGreaterThan(0)
      }
    })

    it('does not promote a contradicted audience even when a different required flag is true', () => {
      const partial: Program = { ...snap, id: 'partial-match', requiresAll: ['hasDisability', 'isUninsured'], alwaysShow: true }
      const broad: Program = { ...snap, id: 'general-food', alwaysShow: true, actionKind: 'referral' }
      const unknown = rankRecommendations([partial, broad], household({ needs: ['food'], hasDisability: true }))
      expect(unknown[0].program.id).toBe('general-food')
      const contradicted = rankRecommendations([partial, broad], household({ needs: ['food'], hasDisability: true, isUninsured: false }))
      expect(contradicted[0].program.id).toBe('general-food')
      expect(contradicted[1].likelihood).toBe('info')
    })
  })

  it('describes SNAP household rules and income deductions', () => {
    expect(missing('snap')).toMatch(/buy and prepare food together/)
    expect(missing('snap')).toMatch(/deductions/)
  })

  it('requires MAP county and uninsured details without inferring Travis from ZIP', () => {
    expect(missing('map', { zip: '78701' })).toMatch(/Travis County/)
    expect(missing('map')).toMatch(/without health insurance/)
    expect(evaluateProgram({ ...snap, id: 'map' }, household({ county: 'other' }))).toBe('unlikely')
    expect(evaluateProgram({ ...snap, id: 'map' }, household({ isUninsured: false }))).toBe('unlikely')
    expect(evaluateProgram({ ...snap, id: 'map' }, household({ isUninsured: true, county: 'travis' }))).toBe('maybe')
  })

  it('does not exclude Austin services merely because county is not Travis', () => {
    expect(evaluateProgram({ ...snap, jurisdiction: 'austin' }, household({ county: 'other' }))).toBe('maybe')
  })

  it('cannot recommend Healthy Texas Women based only on income', () => {
    const program = { ...snap, id: 'healthy-texas-women' }
    expect(evaluateProgram(program, household({ size: 1, monthlyIncome: 200 }))).toBe('maybe')
    expect(missing(program.id)).toMatch(/age.*women.*pregnancy.*insurance/)
  })

  it('uses childcare age, work hours and SMI follow-ups, not generic FPL exclusion', () => {
    expect(missing('child-care')).toMatch(/age.*work.*hours.*State Median Income/)
    expect(missing('child-care')).toMatch(/waitlist/)
  })

  it('requires TANF asset and work participation details', () => {
    expect(missing('tanf')).toMatch(/assets.*hours/)
  })

  it('does not promise unemployment benefits merely because someone lost a job', () => {
    const program = { ...snap, id: 'unemployment', fplLimit: undefined }
    expect(evaluateProgram(program, household({ isUnemployed: true }))).toBe('maybe')
    expect(missing('unemployment')).toMatch(/work history.*base-period wages.*reason work ended/)
  })

  it('includes catalog screening and application status notes in both languages', () => {
    const note = { en: 'Verify current funding.', es: 'Verifique los fondos actuales.' }
    const [result] = rankRecommendations([{ ...snap, screeningNote: note, applicationStatus: 'waitlist', statusNote: note }], household({ needs: ['food'] }))
    expect(result.missing).toContainEqual(note)
    expect([...result.reasons, ...result.missing].every((item) => Boolean(item.en && item.es))).toBe(true)
  })

  it('asks a small ordered, deduplicated set of questions relevant to selected needs', () => {
    expect(relevantQuestions(['health'])[0]).toBe('isUninsured')
    expect(relevantQuestions(['family']).slice(0, 2)).toEqual(['hasChildUnder13', 'isWorkingOrTraining'])
    const questions = relevantQuestions(['food', 'health'])
    expect(new Set(questions).size).toBe(questions.length)
    expect(questions).not.toContain('isImmigrantOrNewcomer')
    expect(relevantQuestions([])).toEqual([])
  })
})
