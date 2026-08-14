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
import type { Budget, Category } from '@/types'

/** Custom-range budgets reuse the same `budgets` collection/CRUD as
 *  calendar-month budgets — the "month" field is just an opaque grouping
 *  key, so a date range can be encoded into it too. Prefixing with
 *  "range:" keeps it visually and structurally distinct from a real
 *  "yyyy-MM" month key (which is always 7 characters), so there's no
 *  chance of collision. */
function rangeKeyFor(start: string, end: string): string {
  return `range:${start}_${end}`
}

export default function Budgets() {
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const { categories, budgets, transactions, setBudget, removeBudget } = useData()
  const { showToast } = useToast()
  const [month, setMonth] = useState(monthKey(new Date()))
  const [range, setRange] = useState({ start: '', end: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPeriod, setEditingPeriod] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [categorySheet, setCategorySheet] = useState<'new' | Category | null>(null)

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both')

  const monthTx = useMemo(() => monthTransactions(transactions, month), [transactions, month])
  const monthBudgets = budgets.filter((b) => b.month === month)

  const rangeComplete = range.start !== '' && range.end !== ''
  const rangeValid = rangeComplete && range.end >= range.start
  const rangeKey = rangeValid ? rangeKeyFor(range.start, range.end) : null
  const rangeTx = useMemo(
    () => (rangeValid ? transactions.filter((t) => t.date >= range.start && t.date <= range.end) : []),
    [transactions, rangeValid, range.start, range.end]
  )
  const rangeBudgets = rangeKey ? budgets.filter((b) => b.month === rangeKey) : []

  function spentIn(list: typeof transactions, categoryId: string) {
    return list
      .filter((t) => t.type === 'expense' && t.categoryId === categoryId)
      .reduce((s, t) => s + t.amount, 0)
  }

  function startEdit(categoryId: string, period: string, current?: number) {
    setEditingId(categoryId)
    setEditingPeriod(period)
    setDraft(current ? String(current) : '')
  }

  // Fire-and-forget: the local Firestore cache updates (and this screen
  // re-renders) as soon as the write is queued, so waiting for the promise
  // to resolve before leaving edit mode would only add perceived delay.
  function saveEdit(categoryId: string, period: string, periodBudgets: Budget[]) {
    const amount = parseAmountInput(draft)
    const existing = periodBudgets.find((b) => b.categoryId === categoryId)
    if (amount <= 0) {
      if (existing) removeBudget(existing.id).catch(() => showToast(t('toast.actionFailed')))
    } else {
      setBudget(categoryId, period, amount).catch(() => showToast(t('toast.actionFailed')))
    }
    setEditingId(null)
    setEditingPeriod(null)
  }

  function renderRow(c: Category, period: string, periodBudgets: Budget[], spent: number, pacingMonth?: string) {
    const budget = periodBudgets.find((b) => b.categoryId === c.id)
    const isEditing = editingId === c.id && editingPeriod === period

    return (
      <div key={`${period}:${c.id}`} className="px-2 py-2.5">
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
            {!budget && !isEditing && <p className="text-xs text-ink-400">{t('budgetsPage.notSet')}</p>}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                inputMode="numeric"
                value={draft ? formatNumber(parseInt(draft, 10)) : ''}
                onChange={(e) => setDraft(parseAmountInput(e.target.value).toString())}
                className="w-24 rounded-lg border border-ink-200 bg-ink-50 px-2 py-1 text-right text-sm dark:border-ink-700 dark:bg-ink-800"
                placeholder="0"
              />
              <button
                onClick={() => saveEdit(c.id, period, periodBudgets)}
                className="rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white"
              >
                {t('budgetsPage.save')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit(c.id, period, budget?.amount)}
              className="text-xs font-semibold text-brand-500"
            >
              {budget ? `${formatNumber(budget.amount)}₫` : t('budgetsPage.set')}
            </button>
          )}
        </div>
        {budget && !isEditing && (
          <div className="mt-1">
            <BudgetProgressBar category={c} spent={spent} budget={budget.amount} month={pacingMonth} />
          </div>
        )}
      </div>
    )
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

      <p className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {t('budgetsPage.byMonth')}
      </p>
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="card-surface mt-3 divide-y divide-ink-100 rounded-2xl p-2 shadow-soft dark:divide-ink-800">
        {expenseCategories.map((c) => renderRow(c, month, monthBudgets, spentIn(monthTx, c.id), month))}
      </div>

      <p className="mb-1.5 mt-6 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {t('budgetsPage.customRange')}
      </p>
      <div className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-soft dark:bg-ink-900">
        <input
          type="date"
          value={range.start}
          onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
          aria-label={t('budgetsPage.fromDate')}
          className="min-w-0 flex-1 rounded-xl border border-ink-100 bg-ink-50 px-2 py-2 text-sm text-ink-700 dark:border-ink-800 dark:bg-ink-800 dark:text-ink-100"
        />
        <span className="shrink-0 text-ink-300">–</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
          aria-label={t('budgetsPage.toDate')}
          className="min-w-0 flex-1 rounded-xl border border-ink-100 bg-ink-50 px-2 py-2 text-sm text-ink-700 dark:border-ink-800 dark:bg-ink-800 dark:text-ink-100"
        />
      </div>

      {!rangeComplete ? (
        <p className="mt-2 px-1 text-xs text-ink-400">{t('budgetsPage.pickRange')}</p>
      ) : !rangeValid ? (
        <p className="mt-2 px-1 text-xs font-medium text-rose-500">{t('budgetsPage.invalidRange')}</p>
      ) : (
        <div className="card-surface mt-3 divide-y divide-ink-100 rounded-2xl p-2 shadow-soft dark:divide-ink-800">
          {expenseCategories.map((c) => renderRow(c, rangeKey!, rangeBudgets, spentIn(rangeTx, c.id)))}
        </div>
      )}

      <CategoryFormSheet
        open={categorySheet !== null}
        onClose={() => setCategorySheet(null)}
        category={categorySheet === 'new' ? null : categorySheet}
      />
    </div>
  )
}
