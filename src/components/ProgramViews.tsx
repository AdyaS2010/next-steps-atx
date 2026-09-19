import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { categoryLabels } from '../data/facts'
import { programs } from '../data/programs'
import { createTranslator } from '../lib/i18n'
import { toTelHref } from '../lib/format'
import { resourceFreshness } from '../lib/resource-quality'
import { isReadAloudSupported, speak, stopSpeaking } from '../lib/voice'
import type { useSteps } from '../lib/steps'
import type { Language, Likelihood, Localized, Program } from '../types'

type Steps = ReturnType<typeof useSteps>

export function ProgramCard({ program, language, likelihood = 'info', reasons = [], missing = [], onOpen }: {
  program: Program
  language: Language
  likelihood?: Likelihood
  reasons?: Localized[]
  missing?: Localized[]
  onOpen: (id: string) => void
}) {
  const t = createTranslator(language)
  return <article className="program-card">
    <div className="card-meta"><span className="eyebrow">{categoryLabels[program.category][language]}</span><span className={`badge badge-${likelihood}`}>{t(likelihood)}</span></div>
    <h2>{program.name}</h2><p className="hint">{program.agency}</p><p>{program.provides[language]}</p>
    {reasons.length > 0 && <p className="hint">{reasons[0][language]}</p>}
    {(program.applicationStatus === 'waitlist' || program.applicationStatus === 'closed') &&
      <p className="hint"><strong>{t('status')}: {t(program.applicationStatus)}</strong></p>}
    {missing.length > 0 && <details><summary>{t('missing')} ({missing.length})</summary>
      <ul className="reason-list">{missing.map((reason, index) => <li key={index}>{reason[language]}</li>)}</ul>
    </details>}
    <button className="primary card-action" onClick={() => onOpen(program.id)} aria-label={`${t('details')}: ${program.name}`}>{t('details')}</button>
  </article>
}

export function ProgramDetail({ program, language, onClose, steps, returnFocus }: {
  program: Program
  language: Language
  onClose: () => void
  steps: Steps
  returnFocus?: HTMLElement | null
}) {
  const t = createTranslator(language)
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [reading, setReading] = useState(false)
  const [readError, setReadError] = useState(false)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => {
    const opener = returnFocus ?? document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return }
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,summary,[tabindex="0"]') ?? [])
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = oldOverflow
      document.removeEventListener('keydown', onKey)
      stopSpeaking()
      if (opener?.isConnected) opener.focus()
    }
  }, [returnFocus])
  const saved = steps.entries.some(entry => entry.programId === program.id)
  const freshness = resourceFreshness(program)
  const actionKind = program.actionKind ?? 'information'
  const actionKey = actionKind === 'apply' ? 'applyLink' : actionKind === 'referral' ? 'referralLink' : actionKind === 'appointment' ? 'appointmentLink' : 'informationLink'
  const read = () => {
    if (reading) { stopSpeaking(); setReading(false); return }
    setReadError(false); setReading(true)
    speak(`${program.name}. ${program.provides[language]}. ${program.eligibilitySummary[language]}`, language,
      () => setReading(false), () => { setReading(false); setReadError(true) })
  }
  return <div className="modal-backdrop">
    <div ref={dialog} className="program-dialog" role="dialog" aria-modal="true" aria-labelledby="program-title">
      <div className="dialog-toolbar"><button ref={closeButton} onClick={onClose}><X size={18} aria-hidden="true" />{t('close')}</button>
        {isReadAloudSupported() && <button onClick={read}>{t(reading ? 'stopRead' : 'read')}</button>}</div>
      <p className="eyebrow">{categoryLabels[program.category][language]}</p><h1 id="program-title">{program.name}</h1><p>{program.agency}</p>
      {readError && <p role="alert">{t('readError')}</p>}
      <div className="button-row">
        {program.applyOnlineUrl && <a className="button primary" href={program.applyOnlineUrl} target="_blank" rel="noreferrer">{t(actionKey)}</a>}
        {program.applyPhone && <a className="button" href={toTelHref(program.applyPhone)}>{t('call')} {program.applyPhone}</a>}
      </div>
      <h2>{t('provides')}</h2><p>{program.provides[language]}</p>
      <h2>{t('who')}</h2><p>{program.audience?.[language] ?? program.eligibilitySummary[language]}</p>
      <h2>{t('rules')}</h2><p>{program.eligibilitySummary[language]}</p>
      <div className="notice"><h2>{t('screening')}</h2><p>{program.screeningNote?.[language] ?? t('resultsNote')}</p></div>
      <dl className="detail-facts">
        <div><dt>{t('area')}</dt><dd>{program.serviceArea?.[language] ?? t('unknown')}</dd></div>
        <div><dt>{t('status')}</dt><dd>{t(program.applicationStatus === 'unknown' || !program.applicationStatus ? 'statusUnknown' : program.applicationStatus)}</dd>
          {program.statusNote && <dd>{program.statusNote[language]}</dd>}
          {program.availabilityVerifiedOn && <dd>{t('reviewed')}: <time dateTime={program.availabilityVerifiedOn}>{program.availabilityVerifiedOn}</time></dd>}</div>
        <div><dt>{t('action')}</dt><dd>{t(actionKind)}</dd></div>
      </dl>
      <h2>{t('steps')}</h2>
      <ol className="next-steps">{program.steps?.map(step => <li key={step.id}><strong>{step.title[language]}</strong><p>{step.detail[language]}</p></li>)}</ol>
      {program.localHelp && <section><h2>{program.localHelp.name}</h2><p>{program.localHelp.address}</p><div className="button-row">
        {program.localHelp.phone && <a className="button" href={toTelHref(program.localHelp.phone)}>{t('call')} {program.localHelp.phone}</a>}
        {program.localHelp.url && <a className="button" href={program.localHelp.url} target="_blank" rel="noreferrer">{t('website')}</a>}
      </div></section>}
      <p className="hint">{t('accessUnknown')}</p>
      {program.documents.length > 0 && <details><summary>{t('documents')}</summary><ul>{program.documents.map((document, index) => <li key={index}>{document[language]}</li>)}</ul></details>}
      {program.notes && <p>{program.notes[language]}</p>}
      <div className="save-panel"><h2>{t('mySteps')}</h2><p>{t('saveDisclosure')}</p>
        <button className="primary" disabled={!steps.ready || saved} onClick={() => steps.saveProgram(program.id)}>{t(saved ? 'saved' : 'save')}</button>
        {steps.error && <p role="alert">{steps.error[language]}</p>}
      </div>
      <h2>{t('sources')}</h2>{program.reviewedOn && <p>{t('reviewed')}: {program.reviewedOn}</p>}
      {freshness !== 'current-review' && <p className="notice">{t(freshness === 'missing' ? 'sourceReviewMissing' : 'sourceReviewNeeded')}</p>}
      <p className="hint">{t('sourceReviewNote')}</p>
      <ul className="source-list">{program.sources?.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a><span>{t('reviewed')}: <time dateTime={source.checkedOn}>{source.checkedOn}</time></span></li>)}</ul>
    </div>
  </div>
}

