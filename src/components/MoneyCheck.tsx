import { useMemo, useState } from 'react'
import { programs } from '../data/programs'
import { createTranslator } from '../lib/i18n'
import { expenseLines, hudBurdenSource, summarizeBudget, type Budget, type ExpenseKey } from '../lib/money'
import type { BenefitCategory, Language } from '../types'
import { DebtPlanner } from './DebtPlanner'

const needsFor: Record<ExpenseKey, BenefitCategory> = {
  housing: 'housing', utilities: 'utilities', food: 'food', childcare: 'family',
  transportation: 'transportation', phone: 'utilities', health: 'health', debt: 'financial',
}

/** In-memory only: amounts are never saved, logged or sent. */
export function MoneyCheck({ language, onOpen, onPlan }: {
  language: Language
  onOpen: (id: string) => void
  onPlan: (needs: BenefitCategory[]) => void
}) {
  const t = createTranslator(language)
  const [budget, setBudget] = useState<Budget>({ income: null })
  const summary = useMemo(() => summarizeBudget(budget), [budget])
  const currency = new Intl.NumberFormat(language, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  const amount = (value: string) => {
    if (value.trim() === '') return null
    const number = Number(value)
    return Number.isFinite(number) && number >= 0 ? number : null
  }
  const field = (id: string, label: string, value: number | null | undefined, onChange: (value: number | null) => void) =>
    <div className="field money-field" key={id}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" min="0" max="1000000" step="1" value={value ?? ''}
        onChange={event => onChange(amount(event.target.value))} />
    </div>
  const top = summary.ranked.slice(0, 3)
  const planNeeds = [...new Set(top.map(line => needsFor[line.key]))]
  return <section className="narrow money-check">
    <h1 tabIndex={-1}>{t('moneyCheck')}</h1>
    <p>{t('moneyIntro')}</p>
    <form className="panel" onSubmit={event => event.preventDefault()}>
      {field('money-income', t('moneyIncome'), budget.income, value => setBudget(previous => ({ ...previous, income: value })))}
      <fieldset><legend>{t('moneyExpenses')}</legend>
        <div className="money-grid">{expenseLines.map(line => field(`money-${line.key}`, line.label[language], budget[line.key],
          value => setBudget(previous => ({ ...previous, [line.key]: value }))))}</div>
      </fieldset>
    </form>
    <div className="money-summary" aria-live="polite">
      <dl>
        <div><dt>{t('moneyTotal')}</dt><dd>{currency.format(summary.totalExpenses)}</dd></div>
        {summary.balance !== null && <div className={summary.balance < 0 ? 'money-short' : 'money-left'}>
          <dt>{t(summary.balance < 0 ? 'moneyShort' : 'moneyLeft')}</dt><dd>{currency.format(Math.abs(summary.balance))}</dd>
        </div>}
      </dl>
      {summary.housingBurden && <p className={summary.housingBurden === 'none' ? 'notice' : 'notice notice-warning'}>
        {t(summary.housingBurden === 'severe' ? 'moneyBurdenSevere' : summary.housingBurden === 'burdened' ? 'moneyBurden' : 'moneyBurdenOk')}{' '}
        <a href={hudBurdenSource.url} target="_blank" rel="noreferrer">{hudBurdenSource.label}</a>
      </p>}
    </div>
    {top.length === 0 ? <p className="empty-state">{t('moneyEmpty')}</p> : <section aria-labelledby="money-help-heading">
      <h2 id="money-help-heading">{t('moneyHelp')}</h2>
      <p className="hint">{t('moneyHelpNote')}</p>
      {top.map(line => {
        const meta = expenseLines.find(item => item.key === line.key)!
        const helpers = meta.programIds.map(id => programs.find(program => program.id === id)).filter(program => program !== undefined)
        return <div className="money-line" key={line.key}>
          <h3>{meta.label[language]} <span className="hint">{currency.format(line.amount)}</span></h3>
          <ul className="chip-list">{helpers.map(program => <li key={program.id}>
            <button onClick={() => onOpen(program.id)} aria-label={`${t('details')}: ${program.name}`}>{program.name}</button>
          </li>)}</ul>
        </div>
      })}
      <button className="primary" onClick={() => onPlan(planNeeds)}>{t('moneyPlan')}</button>
    </section>}
    <DebtPlanner language={language} onOpen={onOpen} />
  </section>
}
