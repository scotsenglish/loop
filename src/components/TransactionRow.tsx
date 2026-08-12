import { Check } from 'lucide-react'
import type { Category, Transaction } from '@/types'
import { formatVND } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'
import clsx from 'clsx'

export function TransactionRow({
  tx,
  category,
  onClick,
  selectable,
  selected,
  onToggleSelect,
}: {
  tx: Transaction
  category: Category | undefined
  onClick?: () => void
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}) {
  const { t, lang } = useLanguage()
  return (
    <button
      onClick={selectable ? onToggleSelect : onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition active:bg-ink-100 dark:active:bg-ink-800"
    >
      {selectable && (
        <span
          className={clsx(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
            selected
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-ink-300 dark:border-ink-600'
          )}
        >
          {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
      )}
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: (category?.color ?? '#6B7280') + '22' }}
      >
        {category?.icon ?? '🔖'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-50">
          {category ? localizeCategoryName(category.name, lang) : t('tx.unknownCategory')}
        </p>
        {tx.note && <p className="truncate text-xs text-ink-400">{tx.note}</p>}
      </div>
      <span
        className={clsx(
          'shrink-0 text-sm font-bold tabular-nums',
          tx.type === 'income' ? 'text-mint-600' : 'text-ink-800 dark:text-ink-100'
        )}
      >
        {tx.type === 'income' ? '+' : '-'}
        {formatVND(tx.amount)}
      </span>
    </button>
  )
}
