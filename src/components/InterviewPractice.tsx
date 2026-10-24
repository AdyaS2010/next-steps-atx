import { useState } from 'react'
import { Lightbulb, MessageCircleQuestion } from 'lucide-react'
import { interviewDayTips, interviewQuestions, starParts } from '../data/interview'
import { createTranslator } from '../lib/i18n'
import type { Language } from '../types'

type Star = Record<'situation' | 'task' | 'action' | 'result', string>
const emptyStar = (): Star => ({ situation: '', task: '', action: '', result: '' })

/** Practice answers live in memory only and disappear on refresh. */
export function InterviewPractice({ language, onOpen }: { language: Language; onOpen: (id: string) => void }) {
  const t = createTranslator(language)
  const [selected, setSelected] = useState(interviewQuestions[0].id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [stars, setStars] = useState<Record<string, Star>>({})
  const question = interviewQuestions.find(item => item.id === selected)!
  const star = stars[selected] ?? emptyStar()
  const answer = answers[selected] ?? ''
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const starAnswer = starParts.map(part => star[part.key].trim()).filter(Boolean).join(' ')
  return <div className="interview">
    <h2>{t('interviewHeading')}</h2>
    <p className="hint">{t('interviewIntro')}</p>
    <div className="interview-layout">
      <ol className="question-list" aria-label={t('interviewQuestions')}>
        {interviewQuestions.map((item, index) => <li key={item.id}>
          <button aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>
            <span className="question-number" aria-hidden="true">{index + 1}</span>{item.question[language]}
          </button>
        </li>)}
      </ol>
      <section className="question-coach" aria-live="polite" aria-labelledby="coach-question">
        <p className="eyebrow"><MessageCircleQuestion size={16} aria-hidden="true" /> {t('interviewAsk')}</p>
        <h3 id="coach-question">{question.question[language]}</h3>
        <dl className="coach-notes">
          <div><dt>{t('interviewWhy')}</dt><dd>{question.why[language]}</dd></div>
          <div><dt>{t('interviewHow')}</dt><dd>{question.how[language]}</dd></div>
        </dl>
        {question.id === 'record' && <p className="notice">{t('interviewRecord')} <button className="text-button" onClick={() => onOpen('record-clearing')}>{t('details')}</button></p>}
        {question.star ? <fieldset className="star-builder">
          <legend>{t('starHeading')}</legend>
          {starParts.map(part => <div className="field" key={part.key}>
            <label htmlFor={`star-${part.key}`}><strong>{part.label[language][0]}</strong>{part.label[language].slice(1)}</label>
            <textarea id={`star-${part.key}`} rows={2} placeholder={part.hint[language]} value={star[part.key]}
              onChange={event => setStars(previous => ({ ...previous, [selected]: { ...star, [part.key]: event.target.value } }))} />
          </div>)}
          {starAnswer && <div className="star-preview"><p className="eyebrow">{t('starPreview')}</p><p>{starAnswer}</p></div>}
        </fieldset> : <div className="field">
          <label htmlFor="practice-answer">{t('interviewPractice')}</label>
          <textarea id="practice-answer" rows={5} value={answer} onChange={event => setAnswers(previous => ({ ...previous, [selected]: event.target.value }))} />
          <p className="hint">{words} {t('words')} · {t('wordsHint')}</p>
        </div>}
      </section>
    </div>
    <div className="notice day-tips">
      <h3><Lightbulb size={18} aria-hidden="true" /> {t('interviewDay')}</h3>
      <ul>{interviewDayTips.map(tip => <li key={tip.en}>{tip[language]}</li>)}</ul>
    </div>
  </div>
}
