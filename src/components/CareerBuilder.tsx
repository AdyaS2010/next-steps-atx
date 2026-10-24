import { useEffect, useMemo, useRef, useState } from 'react'
import { Award, BarChart3, BookOpen, Check, Copy, Download, ExternalLink, FileText, Plus, Printer, Sparkles, Trash2 } from 'lucide-react'
import { actionVerbs, costLabels, fieldLabels, type CareerField } from '../data/careers'
import { programs } from '../data/programs'
import {
  detectJobFamilies, emptyJob, emptyProfile, matchTracks, resumeDocument, resumeFromProfile, resumeText, resumeTips,
  splitBullets, splitList, type CareerProfile, type Education, type Job, type Resume, type ResumeHeadings,
} from '../lib/career'
import { createTranslator } from '../lib/i18n'
import { InterviewPractice } from './InterviewPractice'
import { SkillPicker } from './SkillPicker'
import type { Language } from '../types'

type Step = 'profile' | 'paths' | 'resume' | 'interview'
const steps: Step[] = ['profile', 'paths', 'resume', 'interview']
const stepKeys = { profile: 'careerStepProfile', paths: 'careerStepPaths', resume: 'careerStepResume', interview: 'careerStepInterview' } as const
const educationOptions: [Education, Parameters<ReturnType<typeof createTranslator>>[0]][] = [
  ['none', 'eduNone'], ['hs', 'eduHs'], ['some-college', 'eduSome'], ['associate', 'eduAssociate'], ['bachelor', 'eduBachelor'], ['graduate', 'eduGraduate'],
]

