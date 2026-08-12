import clsx from 'clsx'
import type { Category } from '@/types'
import { formatVND } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'

export function BudgetProgressBar({
  category,
  spent,
  budget,
}: {
  category: Category | undefined
  spent: number
  budget: number
}) {
  const { t, lang } = useLanguage()
  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  const over = spent > budget
  const near = !over && percent >= 80

  return (
    <div className="py-2">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-ink-600 dark:text-ink-300">
          <span>{category?.icon}</span>
          {category ? localizeCategoryName(category.name, lang) : ''}
        </span>
        <span
          className={clsx(
            'font-semibold',
            over ? 'text-rose-500' : near ? 'text-amber-500' : 'text-ink-500'
          )}
        >
          {formatVND(spent)} / {formatVND(budget)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className={clsx(
            'h-full rounded-full transition-all',
            over ? 'bg-rose-500' : near ? 'bg-amber-500' : 'bg-mint-500'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {over && (
        <p className="mt-1 text-[11px] font-medium text-rose-500">
          {t('budget.over', formatVND(spent - budget))}
        </p>
      )}
    </div>
  )
}
