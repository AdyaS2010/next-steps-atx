import { describe, expect, it } from 'vitest'
import { careerTracks, jobFamilies } from '../data/careers'
import { programs } from '../data/programs'
import {
  detectJobFamilies, emptyJob, emptyProfile, matchTracks, resumeDocument, resumeFromProfile, resumeText, resumeTips, type Resume,
} from './career'

const headings = { summary: 'Summary', experience: 'Experience', education: 'Education', certifications: 'Certifications', skills: 'Skills', languages: 'Languages', present: 'Present' }

function resume(patch: Partial<Resume> = {}): Resume {
  return { name: 'Alex Rivera', email: 'alex@example.com', phone: '512-555-0100', city: 'Austin, TX', headline: 'IT support', summary: '', jobs: [], education: [], certifications: '', skills: 'Customer service', languages: '', ...patch }
}

describe('career data', () => {
  it.each(careerTracks)('$id has sourced steps, a credential, O*NET code and real local programs', track => {
    const ids = new Set(programs.map(program => program.id))
    expect(track.steps.length).toBeGreaterThanOrEqual(2)
    expect(track.steps.some(step => step.credential)).toBe(true)
    expect(track.onet.code).toMatch(/^\d{2}-\d{4}\.\d{2}$/)
    for (const step of track.steps) {
      expect(new URL(step.resource.url).protocol).toBe('https:')
      expect(step.title.es).not.toBe(step.title.en)
    }
    for (const id of track.localPrograms) expect(ids.has(id), id).toBe(true)
  })

  it('points every job family to existing tracks', () => {
    const ids = new Set(careerTracks.map(track => track.id))
    for (const family of jobFamilies) for (const id of family.tracks) expect(ids.has(id), id).toBe(true)
  })
})

describe('career matching', () => {
  it('recognizes past jobs in English and Spanish from titles', () => {
    expect(detectJobFamilies(['Cashier at H-E-B']).map(family => family.id)).toContain('retail')
    expect(detectJobFamilies(['Cocinera']).map(family => family.id)).toContain('food')
    expect(detectJobFamilies(['Warehouse associate']).map(family => family.id)).toEqual(expect.arrayContaining(['warehouse', 'retail']))
  })

  it('does not treat the pronoun "it" as tech experience', () => {
    expect(detectJobFamilies(['Made it work as a volunteer']).map(family => family.id)).not.toContain('tech')
  })

  it('ranks trades first for construction experience and an interest in trades', () => {
    const profile = { ...emptyProfile(), jobs: [{ ...emptyJob(), title: 'Construction laborer' }], interests: ['trades' as const] }
    expect(matchTracks(profile)[0].track.id).toBe('skilled-trades')
  })

  it('returns varied starters when nothing is known', () => {
    expect(matchTracks(emptyProfile()).map(match => match.track.id)).toEqual(['it-support', 'healthcare', 'skilled-trades'])
  })

  it('prefills a résumé with jobs and transferable skills, never personal contact details', () => {
    const profile = { ...emptyProfile(), jobs: [{ ...emptyJob(), title: 'Cashier', employer: 'Grocery store' }, emptyJob()] }
    const draft = resumeFromProfile(profile, matchTracks(profile), 'en')
    expect(draft.jobs).toHaveLength(1)
    expect(draft.skills).toContain('Customer service')
    expect(draft.name).toBe('')
    expect(draft.email).toBe('')
  })
})

describe('résumé output', () => {
  it('gives practical tips for missing and weak content', () => {
    const tips = resumeTips(resume({ name: '', email: 'bad', jobs: [{ ...emptyJob(), title: 'Cashier', bullets: 'Responsible for register\nServed [number] customers' }] })).map(tip => tip.en)
    expect(tips).toEqual(expect.arrayContaining([
      'Add your name at the top.', 'Check the email address format.',
      expect.stringContaining('action verb'), expect.stringContaining('[bracketed]'), expect.stringContaining('numbers'),
    ]))
  })

  it('reports a complete résumé as ready', () => {
    expect(resumeTips(resume({ jobs: [{ ...emptyJob(), title: 'Cashier', bullets: 'Served 80 customers per shift' }] }))).toEqual([])
  })

  it('formats plain text with sections, dates and bullets', () => {
    const output = resumeText(resume({ jobs: [{ ...emptyJob(), title: 'Cashier', employer: 'H-E-B', start: '2021', bullets: '- Served 80 customers\n• Trained 3 staff' }] }), headings)
    expect(output).toContain('EXPERIENCE')
    expect(output).toContain('2021 – Present')
    expect(output).toContain('• Served 80 customers')
    expect(output).toContain('• Trained 3 staff')
  })

  it('escapes HTML in the Word document', () => {
    const output = resumeDocument(resume({ name: '<script>alert(1)</script>' }), headings)
    expect(output).not.toContain('<script>alert')
    expect(output).toContain('&lt;script&gt;')
  })
})
