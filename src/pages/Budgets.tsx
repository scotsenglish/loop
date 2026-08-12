import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { BudgetProgressBar } from '@/components/BudgetProgressBar'
import { CategoryFormSheet } from '@/components/CategoryFormSheet'
import { formatNumber, parseAmountInput } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import { monthKey, monthTransactions } from '@/lib/stats'
import type { Category } from '@/types'

export default function Budgets() {
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const { categories, budgets, transactions, setBudget, removeBudget } = useData()
  const { showToast } = useToast()
  const [month, setMonth] = useState(monthKey(new Date()))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [categorySheet, setCategorySheet] = useState<'new' | Category | null>(null)

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both')
  const monthTx = useMemo(() => monthTransactions(transactions, month), [transactions, month])
  const monthBudgets = budgets.filter((b) => b.month === month)

  function spentFor(categoryId: string) {
    return monthTx
      .filter((t) => t.type === 'expense' && t.categoryId === categoryId)
      .reduce((s, t) => s + t.amount, 0)
  }

  function startEdit(categoryId: string, current?: number) {
    setEditingId(categoryId)
    setDraft(current ? String(current) : '')
  }

  // Fire-and-forget: the local Firestore cache updates (and this screen
  // re-renders) as soon as the write is queued, so waiting for the promise
  // to resolve before leaving edit mode would only add perceived delay.
  function saveEdit(categoryId: string) {
    const amount = parseAmountInput(draft)
    const existing = monthBudgets.find((b) => b.categoryId === categoryId)
    if (amount <= 0) {
      if (existing) removeBudget(existing.id).catch(() => showToast(t('toast.actionFailed')))
    } else {
      setBudget(categoryId, month, amount).catch(() => showToast(t('toast.actionFailed')))
    }
    setEditingId(null)
  }

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-full p-1.5 active:bg-ink-100 dark:active:bg-ink-800">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
            {t('budgetsPage.title')}
          </h1>
        </div>
        <button
          onClick={() => setCategorySheet('new')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white"
          aria-label={t('categoriesPage.addNew')}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <MonthSwitcher month={month} onChange={setMonth} />
      </div>

      <div className="card-surface mt-4 divide-y divide-ink-100 rounded-2xl p-2 shadow-soft dark:divide-ink-800">
        {expenseCategories.map((c) => {
          const budget = monthBudgets.find((b) => b.categoryId === c.id)
          const spent = spentFor(c.id)
          const isEditing = editingId === c.id

          return (
            <div key={c.id} className="px-2 py-2.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCategorySheet(c)}
                  aria-label={t('categoriesPage.editCategory')}
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg leading-none active:opacity-70"
                  style={{ backgroundColor: c.color + '22' }}
                >
                  {c.icon}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-800 dark:text-white">
                    {localizeCategoryName(c.name, lang)}
                  </p>
                  {!budget && !isEditing && (
                    <p className="text-xs text-ink-400">{t('budgetsPage.notSet')}</p>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      inputMode="numeric"
                      value={draft}
                      onChange={(e) => setDraft(parseAmountInput(e.target.value).toString())}
                      className="w-24 rounded-lg border border-ink-200 bg-ink-50 px-2 py-1 text-right text-sm dark:border-ink-700 dark:bg-ink-800"
                      placeholder="0"
                    />
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      {t('budgetsPage.save')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(c.id, budget?.amount)}
                    className="text-xs font-semibold text-brand-500"
                  >
                    {budget ? `${formatNumber(budget.amount)}₫` : t('budgetsPage.set')}
                  </button>
                )}
              </div>
              {budget && !isEditing && (
                <div className="mt-1">
                  <BudgetProgressBar category={c} spent={spent} budget={budget.amount} month={month} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CategoryFormSheet
        open={categorySheet !== null}
        onClose={() => setCategorySheet(null)}
        category={categorySheet === 'new' ? null : categorySheet}
      />
    </div>
  )
}
