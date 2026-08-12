import { useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { buildHeatmap } from '@/lib/heatmap'

const WEEKS = 18

const LEVEL_COLORS = [
  'bg-ink-100 dark:bg-ink-800',
  'bg-mint-200 dark:bg-mint-900/60',
  'bg-mint-400 dark:bg-mint-700',
  'bg-mint-500 dark:bg-mint-600',
  'bg-mint-600 dark:bg-mint-400',
]

export function HabitHeatmap() {
  const { transactions } = useData()
  const { t } = useLanguage()
  const columns = useMemo(() => buildHeatmap(transactions, WEEKS), [transactions])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Most recent weeks are on the right — start scrolled there instead of
    // making the person scroll to find "now".
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [])

  return (
    <div>
      <div ref={scrollRef} className="flex gap-[3px] overflow-x-auto pb-1 no-scrollbar">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((day) => (
              <div
                key={day.date}
                className={clsx(
                  'h-2.5 w-2.5 rounded-[2px]',
                  day.level === -1 ? 'bg-transparent' : LEVEL_COLORS[day.level]
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-ink-400">
        <span>{t('heatmap.less')}</span>
        {LEVEL_COLORS.map((c, i) => (
          <span key={i} className={clsx('h-2.5 w-2.5 rounded-[2px]', c)} />
        ))}
        <span>{t('heatmap.more')}</span>
      </div>
    </div>
  )
}
