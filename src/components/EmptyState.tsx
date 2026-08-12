import type { ReactNode } from 'react'

export function EmptyState({
  icon = '🧾',
  title,
  action,
}: {
  icon?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="animate-fade-in flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl dark:bg-brand-900/30">
        {icon}
      </div>
      <p className="max-w-[220px] text-sm text-ink-400">{title}</p>
      {action}
    </div>
  )
}