/** In-memory only: work history and résumé text are never saved or sent. */
export function CareerBuilder({ language, onOpen }: { language: Language; onOpen: (id: string) => void }) {
  const t = createTranslator(language)
  const [step, setStep] = useState<Step>('profile')
  const [profile, setProfile] = useState<CareerProfile>(emptyProfile)
  const [resume, setResume] = useState<Resume | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const matches = useMemo(() => matchTracks(profile), [profile])
  const families = useMemo(() => detectJobFamilies(profile.jobs.map(job => job.title)), [profile.jobs])
  const skillsFound = [...new Set(families.flatMap(family => family.skills.map(skill => skill[language])))]
  const go = (next: Step) => {
    if (next === 'resume' && !resume) setResume(resumeFromProfile(profile, matches, language))
    setStep(next)
  }
  useEffect(() => { heading.current?.focus() }, [step])
  const setJob = (index: number, patch: Partial<Job>) =>
    setProfile(previous => ({ ...previous, jobs: previous.jobs.map((job, i) => i === index ? { ...job, ...patch } : job) }))
  const toggleInterest = (field: CareerField) => setProfile(previous => ({
    ...previous, interests: previous.interests.includes(field) ? previous.interests.filter(item => item !== field) : [...previous.interests, field],
  }))

  return <section className="career">
    <header className="career-header">
      <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> {t('career')}</p>
      <h1 ref={heading} tabIndex={-1}>{t('careerHeading')}</h1>
      <p>{t('careerIntro')}</p>
      <p className="privacy-line">{t('careerPrivacy')}</p>
      <nav className="stepper no-print" aria-label={t('careerSteps')}>
        <ol>{steps.map((item, index) => <li key={item}>
          <button aria-current={step === item ? 'step' : undefined} onClick={() => go(item)}
            className={steps.indexOf(step) > index ? 'done' : undefined}>
            <span className="stepper-dot" aria-hidden="true">{steps.indexOf(step) > index ? <Check size={14} /> : index + 1}</span>{t(stepKeys[item])}
          </button>
        </li>)}</ol>
      </nav>
    </header>

    {step === 'profile' && <form className="career-form" onSubmit={event => { event.preventDefault(); go('paths') }}>
      <fieldset className="panel">
        <legend>{t('pastJobs')}</legend>
        <p className="hint">{t('pastJobsHint')}</p>
        {profile.jobs.map((job, index) => <div className="job-entry" key={index}>
          <div className="field-grid">
            <div className="field"><label htmlFor={`job-title-${index}`}>{t('jobTitle')}</label>
              <input id={`job-title-${index}`} value={job.title} onChange={event => setJob(index, { title: event.target.value })} /></div>
            <div className="field"><label htmlFor={`job-employer-${index}`}>{t('employer')}</label>
              <input id={`job-employer-${index}`} value={job.employer} onChange={event => setJob(index, { employer: event.target.value })} /></div>
            <div className="field"><label htmlFor={`job-start-${index}`}>{t('jobStart')}</label>
              <input id={`job-start-${index}`} value={job.start} onChange={event => setJob(index, { start: event.target.value })} /></div>
            <div className="field"><label htmlFor={`job-end-${index}`}>{t('jobEnd')}</label>
              <input id={`job-end-${index}`} value={job.end} onChange={event => setJob(index, { end: event.target.value })} /></div>
          </div>
          {profile.jobs.length > 1 && <button type="button" className="text-button" onClick={() => setProfile(previous => ({ ...previous, jobs: previous.jobs.filter((_, i) => i !== index) }))}>
            <Trash2 size={16} aria-hidden="true" />{t('removeJob')}</button>}
        </div>)}
        <button type="button" onClick={() => setProfile(previous => ({ ...previous, jobs: [...previous.jobs, emptyJob()] }))}><Plus size={18} aria-hidden="true" />{t('addJob')}</button>
        {skillsFound.length > 0 && <div className="skills-found" aria-live="polite">
          <p><strong>{t('skillsFound')}</strong> · <span className="hint">{t('skillsFoundHint')}</span></p>
          <ul className="tag-list">{skillsFound.map(skill => <li key={skill}>{skill}</li>)}</ul>
        </div>}
      </fieldset>
      <fieldset className="panel">
        <legend>{t('educationLevel')}</legend>
        <select aria-label={t('educationLevel')} value={profile.education} onChange={event => setProfile(previous => ({ ...previous, education: event.target.value as Education }))}>
          <option value="">{t('unknown')}</option>
          {educationOptions.map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}
        </select>
        {profile.education === 'none' && <p className="notice">{t('eduGed')} <button type="button" className="text-button" onClick={() => onOpen('adult-education')}>{t('details')}</button></p>}
        <div className="field"><label htmlFor="certs-held">{t('certsHeld')}</label>
          <input id="certs-held" value={profile.certifications} placeholder={t('certsHint')} onChange={event => setProfile(previous => ({ ...previous, certifications: event.target.value }))} /></div>
      </fieldset>
      <fieldset className="panel">
        <legend>{t('interests')}</legend>
        <div className="chip-row">{(Object.keys(fieldLabels) as CareerField[]).map(field =>
          <button type="button" key={field} aria-pressed={profile.interests.includes(field)} onClick={() => toggleInterest(field)}>{fieldLabels[field][language]}</button>)}</div>
        <label className="check-step"><input type="checkbox" checked={profile.freeOnly} onChange={event => setProfile(previous => ({ ...previous, freeOnly: event.target.checked }))} /><span>{t('freeOnly')}</span></label>
      </fieldset>
      <button type="submit" className="primary main-cta">{t('seePathways')}</button>
    </form>}

    {step === 'paths' && <div className="career-paths">
      <h2>{t('pathwaysFor')}</h2>
      <p className="hint">{t('pathwaysForIntro')}</p>
      {matches.map(({ track, reasons }, rank) => <article className="track-card" key={track.id}>
        <div className="track-top">
          <span className="track-rank" aria-hidden="true">{rank + 1}</span>
          <div>
            <p className="eyebrow">{fieldLabels[track.field][language]}</p>
            <h3>{track.title[language]}</h3>
            <p><strong>{t('roles')}:</strong> {track.roles[language]}</p>
          </div>
        </div>
        <p>{track.why[language]}</p>
        <ul className="reason-chips">{reasons.map(reason => <li key={reason.en}><Check size={14} aria-hidden="true" />{reason[language]}</li>)}</ul>
        <ol className="learning-steps">{track.steps.map((item, index) => <li key={index}>
          <div className="learning-head"><strong>{item.title[language]}</strong>
            <span className={`cost cost-${item.cost}`}>{costLabels[item.cost][language]}</span>
            {item.credential && <span className="cost cost-credential"><Award size={13} aria-hidden="true" />{t('credential')}</span>}
          </div>
          <p>{item.detail[language]}</p>
          <a href={item.resource.url} target="_blank" rel="noreferrer">{item.resource.label}<ExternalLink size={14} aria-hidden="true" /></a>
        </li>)}</ol>
        <div className="track-footer">
          <a className="button" href={`https://www.onetonline.org/link/summary/${track.onet.code}`} target="_blank" rel="noreferrer">
            <BarChart3 size={17} aria-hidden="true" />{t('onet')}: {track.onet.title}</a>
        </div>
        <p className="hint"><strong>{t('localHelpCareer')}</strong></p>
        <ul className="chip-list">{track.localPrograms.map(id => programs.find(program => program.id === id)).filter(program => program !== undefined).map(program =>
          <li key={program.id}><button onClick={() => onOpen(program.id)} aria-label={`${t('details')}: ${program.name}`}>{program.name}</button></li>)}</ul>
      </article>)}
      <div className="button-row">
        <button onClick={() => go('profile')}>{t('backToProfile')}</button>
        <button className="primary" onClick={() => go('resume')}><FileText size={18} aria-hidden="true" />{t('buildResume')}</button>
      </div>
    </div>}

    {step === 'resume' && resume && <ResumeEditor language={language} resume={resume} setResume={setResume}
      families={families} trackSkills={matches.flatMap(match => match.track.skills)} onBack={() => go('paths')} onNext={() => go('interview')} />}

    {step === 'interview' && <InterviewPractice language={language} onOpen={onOpen} />}
  </section>
}

