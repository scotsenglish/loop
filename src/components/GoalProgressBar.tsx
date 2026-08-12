import { addDays } from 'date-fns'
import { useLanguage } from '@/context/LanguageContext'
import { formatVND } from '@/lib/format'
import { goalProgress, isGoalComplete, projectedDaysToComplete } from '@/lib/goals'
import type { SavingsGoal } from '@/types'

export function GoalProgressBar({ goal }: { goal: SavingsGoal }) {
  const { t } = useLanguage()
  const percent = goalProgress(goal)
  const complete = isGoalComplete(goal)
  const daysLeft = projectedDaysToComplete(goal)

  let paceLine: string
  if (complete) {
    paceLine = t('goalsPage.completed')
  } else if (daysLeft !== null) {
    const projectedDate = addDays(new Date(), daysLeft).toLocaleDateString(t('locale.code'), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    paceLine = t('goalsPage.projected', projectedDate)
  } else {
    paceLine = t('goalsPage.noPaceYet')
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-ink-600 dark:text-ink-300">
          <span>{goal.icon}</span>
          {goal.name}
        </span>
        <span className="font-semibold text-ink-800 dark:text-white">
          {formatVND(goal.currentAmount)} / {formatVND(goal.targetAmount)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: complete ? '#10b981' : goal.color }}
        />
      </div>
      <p className="mt-1 text-[11px] text-ink-400">{paceLine}</p>
    </div>
  )
}
