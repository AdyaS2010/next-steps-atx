import type { Localized } from '../types'

/**
 * A private, in-memory monthly budget check. Nothing here is saved or sent.
 * Each expense line lists catalog programs that address that kind of cost;
 * listing a program is not a claim that it will lower the bill.
 */
export type ExpenseKey = 'housing' | 'utilities' | 'food' | 'childcare' | 'transportation' | 'phone' | 'health' | 'debt'

export const expenseLines: { key: ExpenseKey; label: Localized; programIds: string[] }[] = [
  { key: 'housing', label: { en: 'Rent or mortgage', es: 'Renta o hipoteca' }, programIds: ['rental-help', 'eviction-legal-info', 'property-tax'] },
  { key: 'utilities', label: { en: 'Electric, water & gas', es: 'Luz, agua y gas' }, programIds: ['utility-cap', 'ceap'] },
  { key: 'food', label: { en: 'Groceries', es: 'Comestibles' }, programIds: ['snap', 'wic', 'food-bank', 'school-meals', 'senior-meals'] },
  { key: 'childcare', label: { en: 'Child care', es: 'Cuidado infantil' }, programIds: ['child-care', 'head-start'] },
  { key: 'transportation', label: { en: 'Transportation', es: 'Transporte' }, programIds: ['capmetro-transit', 'capmetro-pickup', 'capmetro-access'] },
  { key: 'phone', label: { en: 'Phone & internet', es: 'Teléfono e internet' }, programIds: ['lifeline', 'public-library'] },
  { key: 'health', label: { en: 'Health care & medicine', es: 'Salud y medicinas' }, programIds: ['map', 'chip', 'communitycare', 'insure-central-texas'] },
  { key: 'debt', label: { en: 'Debt & other bills', es: 'Deudas y otras facturas' }, programIds: ['financial-coaching', 'free-tax-prep'] },
]

export type Budget = { income: number | null } & Partial<Record<ExpenseKey, number | null>>

export type BudgetSummary = {
  totalExpenses: number
  /** Income minus expenses; null when income is unknown. */
  balance: number | null
  /** Housing plus utility costs as a share of income, 0–1+; null when not computable. */
  housingShare: number | null
  /** HUD: over 30% of income on housing is cost-burdened, over 50% severely. */
  housingBurden: 'none' | 'burdened' | 'severe' | null
  /** Expense lines with an amount, largest first. */
  ranked: { key: ExpenseKey; amount: number }[]
}

const valid = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

export function summarizeBudget(budget: Budget): BudgetSummary {
  const ranked = expenseLines
    .map(({ key }) => ({ key, amount: budget[key] }))
    .filter((line): line is { key: ExpenseKey; amount: number } => valid(line.amount) && line.amount > 0)
    .sort((a, b) => b.amount - a.amount)
  const totalExpenses = Math.round(ranked.reduce((sum, line) => sum + line.amount, 0) * 100) / 100
  const income = valid(budget.income) ? budget.income : null
  // HUD counts utilities as part of housing cost.
  const housing = valid(budget.housing) ? budget.housing + (valid(budget.utilities) ? budget.utilities : 0) : null
  const housingShare = income && housing !== null ? housing / income : null
  return {
    totalExpenses,
    balance: income === null ? null : Math.round((income - totalExpenses) * 100) / 100,
    housingShare,
    housingBurden: housingShare === null ? null : housingShare > 0.5 ? 'severe' : housingShare > 0.3 ? 'burdened' : 'none',
    ranked,
  }
}

export const hudBurdenSource = {
  label: 'HUD USER: Defining Housing Affordability',
  url: 'https://www.huduser.gov/portal/pdredge/pdr-edge-featd-article-081417.html',
}
