import { careerTracks, jobFamilies, type CareerField, type CareerTrack, type JobFamily } from '../data/careers'
import type { Localized } from '../types'
import { normalize } from './format'

/** Everything here stays in memory; nothing about a person's work history is saved or sent. */
export type Job = { title: string; employer: string; location: string; start: string; end: string; bullets: string }
export type Education = 'none' | 'hs' | 'some-college' | 'associate' | 'bachelor' | 'graduate' | ''

export type CareerProfile = {
  jobs: Job[]
  education: Education
  certifications: string
  interests: CareerField[]
  freeOnly: boolean
}

export const emptyJob = (): Job => ({ title: '', employer: '', location: '', start: '', end: '', bullets: '' })
export const emptyProfile = (): CareerProfile => ({ jobs: [emptyJob()], education: '', certifications: '', interests: [], freeOnly: false })

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Recognizes past-job families from job titles only (not free-text duties). */
export function detectJobFamilies(titles: string[]): JobFamily[] {
  const text = titles.map(normalize).join(' | ')
  return jobFamilies.filter(family => family.terms.some(term => new RegExp(`\\b${escapeRegExp(normalize(term))}\\b`).test(text)))
}

export type TrackMatch = { track: CareerTrack; score: number; reasons: Localized[] }

const openCosts = new Set(['free', 'library', 'sponsored'])

export function matchTracks(profile: CareerProfile, limit = 3): TrackMatch[] {
  const families = detectJobFamilies(profile.jobs.map(job => job.title))
  const scored = careerTracks.map(track => {
    let score = 0
    const reasons: Localized[] = []
    if (profile.interests.includes(track.field)) {
      score += 3
      reasons.push({ en: 'Matches a field you are interested in.', es: 'Coincide con un área que le interesa.' })
    }
    for (const family of families) {
      const position = family.tracks.indexOf(track.id)
      if (position === -1) continue
      score += 2.5 - position * 0.5
      reasons.push({ en: 'Builds on skills from your past work.', es: 'Aprovecha habilidades de sus trabajos anteriores.' })
    }
    if (profile.freeOnly && track.steps.some(step => step.credential && openCosts.has(step.cost))) {
      score += 1
      reasons.push({ en: 'Has a credential you can earn for free.', es: 'Tiene una credencial que puede obtener gratis.' })
    }
    if (profile.freeOnly && !track.steps.some(step => openCosts.has(step.cost) && step.credential) && score > 0) score -= 0.5
    return { track, score, reasons: [...new Map(reasons.map(reason => [reason.en, reason])).values()] }
  })
  const ranked = scored.filter(match => match.score > 0).sort((a, b) => b.score - a.score)
  if (ranked.length) return ranked.slice(0, limit)
  // Without any signal, show a varied, low-barrier starting set.
  const starters = ['it-support', 'healthcare', 'skilled-trades']
  return starters.map(id => ({
    track: careerTracks.find(track => track.id === id)!, score: 0,
    reasons: [{ en: 'A common starting point with free or sponsored training in Austin.', es: 'Un punto de partida común con formación gratuita o patrocinada en Austin.' }],
  })).slice(0, limit)
}

export type Resume = {
  name: string
  email: string
  phone: string
  city: string
  headline: string
  summary: string
  jobs: Job[]
  education: { school: string; credential: string; year: string }[]
  certifications: string
  skills: string
  languages: string
}

export function resumeFromProfile(profile: CareerProfile, matches: TrackMatch[], language: 'en' | 'es'): Resume {
  const families = detectJobFamilies(profile.jobs.map(job => job.title))
  const skills = [...new Set([
    ...families.flatMap(family => family.skills.map(skill => skill[language])),
    ...(matches[0]?.track.skills.slice(0, 2) ?? []),
  ])].slice(0, 8)
  return {
    name: '', email: '', phone: '', city: 'Austin, TX', headline: matches[0] ? matches[0].track.roles[language].split(',')[0] : '',
    summary: '', jobs: profile.jobs.filter(job => job.title.trim()).map(job => ({ ...job })),
    education: [], certifications: profile.certifications, skills: skills.join(', '), languages: '',
  }
}

export const splitList = (value: string) => value.split(/[,\n]/).map(item => item.trim()).filter(Boolean)
export const splitBullets = (value: string) => value.split('\n').map(item => item.replace(/^[\s•\-*]+/, '').trim()).filter(Boolean)