function ResumeEditor({ language, resume, setResume, families, trackSkills, onBack, onNext }: {
  language: Language
  resume: Resume
  setResume: (update: (previous: Resume | null) => Resume | null) => void
  families: ReturnType<typeof detectJobFamilies>
  trackSkills: string[]
  onBack: () => void
  onNext: () => void
}) {
  const t = createTranslator(language)
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle')
  const update = (patch: Partial<Resume>) => setResume(previous => previous && { ...previous, ...patch })
  const setJob = (index: number, patch: Partial<Job>) => setResume(previous => previous && { ...previous, jobs: previous.jobs.map((job, i) => i === index ? { ...job, ...patch } : job) })
  const headings: ResumeHeadings = {
    summary: t('summary'), experience: t('experience'), education: t('education'),
    certifications: t('certifications'), skills: t('skills'), languages: t('languages'), present: t('present'),
  }
  const tips = resumeTips(resume)
  const suggestions = families.flatMap(family => family.bullets.map(bullet => bullet[language]))
  const suggestedSkills = [...families.flatMap(family => family.skills.map(skill => skill[language])), ...trackSkills]
  const fileName = (resume.name.trim() || 'resume').replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-')
  const print = () => {
    document.body.classList.add('print-resume')
    const done = () => { document.body.classList.remove('print-resume'); window.removeEventListener('afterprint', done) }
    window.addEventListener('afterprint', done)
    window.print()
  }
  const download = () => {
    const blob = new Blob([resumeDocument(resume, headings)], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${fileName}.doc`
    anchor.click(); URL.revokeObjectURL(url)
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(resumeText(resume, headings)); setCopied('copied') } catch { setCopied('failed') }
  }
  const text = (id: string, label: string, value: string, onChange: (value: string) => void, extra: { type?: string; hint?: string } = {}) =>
    <div className="field"><label htmlFor={id}>{label}</label>
      <input id={id} type={extra.type ?? 'text'} value={value} placeholder={extra.hint} onChange={event => onChange(event.target.value)} /></div>

  return <div className="resume-layout">
    <div className="resume-editor no-print">
      <fieldset className="panel"><legend>{t('contact')}</legend>
        <div className="field-grid">
          {text('resume-name', t('fullName'), resume.name, value => update({ name: value }))}
          {text('resume-headline', t('headline'), resume.headline, value => update({ headline: value }))}
          {text('resume-phone', t('phone'), resume.phone, value => update({ phone: value }), { type: 'tel' })}
          {text('resume-email', t('email'), resume.email, value => update({ email: value }), { type: 'email' })}
          {text('resume-city', t('jobLocation'), resume.city, value => update({ city: value }))}
        </div>
        <div className="field"><label htmlFor="resume-summary">{t('summary')}</label>
          <textarea id="resume-summary" rows={3} value={resume.summary} placeholder={t('summaryHint')} onChange={event => update({ summary: event.target.value })} /></div>
      </fieldset>
      <fieldset className="panel"><legend>{t('experience')}</legend>
        {resume.jobs.map((job, index) => <div className="job-entry" key={index}>
          <div className="field-grid">
            {text(`r-title-${index}`, t('jobTitle'), job.title, value => setJob(index, { title: value }))}
            {text(`r-employer-${index}`, t('employer'), job.employer, value => setJob(index, { employer: value }))}
            {text(`r-location-${index}`, t('jobLocation'), job.location, value => setJob(index, { location: value }))}
            {text(`r-start-${index}`, t('jobStart'), job.start, value => setJob(index, { start: value }))}
            {text(`r-end-${index}`, t('jobEnd'), job.end, value => setJob(index, { end: value }))}
          </div>
          <div className="field"><label htmlFor={`r-bullets-${index}`}>{t('bullets')}</label>
            <textarea id={`r-bullets-${index}`} rows={4} value={job.bullets} onChange={event => setJob(index, { bullets: event.target.value })} /></div>
          {suggestions.length > 0 && <details className="suggestions"><summary>{t('suggested')}</summary>
            <ul className="chip-list">{suggestions.map(bullet => <li key={bullet}>
              <button type="button" onClick={() => setJob(index, { bullets: [job.bullets.trim(), bullet].filter(Boolean).join('\n') })}><Plus size={14} aria-hidden="true" />{bullet}</button>
            </li>)}</ul>
          </details>}
          <button type="button" className="text-button" onClick={() => setResume(previous => previous && { ...previous, jobs: previous.jobs.filter((_, i) => i !== index) })}>
            <Trash2 size={16} aria-hidden="true" />{t('removeJob')}</button>
        </div>)}
        <button type="button" onClick={() => setResume(previous => previous && { ...previous, jobs: [...previous.jobs, emptyJob()] })}><Plus size={18} aria-hidden="true" />{t('addJob')}</button>
        <p className="hint"><strong>{t('verbs')}:</strong> {actionVerbs.map(verb => verb[language]).join(' · ')}</p>
      </fieldset>
      <fieldset className="panel"><legend>{t('education')}</legend>
        {resume.education.map((item, index) => <div className="field-grid job-entry" key={index}>
          {text(`r-degree-${index}`, t('degree'), item.credential, value => update({ education: resume.education.map((entry, i) => i === index ? { ...entry, credential: value } : entry) }))}
          {text(`r-school-${index}`, t('school'), item.school, value => update({ education: resume.education.map((entry, i) => i === index ? { ...entry, school: value } : entry) }))}
          {text(`r-year-${index}`, t('year'), item.year, value => update({ education: resume.education.map((entry, i) => i === index ? { ...entry, year: value } : entry) }))}
        </div>)}
        <button type="button" onClick={() => update({ education: [...resume.education, { school: '', credential: '', year: '' }] })}><Plus size={18} aria-hidden="true" />{t('addEducation')}</button>
      </fieldset>
      <fieldset className="panel"><legend>{t('skills')}</legend>
        {text('resume-certs', t('certifications'), resume.certifications, value => update({ certifications: value }), { hint: t('skillsHint') })}
        <SkillPicker language={language} value={resume.skills} suggested={suggestedSkills} onChange={value => update({ skills: value })} />
        {text('resume-languages', t('languages'), resume.languages, value => update({ languages: value }), { hint: t('languagesHint') })}
      </fieldset>
    </div>

    <aside className="resume-side">
      <div className="resume-actions no-print">
        <div className={tips.length ? 'notice notice-warning' : 'notice'}>
          <h2><BookOpen size={18} aria-hidden="true" /> {t('resumeTips')}</h2>
          {tips.length ? <ul>{tips.map(tip => <li key={tip.en}>{tip[language]}</li>)}</ul> : <p>{t('resumeReady')}</p>}
        </div>
        <div className="button-row">
          <button className="primary" onClick={print}><Printer size={18} aria-hidden="true" />{t('printResume')}</button>
          <button onClick={download}><Download size={18} aria-hidden="true" />{t('downloadWord')}</button>
          <button onClick={copy}><Copy size={18} aria-hidden="true" />{t(copied === 'copied' ? 'copied' : 'copyText')}</button>
        </div>
        {copied === 'failed' && <p role="alert">{t('copyFailed')}</p>}
        <div className="button-row"><button className="text-button" onClick={onBack}>{t('backToPaths')}</button>
          <button className="text-button" onClick={onNext}>{t('practiceInterview')}</button></div>
      </div>
      <p className="eyebrow no-print">{t('preview')}</p>
      <ResumePreview resume={resume} headings={headings} label={t('preview')} />
    </aside>
  </div>
}

function ResumePreview({ resume, headings: h, label }: { resume: Resume; headings: ResumeHeadings; label: string }) {
  const jobs = resume.jobs.filter(job => job.title.trim())
  const education = resume.education.filter(item => item.school.trim() || item.credential.trim())
  const contact = [resume.city, resume.phone, resume.email].filter(Boolean)
  return <article className="resume-preview" aria-label={label}>
    <header>
      <p className="resume-name">{resume.name || '—'}</p>
      {resume.headline && <p className="resume-headline">{resume.headline}</p>}
      {contact.length > 0 && <p className="resume-contact">{contact.join('  |  ')}</p>}
    </header>
    {resume.summary.trim() && <section><h3>{h.summary}</h3><p>{resume.summary}</p></section>}
    {jobs.length > 0 && <section><h3>{h.experience}</h3>{jobs.map((job, index) => <div className="resume-job" key={index}>
      <p className="resume-role"><span><strong>{job.title}</strong>{job.employer && `, ${job.employer}`}{job.location && ` — ${job.location}`}</span>
        <span className="resume-dates">{[job.start, job.end || (job.start ? h.present : '')].filter(Boolean).join(' – ')}</span></p>
      <ul>{splitBullets(job.bullets).map((bullet, i) => <li key={i}>{bullet}</li>)}</ul>
    </div>)}</section>}
    {education.length > 0 && <section><h3>{h.education}</h3>{education.map((item, index) =>
      <p key={index}><strong>{item.credential}</strong>{item.school && `, ${item.school}`}{item.year && <span className="resume-year">{item.year}</span>}</p>)}</section>}
    {splitList(resume.certifications).length > 0 && <section><h3>{h.certifications}</h3><p>{splitList(resume.certifications).join(' • ')}</p></section>}
    {splitList(resume.skills).length > 0 && <section><h3>{h.skills}</h3><p>{splitList(resume.skills).join(' • ')}</p></section>}
    {splitList(resume.languages).length > 0 && <section><h3>{h.languages}</h3><p>{splitList(resume.languages).join(', ')}</p></section>}
  </article>
}
