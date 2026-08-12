import { useState } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { EMOJI_CHOICES, COLOR_CHOICES } from '@/lib/pickerOptions'
import { parseAmountInput } from '@/lib/format'

interface Props {
  open: boolean
  onClose: () => void
}

export function GoalFormSheet({ open, onClose }: Props) {
  const { t } = useLanguage()
  const { addGoal } = useData()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [targetStr, setTargetStr] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState(EMOJI_CHOICES[0])
  const [color, setColor] = useState(COLOR_CHOICES[0])

  function reset() {
    setName('')
    setTargetStr('')
    setTargetDate('')
    setIcon(EMOJI_CHOICES[0])
    setColor(COLOR_CHOICES[0])
  }

  function handleClose() {
    reset()
    onClose()
  }

  // Fire-and-forget: closing the sheet doesn't need to wait for the server
  // round-trip since the goal list updates from the local cache right away.
  function handleCreate() {
    const targetAmount = parseAmountInput(targetStr)
    if (!name.trim() || targetAmount <= 0) return
    addGoal({
      name: name.trim(),
      icon,
      color,
      targetAmount,
      targetDate: targetDate || null,
    }).catch(() => showToast(t('toast.actionFailed')))
    reset()
    onClose()
  }

  if (!open) return null

  const canCreate = name.trim().length > 0 && parseAmountInput(targetStr) > 0

  return (
    <div className="animate-fade-in fixed inset-0 z-40 flex items-end justify-center bg-ink-950/50 backdrop-blur-sm">
      <div className="animate-rise-in flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white safe-bottom dark:bg-ink-900">
        <div className="flex items-center justify-between px-5 pt-4">
          <button onClick={handleClose} className="rounded-full p-2 text-ink-400 active:bg-ink-100 dark:active:bg-ink-800">
            <X className="h-5 w-5" />
          </button>
          <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">{t('goalsPage.addNew')}</h2>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
              canCreate ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-300 dark:bg-ink-800'
            )}
          >
            {t('goalsPage.create')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('goalsPage.namePlaceholder')}
            className="mt-4 w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-800"
          />

          <p className="mb-1.5 mt-4 text-xs font-medium text-ink-400">{t('goalsPage.targetAmount')}</p>
          <input
            inputMode="numeric"
            value={targetStr}
            onChange={(e) => setTargetStr(parseAmountInput(e.target.value).toString())}
            placeholder="0"
            className="w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-800"
          />

          <p className="mb-1.5 mt-4 text-xs font-medium text-ink-400">{t('goalsPage.targetDateOptional')}</p>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
          />

          <p className="mb-1.5 mt-4 text-xs font-medium text-ink-400">{t('categoriesPage.icon')}</p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                className={clsx(
                  'flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-lg leading-none',
                  icon === e ? 'ring-2 ring-brand-400' : 'bg-ink-50 dark:bg-ink-800'
                )}
              >
                {e}
              </button>
            ))}
          </div>

          <p className="mb-1.5 mt-4 text-xs font-medium text-ink-400">{t('categoriesPage.color')}</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={clsx(
                  'h-7 w-7 rounded-full',
                  color === c && 'ring-2 ring-offset-2 ring-ink-400 dark:ring-offset-ink-900'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
