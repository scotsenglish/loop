import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { X, Check, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { NumericKeypad } from '@/components/NumericKeypad'
import { GoalProgressBar } from '@/components/GoalProgressBar'
import { formatNumber, formatVND } from '@/lib/format'
import type { SavingsGoal } from '@/types'

const MAX_AMOUNT_DIGITS = 12

interface Props {
  goal: SavingsGoal | null
  onClose: () => void
}

export function GoalDetailSheet({ goal, onClose }: Props) {
  const { t } = useLanguage()
  const { contributeToGoal, deleteGoal } = useData()
  const { showToast } = useToast()
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [amountStr, setAmountStr] = useState('0')

  useEffect(() => {
    if (goal) {
      setMode('deposit')
      setAmountStr('0')
    }
  }, [goal])

  if (!goal) return null

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

  // Fire-and-forget: the goal's progress bar updates from the local cache as
  // soon as the write is queued, so the sheet can close immediately instead
  // of waiting on the server round-trip.
  function handleConfirm() {
    const amount = parseInt(amountStr, 10) || 0
    if (amount <= 0 || !goal) return
    const signed = mode === 'deposit' ? amount : -amount
    contributeToGoal(goal.id, signed, format(new Date(), 'yyyy-MM-dd')).catch(() =>
      showToast(t('toast.actionFailed'))
    )
    showToast(
      mode === 'deposit' ? t('goalsPage.deposited', formatVND(amount)) : t('goalsPage.withdrawn', formatVND(amount))
    )
    onClose()
  }

  function handleDelete() {
    if (!goal) return
    deleteGoal(goal.id).catch(() => showToast(t('toast.actionFailed')))
    onClose()
  }

  const recent = [...goal.contributions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
  const canConfirm = (parseInt(amountStr, 10) || 0) > 0

  // Portal straight onto <body> — see AddTransactionSheet.tsx for why:
  // sheets opened from inside a page get trapped under the bottom nav bar
  // by the page wrapper's animation-induced stacking context otherwise.
  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-40 flex items-end justify-center bg-ink-950/50 backdrop-blur-sm">
      <div className="animate-rise-in flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white safe-bottom dark:bg-ink-900">
        <div className="flex items-center justify-between px-5 pt-4">
          <button onClick={onClose} className="rounded-full p-2 text-ink-400 active:bg-ink-100 dark:active:bg-ink-800">
            <X className="h-5 w-5" />
          </button>
          <div className="flex rounded-full bg-ink-50 p-1 text-sm font-semibold dark:bg-ink-800">
            <button
              onClick={() => setMode('deposit')}
              className={clsx(
                'rounded-full px-4 py-1.5 transition',
                mode === 'deposit' ? 'bg-mint-500 text-white' : 'text-ink-500'
              )}
            >
              {t('goalsPage.deposit')}
            </button>
            <button
              onClick={() => setMode('withdraw')}
              className={clsx(
                'rounded-full px-4 py-1.5 transition',
                mode === 'withdraw' ? 'bg-rose-500 text-white' : 'text-ink-500'
              )}
            >
              {t('goalsPage.withdraw')}
            </button>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={clsx(
              'rounded-full p-2 transition',
              canConfirm ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-300 dark:bg-ink-800'
            )}
          >
            <Check className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
          <div className="mt-3">
            <GoalProgressBar goal={goal} />
          </div>

          <div className="mt-4 text-center">
            <span className="font-display text-4xl font-extrabold tabular-nums">
              {formatNumber(parseInt(amountStr, 10) || 0)}
            </span>
            <span className="ml-1 text-lg font-semibold text-ink-400">₫</span>
          </div>

          <div className="mt-5">
            <NumericKeypad onKey={handleKey} />
          </div>

          {recent.length > 0 && (
            <div className="mt-5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                {t('goalsPage.recentActivity')}
              </p>
              <div className="card-surface divide-y divide-ink-100 rounded-2xl px-3 dark:divide-ink-800">
                {recent.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink-500 dark:text-ink-300">{c.date}</span>
                    <span
                      className={clsx(
                        'font-semibold tabular-nums',
                        c.amount >= 0 ? 'text-mint-600' : 'text-rose-500'
                      )}
                    >
                      {c.amount >= 0 ? '+' : ''}
                      {formatVND(c.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleDelete}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" /> {t('goalsPage.delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
