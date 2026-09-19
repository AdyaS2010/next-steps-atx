import { useEffect, useRef, useState } from 'react'
import { createTranslator } from '../lib/i18n'
import { relevantQuestions } from '../lib/eligibility'
import type { Household, HouseholdFlag, Language, Localized } from '../types'
import NeedButtons from './NeedButtons'

export type MoneyDraft = {
  amount: number | null
  role: 'income' | 'expense' | 'unknown'
  period: 'monthly' | 'weekly' | 'biweekly' | 'yearly' | 'unknown'
}

const flagLabels: Record<HouseholdFlag, Localized> = {
  hasChildrenUnder18: { en: 'Children under 18 in the household?', es: '¿Hay niños menores de 18 años en el hogar?' },
  hasChildUnder5OrPregnant: { en: 'Pregnant, or a child under 5?', es: '¿Hay embarazo o un niño menor de 5 años?' },
  hasSenior60Plus: { en: 'Someone age 60 or older?', es: '¿Hay alguien de 60 años o más?' },
  hasDisability: { en: 'Someone with a disability?', es: '¿Hay alguien con una discapacidad?' },
  isVeteranHousehold: { en: 'A veteran in the household?', es: '¿Hay un veterano en el hogar?' },
  isUninsured: { en: 'Someone without health insurance?', es: '¿Hay alguien sin seguro médico?' },
  isUnemployed: { en: 'Currently unemployed?', es: '¿Está sin empleo actualmente?' },
  isRenter: { en: 'Do you rent your home?', es: '¿Alquila su vivienda?' },
  isImmigrantOrNewcomer: { en: 'Would newcomer support be useful?', es: '¿Le sería útil el apoyo para recién llegados?' },
  isStudent: { en: 'A student in the household?', es: '¿Hay un estudiante en el hogar?' },
  isHomeowner: { en: 'Do you own your home?', es: '¿Es propietario de su vivienda?' },
  isCaregiver: { en: 'Do you care for a child or adult?', es: '¿Cuida a un niño o adulto?' },
  isHomeless: { en: 'Without a stable place to stay?', es: '¿No tiene un lugar estable donde quedarse?' },
  needsTransportation: { en: 'Do you need help with transportation?', es: '¿Necesita ayuda con el transporte?' },
  hasChildUnder13: { en: 'Children under 13 in the household?', es: '¿Hay niños menores de 13 años en el hogar?' },
  isWorkingOrTraining: { en: 'Working, studying or in job training?', es: '¿Trabaja, estudia o recibe capacitación laboral?' },
}