/** Friendly checks that make a résumé stronger; never blocks printing. */
export function resumeTips(resume: Resume): Localized[] {
  const tips: Localized[] = []
  if (!resume.name.trim()) tips.push({ en: 'Add your name at the top.', es: 'Agregue su nombre arriba.' })
  if (!resume.email.trim() && !resume.phone.trim()) tips.push({ en: 'Add a phone number or email so employers can reach you.', es: 'Agregue un teléfono o correo para que le contacten.' })
  if (resume.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email.trim())) tips.push({ en: 'Check the email address format.', es: 'Revise el formato del correo.' })
  const bullets = resume.jobs.flatMap(job => splitBullets(job.bullets))
  if (resume.jobs.length && !bullets.length) tips.push({ en: 'Add 2–4 bullet points under each job describing what you did.', es: 'Agregue 2–4 puntos por trabajo describiendo lo que hizo.' })
  if (bullets.length && !bullets.some(bullet => /\d/.test(bullet))) tips.push({ en: 'Add numbers where you can (customers served, orders, team size). They make results concrete.', es: 'Agregue números cuando pueda (clientes, pedidos, tamaño del equipo). Hacen concretos los resultados.' })
  if (bullets.some(bullet => /^responsible for|^duties/i.test(bullet))) tips.push({ en: 'Start bullets with an action verb like “Led” or “Resolved” instead of “Responsible for”.', es: 'Empiece los puntos con un verbo de acción como “Dirigí” en lugar de “Responsable de”.' })
  if (bullets.some(bullet => /\[[^\]]+\]/.test(bullet))) tips.push({ en: 'Replace the [bracketed] placeholders with your real details.', es: 'Reemplace los [corchetes] con sus datos reales.' })
  if (resume.summary.trim().split(/\s+/).length > 60) tips.push({ en: 'Keep the summary to two or three sentences.', es: 'Mantenga el resumen en dos o tres oraciones.' })
  if (!splitList(resume.skills).length) tips.push({ en: 'List a few skills that match the jobs you want.', es: 'Incluya algunas habilidades que coincidan con los trabajos que busca.' })
  return tips
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)

export type ResumeHeadings = { summary: string; experience: string; education: string; certifications: string; skills: string; languages: string; present: string }

export function resumeText(resume: Resume, h: ResumeHeadings): string {
  const contact = [resume.city, resume.phone, resume.email].filter(Boolean).join(' | ')
  const sections: string[] = [[resume.name, resume.headline, contact].filter(Boolean).join('\n')]
  if (resume.summary.trim()) sections.push(`${h.summary.toUpperCase()}\n${resume.summary.trim()}`)
  const jobs = resume.jobs.filter(job => job.title.trim())
  if (jobs.length) sections.push(`${h.experience.toUpperCase()}\n${jobs.map(job => [
    [job.title, job.employer, job.location].filter(Boolean).join(', '),
    [job.start, job.end || (job.start ? h.present : '')].filter(Boolean).join(' – '),
    ...splitBullets(job.bullets).map(bullet => `• ${bullet}`),
  ].filter(Boolean).join('\n')).join('\n\n')}`)
  const education = resume.education.filter(item => item.school.trim() || item.credential.trim())
  if (education.length) sections.push(`${h.education.toUpperCase()}\n${education.map(item => [item.credential, item.school, item.year].filter(Boolean).join(', ')).join('\n')}`)
  if (splitList(resume.certifications).length) sections.push(`${h.certifications.toUpperCase()}\n${splitList(resume.certifications).join('\n')}`)
  if (splitList(resume.skills).length) sections.push(`${h.skills.toUpperCase()}\n${splitList(resume.skills).join(' • ')}`)
  if (splitList(resume.languages).length) sections.push(`${h.languages.toUpperCase()}\n${splitList(resume.languages).join(', ')}`)
  return sections.join('\n\n')
}

/** A self-contained HTML document that Word and Google Docs open with formatting intact. */
export function resumeDocument(resume: Resume, h: ResumeHeadings): string {
  const e = escapeHtml
  const contact = [resume.city, resume.phone, resume.email].filter(Boolean).map(e).join(' &nbsp;|&nbsp; ')
  const section = (title: string, body: string) => body ? `<h2>${e(title)}</h2>${body}` : ''
  const jobs = resume.jobs.filter(job => job.title.trim()).map(job => `<div class="job"><p class="role"><strong>${e(job.title)}</strong>${job.employer ? `, ${e(job.employer)}` : ''}${job.location ? ` — ${e(job.location)}` : ''}<span class="dates">${e([job.start, job.end || (job.start ? h.present : '')].filter(Boolean).join(' – '))}</span></p><ul>${splitBullets(job.bullets).map(bullet => `<li>${e(bullet)}</li>`).join('')}</ul></div>`).join('')
  const education = resume.education.filter(item => item.school.trim() || item.credential.trim()).map(item => `<p><strong>${e(item.credential)}</strong>${item.school ? `, ${e(item.school)}` : ''}${item.year ? ` <span class="dates">${e(item.year)}</span>` : ''}</p>`).join('')
  const list = (value: string) => splitList(value).length ? `<p>${splitList(value).map(e).join(' &bull; ')}</p>` : ''
  return `<!doctype html><html><head><meta charset="utf-8"><title>${e(resume.name || 'Resume')}</title><style>
body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a;max-width:7.5in;margin:.5in auto;line-height:1.35}
h1{font-size:22pt;margin:0}.headline{font-size:12pt;color:#2f5d46;margin:.1em 0}.contact{color:#444;margin:.2em 0 .8em}
h2{font-size:11pt;letter-spacing:.08em;text-transform:uppercase;color:#2f5d46;border-bottom:1px solid #9bb5a7;padding-bottom:2px;margin:14pt 0 6pt}
.role{margin:6pt 0 2pt}.dates{float:right;color:#555}ul{margin:2pt 0 6pt 16pt;padding:0}li{margin:1pt 0}p{margin:3pt 0}
</style></head><body><h1>${e(resume.name)}</h1>${resume.headline ? `<p class="headline">${e(resume.headline)}</p>` : ''}<p class="contact">${contact}</p>
${section(h.summary, resume.summary.trim() ? `<p>${e(resume.summary.trim())}</p>` : '')}${section(h.experience, jobs)}${section(h.education, education)}${section(h.certifications, list(resume.certifications))}${section(h.skills, list(resume.skills))}${section(h.languages, list(resume.languages))}</body></html>`
}
