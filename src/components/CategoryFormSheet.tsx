import { useEffect, useState } from 'react'
import { X, Check, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { EMOJI_CHOICES, COLOR_CHOICES } from '@/lib/pickerOptions'
import type { Category, TransactionType } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  /** Pass an existing category to edit it; omit/null to create a new one. */
  category?: Category | null
  /** Type assigned to newly created categories (ignored when editing). */
  defaultType?: TransactionType
}

export function CategoryFormSheet({ open, onClose, category, defaultType = 'expense' }: Props) {
  const { t } = useLanguage()
  const { categories, addCategory, updateCategory, deleteCategory } = useData()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(EMOJI_CHOICES[0])
  const [color, setColor] = useState(COLOR_CHOICES[0])
  const isEdit = !!category

  useEffect(() => {
    if (!open) return
    if (category) {
      setName(category.name)
      setIcon(category.icon)
      setColor(category.color)
    } else {
      setName('')
      setIcon(EMOJI_CHOICES[0])
      setColor(COLOR_CHOICES[0])
    }
  }, [open, category])

  if (!open) return null

  const canSave = name.trim().length > 0

  // Firestore writes here are fire-and-forget on purpose: the local cache
  // (and this app's onSnapshot listeners) reflect the change immediately, so
  // waiting for the server round-trip before closing the sheet would only
  // add perceived lag. Failures still surface via a toast.
  function handleSave() {
    if (!canSave) return
    if (isEdit && category) {
      updateCategory(category.id, { name: name.trim(), icon, color }).catch(() =>
        showToast(t('toast.actionFailed'))
      )
    } else {
      const order = categories.filter((c) => c.type === defaultType || c.type === 'both').length
      addCategory({ name: name.trim(), icon, color, type: defaultType, order }).catch(() =>
        showToast(t('toast.actionFailed'))
      )
    }
    onClose()
  }

  function handleDelete() {
    if (!category) return
    deleteCategory(category.id).catch(() => showToast(t('toast.actionFailed')))
    onClose()
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-40 flex items-end justify-center bg-ink-950/50 backdrop-blur-sm">
      <div className="animate-rise-in flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white safe-bottom dark:bg-ink-900">
        <div className="flex items-center justify-between px-5 pt-4">
          <button onClick={onClose} className="rounded-full p-2 text-ink-400 active:bg-ink-100 dark:active:bg-ink-800">
            <X className="h-5 w-5" />
          </button>
          <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">
            {isEdit ? t('categoriesPage.editCategory') : t('categoriesPage.addNew')}
          </h2>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={clsx(
              'rounded-full p-2 transition',
              canSave ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-300 dark:bg-ink-800'
            )}
          >
            <Check className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('categoriesPage.namePlaceholder')}
            className="mt-4 w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-800"
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

          {isEdit && category?.isCustom && (
            <button
              onClick={handleDelete}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" /> {t('categoriesPage.delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
