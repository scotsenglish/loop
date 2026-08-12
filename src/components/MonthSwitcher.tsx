import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

function shiftMonth(month: string, delta: number): string {
  const d = new Date(`${month}-01T00:00:00`)
  d.setMonth(d.getMonth() + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function MonthSwitcher({
  month,
  onChange,
}: {
  month: string
  onChange: (m: string) => void
}) {
  const { t } = useLanguage()
  const isCurrent = month === new Date().toISOString().slice(0, 7)
  const d = new Date(`${month}-01T00:00:00`)
  const label = d.toLocaleDateString(t('locale.code'), { month: 'long', year: 'numeric' })

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-2 py-1.5 shadow-soft dark:bg-ink-900">
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        className="rounded-full p-2 text-ink-500 active:bg-ink-100 dark:active:bg-ink-800"
        aria-label={t('month.prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="font-display text-sm font-bold capitalize text-ink-800 dark:text-white">{label}</span>
      <button
        onClick={() => onChange(shiftMonth(month, 1))}
        disabled={isCurrent}
        className="rounded-full p-2 text-ink-500 disabled:opacity-30 active:bg-ink-100 dark:active:bg-ink-800"
        aria-label={t('month.next')}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
