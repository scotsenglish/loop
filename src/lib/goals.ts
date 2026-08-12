import type { SavingsGoal } from '@/types'

const DAY_MS = 24 * 60 * 60 * 1000

export function goalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount <= 0) return 0
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
}

export function isGoalComplete(goal: SavingsGoal): boolean {
  return goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount
}

/** Rough days-to-completion estimate based on the pace of contributions
 *  over the last 30 days (or since creation, if younger). Returns null when
 *  there isn't enough recent contribution activity to make a projection. */
export function projectedDaysToComplete(goal: SavingsGoal): number | null {
  if (isGoalComplete(goal)) return 0
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return 0

  const now = Date.now()
  const windowStart = Math.max(goal.createdAt, now - 30 * DAY_MS)
  const windowDays = Math.max(1, (now - windowStart) / DAY_MS)

  const recentTotal = goal.contributions
    .filter((c) => c.createdAt >= windowStart)
    .reduce((s, c) => s + c.amount, 0)

  if (recentTotal <= 0) return null
  const perDay = recentTotal / windowDays
  if (perDay <= 0) return null
  return Math.ceil(remaining / perDay)
}
