import { useState } from 'react'
import { CalendarClock, FileText, Hammer, Sunrise } from 'lucide-react'
import { createTranslator } from '../lib/i18n'
import { phaseCopy, phases, type ActionPlan as Plan, type Phase } from '../lib/plan'
import { toTelHref } from '../lib/format'
import type { useSteps } from '../lib/steps'
import type { Language } from '../types'

const phaseIcons: Record<Phase, typeof Sunrise> = { now: Sunrise, week: CalendarClock, month: Hammer }

export function ActionPlan({ plan, language, steps, onOpen, onOpenSteps }: {
  plan: Plan
  language: Language
  steps: ReturnType<typeof useSteps>
  onOpen: (id: string) => void
  onOpenSteps: () => void
}) {
  const t = createTranslator(language)
  const [saved, setSaved] = useState(false)
  if (plan.total === 0) return <p className="empty-state">{t('planEmpty')}</p>
  const ids = phases.flatMap(phase => plan.items[phase].map(item => item.program.id))
  const allSaved = ids.every(id => steps.entries.some(entry => entry.programId === id))
  const start: Record<Phase, number> = { now: 1, week: 1 + plan.items.now.length, month: 1 + plan.items.now.length + plan.items.week.length }
  return <div className="action-plan">
    <h2>{t('planHeading')}</h2>
    <p className="hint">{t('planIntro')}</p>
    {phases.filter(phase => plan.items[phase].length).map(phase => {
      const Icon = phaseIcons[phase]
      return <section key={phase} className={`plan-phase plan-phase-${phase}`} aria-labelledby={`phase-${phase}`}>
        <div className="plan-phase-heading"><Icon size={22} aria-hidden="true" />
          <div><h3 id={`phase-${phase}`}>{phaseCopy[phase].title[language]}</h3><p>{phaseCopy[phase].intro[language]}</p></div>
        </div>
        <ol className="plan-items" start={start[phase]}>{plan.items[phase].map((item, index) => {
          return <li key={item.program.id} className="plan-item">
            <span className="plan-number" aria-hidden="true">{start[phase] + index}</span>
            <div>
              <h4>{item.program.name}</h4>
              <p className="hint"><strong>{t('whyHere')}:</strong> {item.why[language]}</p>
              {item.firstStep && <p><strong>{t('firstMove')}:</strong> {item.firstStep.title[language]}. {item.firstStep.detail[language]}</p>}
              <div className="button-row">
                <button onClick={() => onOpen(item.program.id)} aria-label={`${t('details')}: ${item.program.name}`}>{t('details')}</button>
                {item.program.applyPhone && <a className="button" href={toTelHref(item.program.applyPhone)}>{t('call')} {item.program.applyPhone}</a>}
              </div>
            </div>
          </li>
        })}</ol>
      </section>
    })}
    {plan.documents.length > 0 && <details className="bring-list">
      <summary><FileText size={18} aria-hidden="true" /> {t('bringList')} ({plan.documents.length})</summary>
      <p className="hint">{t('bringIntro')}</p>
      <ul>{plan.documents.map((document, index) => <li key={index}>{document[language]}</li>)}</ul>
    </details>}
    <div className="save-panel">
      <p>{t('saveDisclosure')}</p>
      <div className="button-row">
        <button className="primary" disabled={!steps.ready || allSaved}
          onClick={() => { steps.savePrograms(ids); setSaved(true) }}>{t(allSaved ? 'saved' : 'savePlan')}</button>
        {(saved || allSaved) && <button onClick={onOpenSteps}>{t('openSteps')}</button>}
      </div>
      {saved && !steps.error && <p role="status">{t('planSaved')}</p>}
      {steps.error && <p role="alert">{steps.error[language]}</p>}
    </div>
  </div>
}
