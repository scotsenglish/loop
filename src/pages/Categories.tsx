import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { EMOJI_CHOICES, COLOR_CHOICES } from '@/lib/pickerOptions'
import type { TransactionType } from '@/types'

export default function Categories() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { categories, addCategory, updateCategory, deleteCategory } = useData()
  const { showToast } = useToast()
  const [tab, setTab] = useState<TransactionType>('expense')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(EMOJI_CHOICES[0])
  const [color, setColor] = useState(COLOR_CHOICES[0])

  const list = categories.filter((c) => c.type === tab || c.type === 'both')

  // Fire-and-forget — closing the create panel doesn't need to wait for the
  // server round-trip since the local list already updates from cache.
  function handleCreate() {
    if (!name.trim()) return
    addCategory({ name: name.trim(), icon, color, type: tab, order: list.length }).catch(() =>
      showToast(t('toast.actionFailed'))
    )
    setCreating(false)
    setName('')
  }

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 active:bg-ink-100 dark:active:bg-ink-800">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
          {t('categoriesPage.title')}
        </h1>
      </div>

      <div className="mt-4 flex rounded-full bg-white p-1 shadow-soft dark:bg-ink-900">
        {(
          [
            ['expense', t('categoriesPage.expense')],
            ['income', t('categoriesPage.income')],
          ] as [TransactionType, string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={clsx(
              'flex-1 rounded-full py-2 text-sm font-semibold transition',
              tab === v ? 'bg-brand-500 text-white' : 'text-ink-500'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="card-surface mt-4 divide-y divide-ink-100 rounded-2xl p-2 shadow-soft dark:divide-ink-800">
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-2 py-2.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg leading-none"
              style={{ backgroundColor: c.color + '22' }}
            >
              {c.icon}
            </span>
            <input
              defaultValue={c.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== c.name) {
                  updateCategory(c.id, { name: e.target.value.trim() }).catch(() =>
                    showToast(t('toast.actionFailed'))
                  )
                }
              }}
              className="flex-1 bg-transparent text-sm font-semibold text-ink-800 outline-none dark:text-white"
            />
            {c.isCustom && (
              <button
                onClick={() => deleteCategory(c.id).catch(() => showToast(t('toast.actionFailed')))}
                className="rounded-lg p-1.5 text-ink-300 active:bg-rose-50 active:text-rose-500 dark:active:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {creating ? (
        <div className="card-surface mt-4 rounded-2xl p-4 shadow-soft">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('categoriesPage.namePlaceholder')}
            className="w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-800"
          />
          <p className="mb-1.5 mt-3 text-xs font-medium text-ink-400">{t('categoriesPage.icon')}</p>
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
          <p className="mb-1.5 mt-3 text-xs font-medium text-ink-400">{t('categoriesPage.color')}</p>
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
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setCreating(false)}
              className="flex-1 rounded-xl bg-ink-100 py-2.5 text-sm font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-200"
            >
              {t('categoriesPage.cancel')}
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white"
            >
              {t('categoriesPage.addCategory')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-3 text-sm font-semibold text-ink-400 dark:border-ink-700"
        >
          <Plus className="h-4 w-4" /> {t('categoriesPage.addNew')}
        </button>
      )}
    </div>
  )
}