export function MySteps({ language, steps, onOpen }: { language: Language; steps: Steps; onOpen: (id: string) => void }) {
  const t = createTranslator(language)
  const [confirmClear, setConfirmClear] = useState(false)
  const download = () => {
    const blob = new Blob([steps.exportText(language)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = language === 'en' ? 'my-support-plan.txt' : 'mi-plan-de-apoyo.txt'
    anchor.click(); URL.revokeObjectURL(url)
  }
  return <section className="steps-page"><h1>{t('mySteps')}</h1><p>{t('planNote')}</p><p className="notice">{t('saveDisclosure')}</p>
    {steps.error && <p role="alert">{steps.error[language]}</p>}
    {confirmClear && <div className="notice no-print" role="region" aria-label={t('clearPlan')}>
      <p>{t('clearPlanConfirm')}</p><div className="button-row">
        <button onClick={() => { steps.clear(); setConfirmClear(false) }}>{t('confirmDelete')}</button>
        <button onClick={() => setConfirmClear(false)}>{t('cancelDelete')}</button>
      </div>
    </div>}
    {!steps.ready ? (steps.error ? <button onClick={() => setConfirmClear(true)}>{t('clearPlan')}</button> : <p role="status">{t('loading')}</p>) : steps.entries.length === 0 ? <p className="empty-state">{t('emptySteps')}</p> : <>
      <div className="button-row no-print"><button onClick={() => window.print()}>{t('print')}</button><button onClick={download}>{t('download')}</button><button onClick={() => setConfirmClear(true)}>{t('clearPlan')}</button></div>
      {steps.entries.map(entry => {
        const program = programs.find(item => item.id === entry.programId)
        if (!program) return null
        return <article className="program-card plan-card" key={program.id}><h2>{program.name}</h2><p>{program.provides[language]}</p>
          {program.steps?.map(step => <label className="check-step" key={step.id}>
            <input type="checkbox" checked={entry.completed.includes(step.id)} onChange={() => steps.toggleStep(program.id, step.id)} />
            <span><strong>{step.title[language]}</strong><span>{step.detail[language]}</span></span>
          </label>)}
          {program.applyPhone && <p>{t('call')}: <a href={toTelHref(program.applyPhone)}>{program.applyPhone}</a></p>}
          {program.applyOnlineUrl && <p><a href={program.applyOnlineUrl} target="_blank" rel="noreferrer">{t('website')}</a></p>}
          <div className="button-row no-print"><button onClick={() => onOpen(program.id)}>{t('details')}</button><button onClick={() => steps.removeProgram(program.id)}>{t('remove')}</button></div>
        </article>
      })}
    </>}
  </section>
}
