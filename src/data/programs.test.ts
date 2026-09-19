import { describe, expect, it } from 'vitest'
import type { Localized } from '../types'
import { programs } from './programs'

const reviewedOn = '2026-09-12'
const originalIds = [
  'snap', 'wic', 'food-bank', 'diaper-bank', 'chip', 'map', 'communitycare',
  'healthy-texas-women', 'insure-central-texas', 'utility-cap', 'ceap',
  'rental-help', 'child-care', 'head-start', 'free-tax-prep', 'financial-coaching',
  'lifeline', 'tanf', 'unemployment', 'veterans', 'seniors-disability',
  'property-tax', 'immigrant-support', '211',
]
const officialHosts = new Set([
  'www.hhs.texas.gov', 'texaswic.org', 'www.centraltexasfoodbank.org',
  'austindiapers.org', 'www.centralhealth.net', 'communitycaretx.org',
  'www.healthytexaswomen.org', 'foundcom.org', 'coautilities.com',
  'www.traviscountytx.gov', 'www.211texas.org', 'www.trla.org',
  'wfscapitalarea.com', 'childinc.org', 'www.lifelinesupport.org',
  'www.texaslifeline.org', 'www.twc.texas.gov', 'www.capcog.org',
  'traviscad.org', 'ccctx.org', 'www.mowctx.org', 'arcilinc.org',
  'www.capmetro.org', 'students.austincc.edu', 'adulted.austincc.edu',
  'www.austinisd.org', 'www.austinecho.org', 'sunrisenavigationcenter.org',
  'library.austintexas.gov', 'integralcare.org',
  'emancipet.org', 'www.austinpetsalive.org', 'austinhumanesociety.org',
])

function expectLocalized(value: Localized | undefined) {
  expect(value).toBeDefined()
  expect(value?.en.trim().length).toBeGreaterThan(8)
  expect(value?.es.trim().length).toBeGreaterThan(8)
  expect(value?.es).not.toBe(value?.en)
}

function expectDate(value: string | undefined) {
  expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10)).toBe(value)
  expect(value! <= reviewedOn).toBe(true)
}

function byId(id: string) {
  const program = programs.find((item) => item.id === id)
  expect(program, `Missing catalog entry: ${id}`).toBeDefined()
  return program!
}