export default function HouseholdFlow({ initial, language, confirmation, inferred = [], money: initialMoney, onSubmit, onCancel }: {
  initial: Household
  language: Language
  confirmation: boolean
  inferred?: HouseholdFlag[]
  money?: MoneyDraft
  onSubmit: (household: Household) => void
  onCancel: () => void
}) {
  const t = createTranslator(language)
  const [draft, setDraft] = useState(initial)
  const [step, setStep] = useState(0)
  const question = useRef<HTMLDivElement>(null)
  useEffect(() => { if (step > 0) question.current?.focus() }, [step])
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [money, setMoney] = useState<MoneyDraft>(initialMoney ?? {
    amount: initial.monthlyIncome, role: 'income', period: 'monthly',
  })
  const set = <K extends keyof Household>(key: K, value: Household[K]) =>
    setDraft(previous => ({ ...previous, [key]: value }))
  const flags = relevantQuestions(draft.needs)
  const monthly = money.role !== 'income' || money.amount === null || money.period === 'unknown' ? null :
    money.amount * ({ monthly: 1, weekly: 52 / 12, biweekly: 26 / 12, yearly: 1 / 12 }[money.period])
  const submit = () => onSubmit({ ...draft, monthlyIncome: monthly === null ? null : Math.round(monthly * 100) / 100 })
  const numberOrNull = (value: string) => value.trim() === '' ? null : Number(value)
  const chooseUnknown = (field: 'size' | 'income', choice: string) => {
    setChoices(previous => ({ ...previous, [field]: choice }))
    if (field === 'size') set('size', null)
    else setMoney(previous => ({ ...previous, amount: null }))
  }
  const unknownButtons = (field: 'size' | 'income') => <div className="choice-row">
    {(['notSure', 'preferNot'] as const).map(choice =>
      <button key={choice} type="button" aria-pressed={choices[field] === choice}
        onClick={() => chooseUnknown(field, choice)}>{t(choice)}</button>)}
  </div>
  const flagField = (flag: HouseholdFlag) => <div className="field" key={flag}>
    <label htmlFor={`flag-${flag}`}>{flagLabels[flag][language]}</label>
    {inferred.includes(flag) && <small>{t('inferred')}</small>}
    <select id={`flag-${flag}`} value={choices[flag] ?? (draft[flag] === null ? '' : String(draft[flag]))}
      onChange={event => {
        const value = event.target.value
        setChoices(previous => ({ ...previous, [flag]: value }))
        set(flag, value === 'true' ? true : value === 'false' ? false : null)
      }}>
      <option value="">{t('unknown')}</option>
      <option value="true">{t('yes')}</option>
      <option value="false">{t('no')}</option>
      <option value="unknown">{t('notSure')}</option>
      <option value="prefer">{t('preferNot')}</option>
    </select>
  </div>
  const panels = [
    <fieldset key="needs"><legend>{t('needs')}</legend><NeedButtons language={language} compact selected={draft.needs}
      onChoose={need => set('needs', draft.needs.includes(need) ? draft.needs.filter(item => item !== need) : [...draft.needs, need])} /></fieldset>,
    <div className="field" key="size">
      <label htmlFor="household-size">{t('householdSize')}</label>
      <p className="hint" id="size-hint">{t('householdHint')}</p>
      <input id="household-size" type="number" inputMode="numeric" min="1" max="20" step="1"
        aria-describedby="size-hint" value={draft.size ?? ''} placeholder={t('notSure')}
        onChange={event => { set('size', numberOrNull(event.target.value)); setChoices(previous => ({ ...previous, size: '' })) }} />
      {unknownButtons('size')}
    </div>,
    <fieldset key="income"><legend>{t('income')}</legend>
      <div className="field"><label htmlFor="money-role">{t('moneyRole')}</label>
        <select id="money-role" value={money.role} onChange={event => setMoney({ ...money, role: event.target.value as MoneyDraft['role'] })}>
          <option value="income">{t('roleIncome')}</option><option value="expense">{t('roleExpense')}</option><option value="unknown">{t('roleUnknown')}</option>
        </select>
      </div>
      <div className="field-pair"><div className="field"><label htmlFor="income-amount">{t('amount')}</label>
        <input id="income-amount" type="number" inputMode="decimal" min="0" max="100000000" step="0.01" value={money.amount ?? ''}
          placeholder={t('notSure')} onChange={event => { setMoney({ ...money, amount: numberOrNull(event.target.value) }); setChoices(previous => ({ ...previous, income: '' })) }} />
      </div><div className="field"><label htmlFor="income-period">{t('period')}</label>
        <select id="income-period" value={money.period} onChange={event => setMoney({ ...money, period: event.target.value as MoneyDraft['period'] })}>
          {(['monthly', 'weekly', 'biweekly', 'yearly'] as const).map(period => <option key={period} value={period}>{t(period)}</option>)}
          <option value="unknown">{t('periodUnknown')}</option>
        </select>
      </div></div>
      {unknownButtons('income')}
      <p className="hint">{t('moneyHint')}</p>
      <p className="notice" aria-live="polite">{t('conversion')}: {monthly === null ? t('unknown') : new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(monthly)}</p>
    </fieldset>,
    <fieldset key="location"><legend>{t('county')}</legend>
      <select aria-label={t('county')} value={choices.county ?? draft.county ?? ''}
        onChange={event => { const value = event.target.value; setChoices(previous => ({ ...previous, county: value })); set('county', value === 'travis' || value === 'other' ? value : null) }}>
        <option value="">{t('unknown')}</option><option value="travis">{t('yes')}</option><option value="other">{t('no')}</option>
        <option value="unknown">{t('notSure')}</option><option value="prefer">{t('preferNot')}</option>
      </select>
      <div className="field"><label htmlFor="household-zip">{t('zip')}</label>
        <input id="household-zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={draft.zip ?? ''}
          aria-describedby="zip-hint" onChange={event => set('zip', event.target.value || null)} />
        <p className="hint" id="zip-hint">{t('zipHint')}</p>
      </div>
    </fieldset>,
    ...flags.map(flagField),
  ]

  return <section className="narrow flow">
    <h1>{t(confirmation ? 'confirmation' : 'manualHeading')}</h1>
    <p>{t(confirmation ? 'confirmBody' : 'optional')}</p>
    <p className="privacy-line">{t('private')}</p>
    <form onSubmit={event => {
      event.preventDefault()
      if (confirmation || step === panels.length - 1) submit()
      else setStep(value => value + 1)
    }}>
      {confirmation ? <>
        {panels.slice(0, 4)}
        {inferred.map(flagField)}
        <details><summary>{t('additional')}</summary>{flags.filter(flag => !inferred.includes(flag)).map(flagField)}</details>
      </> : <div className="question-panel" key={step} ref={question} tabIndex={-1}>
        <p className="eyebrow">{step + 1} / {panels.length}</p>
        {panels[step]}
      </div>}
      <div className="form-actions">
        <button type="button" onClick={() => !confirmation && step > 0 ? setStep(value => value - 1) : onCancel()}>{t('back')}</button>
        <button className="primary" type="submit">{t(confirmation || step === panels.length - 1 ? 'showMatches' : 'next')}</button>
      </div>
      {!confirmation && draft.needs.length > 0 && <button type="button" className="text-button"
        onClick={event => {
          if (event.currentTarget.form?.reportValidity()) submit()
        }}>
        {language === 'es' ? 'Mostrar opciones con lo que ya compartí' : 'Show options with what I have shared'}
      </button>}
    </form>
  </section>
}
