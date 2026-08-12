import type { ReactNode } from 'react'
import clsx from 'clsx'

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  icon?: ReactNode
  tone?: 'default' | 'positive' | 'negative'
}) {
  return (
    <div className="card-surface flex flex-1 flex-col gap-1 rounded-2xl p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-400">{label}</span>
        {icon}
      </div>
      <span
        className={clsx(
          'font-display text-xl font-extrabold tabular-nums',
          tone === 'positive' && 'text-mint-600',
          tone === 'negative' && 'text-rose-500',
          tone === 'default' && 'text-ink-900 dark:text-white'
        )}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-ink-400">{sub}</span>}
    </div>
  )
}
