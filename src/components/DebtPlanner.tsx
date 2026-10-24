import { useState } from 'react'
import { Plus, Trash2, TrendingDown } from 'lucide-react'
import { createTranslator } from '../lib/i18n'
import { minimumsOnly, simulatePayoff, type Debt, type Strategy } from '../lib/debt'
import type { Language } from '../types'

type Row = { name: string; balance: string; apr: string; minimum: string }
const emptyRow = (): Row => ({ name: '', balance: '', apr: '', minimum: '' })
const toNumber = (value: string) => value.trim() === '' ? Number.NaN : Number(value)

/** In-memory only: debts are never saved or sent. */
export function DebtPlanner({ language, onOpen }: { language: Language; onOpen: (id: string) => void }) {
  const t = createTranslator(language)
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()])
  const [extra, setExtra] = useState('')
  const [strategy, setStrategy] = useState<Strategy>('snowball')
  const debts: Debt[] = rows.map((row, index) => ({
    name: row.name.trim() || `${t('debt')} ${index + 1}`, balance: toNumber(row.balance), apr: toNumber(row.apr) || 0, minimum: toNumber(row.minimum),
  })).filter(debt => debt.balance > 0 && debt.minimum >= 0)
  const extraAmount = Math.max(0, toNumber(extra) || 0)
  const plan = simulatePayoff(debts, extraAmount, strategy)
  const baseline = minimumsOnly(debts)
  const currency = new Intl.NumberFormat(language, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  const duration = (months: number) => months < 12 ? `${months} ${t('monthsUnit')}` : `${Math.floor(months / 12)} ${t('yearsUnit')}${months % 12 ? ` ${months % 12} ${t('monthsUnit')}` : ''}`
  const setRow = (index: number, patch: Partial<Row>) => setRows(previous => previous.map((row, i) => i === index ? { ...row, ...patch } : row))
  const saved = baseline.feasible && plan.feasible ? Math.max(0, baseline.totalInterest - plan.totalInterest) : null

  return <section className="debt-planner" aria-labelledby="debt-heading">
    <h2 id="debt-heading"><TrendingDown size={22} aria-hidden="true" /> {t('debtHeading')}</h2>
    <p className="hint">{t('debtIntro')}</p>
    <div className="debt-rows">
      {rows.map((row, index) => <div className="debt-row" key={index}>
        <div className="field"><label htmlFor={`debt-name-${index}`}>{t('debtName')}</label>
          <input id={`debt-name-${index}`} value={row.name} placeholder={`${t('debt')} ${index + 1}`} onChange={event => setRow(index, { name: event.target.value })} /></div>
        <div className="field"><label htmlFor={`debt-balance-${index}`}>{t('debtBalance')}</label>
          <input id={`debt-balance-${index}`} type="number" inputMode="decimal" min="0" value={row.balance} onChange={event => setRow(index, { balance: event.target.value })} /></div>
        <div className="field"><label htmlFor={`debt-apr-${index}`}>{t('debtApr')}</label>
          <input id={`debt-apr-${index}`} type="number" inputMode="decimal" min="0" max="100" step="0.1" value={row.apr} onChange={event => setRow(index, { apr: event.target.value })} /></div>
        <div className="field"><label htmlFor={`debt-min-${index}`}>{t('debtMinimum')}</label>
          <input id={`debt-min-${index}`} type="number" inputMode="decimal" min="0" value={row.minimum} onChange={event => setRow(index, { minimum: event.target.value })} /></div>
        {rows.length > 1 && <button type="button" className="icon-button" aria-label={`${t('removeDebt')} ${index + 1}`} onClick={() => setRows(previous => previous.filter((_, i) => i !== index))}><Trash2 size={18} aria-hidden="true" /></button>}
      </div>)}
    </div>
    <button type="button" onClick={() => setRows(previous => [...previous, emptyRow()])}><Plus size={18} aria-hidden="true" />{t('addDebt')}</button>
    <div className="field-grid debt-options">
      <div className="field"><label htmlFor="debt-extra">{t('debtExtra')}</label>
        <input id="debt-extra" type="number" inputMode="decimal" min="0" value={extra} onChange={event => setExtra(event.target.value)} /></div>
      <fieldset className="field"><legend>{t('debtMethod')}</legend>
        <div className="segmented">
          <button type="button" aria-pressed={strategy === 'snowball'} onClick={() => setStrategy('snowball')}>{t('snowball')}</button>
          <button type="button" aria-pressed={strategy === 'avalanche'} onClick={() => setStrategy('avalanche')}>{t('avalanche')}</button>
        </div>
        <p className="hint">{t(strategy === 'snowball' ? 'snowballHint' : 'avalancheHint')}</p>
      </fieldset>
    </div>
    {debts.length === 0 ? <p className="empty-state">{t('debtEmpty')}</p> : <div className="debt-results" aria-live="polite">
      {!plan.feasible ? <p className="notice notice-warning">{t('debtInfeasible')}</p> : <>
        <dl className="stat-row">
          <div><dt>{t('debtFree')}</dt><dd>{duration(plan.months)}</dd></div>
          <div><dt>{t('debtInterest')}</dt><dd>{currency.format(plan.totalInterest)}</dd></div>
          {saved !== null && saved >= 1 && <div className="stat-good"><dt>{t('debtSaved')}</dt><dd>{currency.format(saved)}</dd></div>}
        </dl>
        {baseline.feasible && <p className="hint">{t('debtBaseline')}: {duration(baseline.months)}, {currency.format(baseline.totalInterest)} {t('debtInterestShort')}.</p>}
        {!baseline.feasible && <p className="hint">{t('debtBaselineNever')}</p>}
        <ol className="payoff-order">{plan.order.map((item, index) => <li key={index}><strong>{item.name}</strong> · {t('paidOffIn')} {duration(item.month)}</li>)}</ol>
      </>}
      <p className="hint">{t('debtNote')} <button className="text-button" onClick={() => onOpen('financial-coaching')}>{t('debtCoaching')}</button></p>
    </div>}
  </section>
}
