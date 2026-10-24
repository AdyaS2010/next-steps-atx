/**
 * A private debt payoff simulator (in memory only). It illustrates two common
 * strategies; real interest, fees and minimums depend on each lender.
 */
export type Debt = { name: string; balance: number; apr: number; minimum: number }
export type Strategy = 'snowball' | 'avalanche'

export type PayoffResult = {
  feasible: boolean
  months: number
  totalInterest: number
  order: { name: string; month: number }[]
}

const MAX_MONTHS = 600

const valid = (debt: Debt) => Number.isFinite(debt.balance) && debt.balance > 0 &&
  Number.isFinite(debt.apr) && debt.apr >= 0 && Number.isFinite(debt.minimum) && debt.minimum >= 0

/**
 * Month by month: interest accrues, every minimum is paid, and the extra
 * amount (plus minimums freed by paid-off debts when rolling over) goes to the
 * target: smallest balance (snowball) or highest rate (avalanche).
 */
export function simulatePayoff(input: Debt[], extra: number, strategy: Strategy, rollover = true): PayoffResult {
  const debts = input.filter(valid).map(debt => ({ ...debt }))
  const order: PayoffResult['order'] = []
  if (!debts.length) return { feasible: true, months: 0, totalInterest: 0, order }
  const budget = debts.reduce((sum, debt) => sum + debt.minimum, 0) + Math.max(0, Number.isFinite(extra) ? extra : 0)
  let totalInterest = 0
  const paid = new Set<number>()
  for (let month = 1; month <= MAX_MONTHS; month++) {
    for (const debt of debts) {
      if (debt.balance <= 0) continue
      const interest = debt.balance * debt.apr / 1200
      debt.balance += interest
      totalInterest += interest
    }
    const open = debts.filter(debt => debt.balance > 0.005)
    let available = rollover ? budget : Math.min(budget, open.reduce((sum, debt) => sum + debt.minimum, 0) + Math.max(0, extra))
    for (const debt of open) {
      const pay = Math.min(debt.minimum, debt.balance, available)
      debt.balance -= pay
      available -= pay
    }
    const targets = debts.filter(debt => debt.balance > 0.005)
      .sort((a, b) => strategy === 'snowball' ? a.balance - b.balance || b.apr - a.apr : b.apr - a.apr || a.balance - b.balance)
    for (const debt of targets) {
      if (available <= 0) break
      const pay = Math.min(available, debt.balance)
      debt.balance -= pay
      available -= pay
    }
    debts.forEach((debt, index) => {
      if (debt.balance <= 0.005 && !paid.has(index)) {
        debt.balance = 0
        paid.add(index)
        order.push({ name: debt.name, month })
      }
    })
    if (debts.every(debt => debt.balance <= 0)) return { feasible: true, months: month, totalInterest: Math.round(totalInterest * 100) / 100, order }
  }
  return { feasible: false, months: MAX_MONTHS, totalInterest: Math.round(totalInterest * 100) / 100, order }
}

/** Baseline for comparison: only minimum payments, no extra and no rollover. */
export const minimumsOnly = (debts: Debt[]) => simulatePayoff(debts, 0, 'avalanche', false)