describe('researched service catalog', () => {
  it('expands the catalog without breaking existing saved program IDs', () => {
    expect(programs.length).toBeGreaterThanOrEqual(36)
    expect(programs.length).toBe(47)
    expect(new Set(programs.map((program) => program.id)).size).toBe(programs.length)
    originalIds.forEach((id) => expect(byId(id).id).toBe(id))
  })

  it.each(programs)('$id has complete bilingual, sourced, actionable metadata', (program) => {
    expect(program.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    expect(program.name.trim()).not.toBe('')
    expect(program.agency.trim()).not.toBe('')
    for (const value of [
      program.provides, program.eligibilitySummary, program.serviceArea,
      program.statusNote, program.audience, program.screeningNote, program.notes,
    ]) expectLocalized(value)
    expect(program.documents.length).toBeGreaterThan(0)
    program.documents.forEach(expectLocalized)
    expect(['travis', 'austin', 'texas', 'regional', 'national']).toContain(program.jurisdiction)
    expect(['apply', 'information', 'referral', 'appointment']).toContain(program.actionKind)
    expect(['accepting', 'waitlist', 'closed', 'varies', 'unknown']).toContain(program.applicationStatus)
    expectDate(program.reviewedOn)
    expect(program.sources?.length).toBeGreaterThan(0)
    for (const citation of program.sources ?? []) {
      const url = new URL(citation.url)
      expect(url.protocol).toBe('https:')
      expect(url.username + url.password).toBe('')
      expect(officialHosts.has(url.hostname), citation.url).toBe(true)
      expect(citation.label.trim().length).toBeGreaterThan(10)
      expectDate(citation.checkedOn)
      expect(citation.checkedOn <= program.reviewedOn!).toBe(true)
    }
    expect(program.applyOnlineUrl || program.applyPhone).toBeTruthy()
    if (program.applyOnlineUrl) expect(new URL(program.applyOnlineUrl).protocol).toBe('https:')
    expect(program.localHelp?.url || program.localHelp?.phone).toBeTruthy()
    if (program.localHelp?.url) expect(new URL(program.localHelp.url).protocol).toBe('https:')
    expect(program.steps?.length).toBeGreaterThanOrEqual(2)
    const stepIds = program.steps?.map((item) => item.id) ?? []
    expect(new Set(stepIds).size).toBe(stepIds.length)
    for (const item of program.steps ?? []) {
      expect(item.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expectLocalized(item.title)
      expectLocalized(item.detail)
    }
    expect(program.fplLimit, 'Do not restore approximate FPL denial thresholds').toBeUndefined()
  })

  it('does not infer open intake from a published application link', () => {
    expect(programs.filter((program) => program.applicationStatus === 'accepting')).toHaveLength(0)
    for (const program of programs) {
      if (program.applicationStatus === 'waitlist' || program.applicationStatus === 'closed') {
        expectDate(program.availabilityVerifiedOn)
      }
    }
    expect(byId('child-care').applicationStatus).toBe('waitlist')
    expect(byId('ceap').applicationStatus).toBe('waitlist')
    expect(byId('emergency-shelter').applicationStatus).toBe('unknown')
    expect(byId('emergency-shelter').statusNote?.en).toContain('No live shelter beds')
  })

  it('separates unemployment claims from job search and includes reduced-hours workers', () => {
    expect(byId('unemployment').applyOnlineUrl).toBe('https://www.twc.texas.gov/services/apply-benefits')
    expect(byId('job-search').applyOnlineUrl).not.toBe(byId('unemployment').applyOnlineUrl)
    expect(byId('unemployment').requiresAll ?? []).not.toContain('isUnemployed')
    expect(byId('unemployment').requiresAny).toBeUndefined()
    expect(byId('unemployment').eligibilitySummary.en).toContain('reduced hours')
  })

  it('covers the missing audiences with distinct services', () => {
    for (const id of [
      'senior-meals', 'medicare-counseling', 'caregiver-respite',
      'independent-living', 'capmetro-access', 'capmetro-pickup', 'capmetro-transit',
      'career-training', 'job-search', 'vocational-rehabilitation',
      'acc-basic-needs', 'adult-education', 'school-meals', 'child-care',
      'coordinated-entry', 'emergency-shelter', 'homeless-document-help',
      'veterans', 'immigrant-support', 'public-library', 'mental-health-crisis',
    ]) byId(id)
    expect(byId('caregiver-respite').requiresAny).toContain('isCaregiver')
    expect(byId('acc-basic-needs').requiresAny).toContain('isStudent')
    expect(byId('vocational-rehabilitation').requiresAny).toEqual(['hasDisability'])
    expect(byId('coordinated-entry').requiresAny).toContain('isHomeless')
    expect(byId('child-care').requiresAll ?? []).not.toContain('isWorkingOrTraining')
  })

  it('keeps ordinary library and transportation resources visible without a poverty test', () => {
    for (const id of ['public-library', 'capmetro-pickup', 'capmetro-transit', 'job-search']) {
      const program = byId(id)
      expect(program.alwaysShow).toBe(true)
      expect(program.fplLimit).toBeUndefined()
      expect(program.requiresAny).toBeUndefined()
      expect(program.requiresAll).toBeUndefined()
    }
    for (const id of ['capmetro-access', 'capmetro-pickup', 'capmetro-transit']) {
      expect(byId(id).category).toBe('transportation')
    }
  })

  it('preserves material limitations instead of blanket eligibility or stock promises', () => {
    expect(byId('food-bank').eligibilitySummary.en).toContain('own')
    expect(byId('diaper-bank').statusNote?.en).toContain('inventory')
    expect(byId('financial-coaching').eligibilitySummary.en).toContain('income')
    expect(byId('immigrant-support').eligibilitySummary.en).toContain('Fees apply')
    expect(byId('coordinated-entry').notes?.en).toContain('does not operate housing')
    expect(byId('homeless-document-help').screeningNote?.en).toContain('not issuing a government ID')
    expect(byId('school-meals').eligibilitySummary.en).toContain('without an application')
    expect(byId('public-library').documents[0].en).toContain('For a new library card')
    expect(byId('211').provides.en).not.toMatch(/text\s+211/i)
    expect(byId('211').provides.es).not.toMatch(/texto\s+al?\s*211/i)
    expect(byId('rental-help').provides.en).not.toMatch(/closed in 2026/i)
  })
})
