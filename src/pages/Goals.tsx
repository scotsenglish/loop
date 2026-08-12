import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { EmptyState } from '@/components/EmptyState'
import { GoalProgressBar } from '@/components/GoalProgressBar'
import { GoalFormSheet } from '@/components/GoalFormSheet'
import { GoalDetailSheet } from '@/components/GoalDetailSheet'
import type { SavingsGoal } from '@/types'

export default function Goals() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { goals } = useData()
  const [creating, setCreating] = useState(false)
  const [detailGoal, setDetailGoal] = useState<SavingsGoal | null>(null)

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-full p-1.5 active:bg-ink-100 dark:active:bg-ink-800">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
            {t('goalsPage.title')}
          </h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white"
          aria-label={t('goalsPage.addNew')}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title={t('goalsPage.empty')}
          action={
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> {t('goalsPage.addFirst')}
            </button>
          }
        />
      ) : (
        <div className="card-surface mt-4 divide-y divide-ink-100 rounded-2xl p-3 shadow-soft dark:divide-ink-800">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setDetailGoal(goal)}
              className="w-full py-3 text-left first:pt-0 last:pb-0"
            >
              <GoalProgressBar goal={goal} />
            </button>
          ))}
        </div>
      )}

      <GoalFormSheet open={creating} onClose={() => setCreating(false)} />
      <GoalDetailSheet goal={detailGoal} onClose={() => setDetailGoal(null)} />
    </div>
  )
}
