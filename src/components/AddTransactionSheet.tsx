import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { X, Check } from 'lucide-react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { formatNumber } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import { NumericKeypad } from '@/components/NumericKeypad'
import type { Transaction, TransactionType } from '@/types'

const MAX_AMOUNT_DIGITS = 12

interface Props {
  open: boolean
  onClose: () => void
  editing?: Transaction | null
}

export function AddTransactionSheet({ open, onClose, editing }: Props) {
  const { categories, addTransaction, updateTransaction, deleteTransaction } = useData()
  const { t, lang } = useLanguage()
  const [type, setType] = useState<TransactionType>('expense')
  const [amountStr, setAmountStr] = useState('0')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setType(editing.type)
      setAmountStr(String(editing.amount || 0))
      setCategoryId(editing.categoryId)
      setNote(editing.note ?? '')
      setDate(editing.date)
    } else {
      setType('expense')
      setAmountStr('0')
      setCategoryId(null)
      setNote('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [open, editing])

  const visibleCategories = categories.filter((c) => c.type === type || c.type === 'both')

  function handleKey(key: string) {
    if (key === 'back') {
      setAmountStr((s) => (s.length <= 1 ? '0' : s.slice(0, -1)))
      return
    }
    setAmountStr((s) => {
      const next = s === '0' ? key.replace(/^0+/, '') || '0' : s + key
      return next.length > MAX_AMOUNT_DIGITS ? s : next
    })
  }

  async function handleSave() {
    const amount = parseInt(amountStr, 10) || 0
    if (amount <= 0 || !categoryId) return
    setSaving(true)
    try {
      if (editing) {
        await updateTransaction(editing.id, { type, amount, categoryId, note, date })
      } else {
        await addTransaction({ type, amount, categoryId, note, date })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    setSaving(true)
    try {
      await deleteTransaction(editing.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const canSave = (parseInt(amountStr, 10) || 0) > 0 && !!categoryId

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink-950/50 backdrop-blur-sm">
      <div className="animate-rise-in flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white safe-bottom dark:bg-ink-900">
        <div className="flex items-center justify-between px-5 pt-4">
          <button onClick={onClose} className="rounded-full p-2 text-ink-400 active:bg-ink-100 dark:active:bg-ink-800">
            <X className="h-5 w-5" />
          </button>
          <div className="flex rounded-full bg-ink-50 p-1 text-sm font-semibold dark:bg-ink-800">
            <button
              onClick={() => {
                setType('expense')
                setCategoryId(null)
              }}
              className={clsx(
                'rounded-full px-4 py-1.5 transition',
                type === 'expense' ? 'bg-rose-500 text-white' : 'text-ink-500'
              )}
            >
              {t('tx.expense')}
            </button>
            <button
              onClick={() => {
                setType('income')
                setCategoryId(null)
              }}
              className={clsx(
                'rounded-full px-4 py-1.5 transition',
                type === 'income' ? 'bg-mint-500 text-white' : 'text-ink-500'
              )}
            >
              {t('tx.income')}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={clsx(
              'rounded-full p-2 transition',
              canSave ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-300 dark:bg-ink-800'
            )}
          >
            <Check className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
          <div className="mt-4 text-center">
            <span className="font-display text-4xl font-extrabold tabular-nums">
              {formatNumber(parseInt(amountStr, 10) || 0)}
            </span>
            <span className="ml-1 text-lg font-semibold text-ink-400">₫</span>
          </div>

          <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
            {visibleCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={clsx(
                  'flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 transition',
                  categoryId === c.id ? 'bg-brand-50 ring-2 ring-brand-400 dark:bg-brand-900/40' : ''
                )}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
                  style={{ backgroundColor: c.color + '22' }}
                >
                  {c.icon}
                </span>
                <span className="max-w-[64px] truncate text-[11px] font-medium text-ink-600 dark:text-ink-200">
                  {localizeCategoryName(c.name, lang)}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="date"
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5 text-sm text-ink-700 dark:border-ink-800 dark:bg-ink-800 dark:text-ink-100"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('tx.notePlaceholder')}
              className="flex-[2] rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5 text-sm text-ink-700 placeholder:text-ink-400 dark:border-ink-800 dark:bg-ink-800 dark:text-ink-100"
            />
          </div>

          <div className="mt-5">
            <NumericKeypad onKey={handleKey} />
          </div>

          {editing && (
            <button
              onClick={handleDelete}
              className="mt-4 w-full rounded-2xl bg-rose-50 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10"
            >
              {t('tx.delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
