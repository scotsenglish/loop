import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { CategoryDonut } from '@/components/CategoryDonut'
import { YearlyBarChart } from '@/components/YearlyBarChart'
import { BudgetProgressBar } from '@/components/BudgetProgressBar'
import { formatVND } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import {
  categoryBreakdown,
  monthKey,
  monthlyTotalsForYear,
  monthTransactions,
  previousMonthKey,
  sumByType,
  yearTransactions,
} from '@/lib/stats'

type View = 'month' | 'year'

export default function Stats() {
  const { transactions, categories, budgets } = useData()
  const { t, lang } = useLanguage()
  const [view, setView] = useState<View>('month')
  const [month, setMonth] = useState(monthKey(new Date()))
  const [year, setYear] = useState(new Date().getFullYear())

  const monthTx = useMemo(() => monthTransactions(transactions, month), [transactions, month])
  const prevMonth = previousMonthKey(month)
  const prevTx = useMemo(() => monthTransactions(transactions, prevMonth), [transactions, prevMonth])
  const breakdown = useMemo(() => categoryBreakdown(monthTx, categories, 'expense'), [monthTx, categories])
  const totalExpense = sumByType(monthTx, 'expense')
  const totalIncome = sumByType(monthTx, 'income')
  const prevExpense = sumByType(prevTx, 'expense')
  const delta = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0

  const yearTx = useMemo(() => yearTransactions(transactions, String(year)), [transactions, year])
  const yearPoints = useMemo(
    () => monthlyTotalsForYear(transactions, String(year), lang),
    [transactions, year, lang]
  )
  const yearBreakdown = useMemo(() => categoryBreakdown(yearTx, categories, 'expense'), [yearTx, categories])
  const yearExpense = sumByType(yearTx, 'expense')
  const yearIncome = sumByType(yearTx, 'income')

  const monthBudgets = budgets.filter((b) => b.month === month)

  const views: [View, string][] = [
    ['month', t('statsPage.byMonth')],
    ['year', t('statsPage.byYear')],
  ]

  return (
    <div className="px-4 pt-6 pb-6">
      <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">{t('statsPage.title')}</h1>

      <div className="mt-4 flex rounded-full bg-white p-1 shadow-soft dark:bg-ink-900">
        {views.map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={clsx(
              'flex-1 rounded-full py-2 text-sm font-semibold transition',
              view === v ? 'bg-brand-500 text-white' : 'text-ink-500'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {view === 'month' ? (
        <>
          <div className="mt-4">
            <MonthSwitcher month={month} onChange={setMonth} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="card-surface rounded-2xl p-3 shadow-soft">
              <p className="text-[11px] text-ink-400">{t('statsPage.totalExpense')}</p>
              <p className="font-display text-lg font-extrabold text-rose-500">{formatVND(totalExpense)}</p>
              {prevExpense > 0 && (
                <p className="text-[11px] text-ink-400">
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(0)}% {t('statsPage.vsLastMonth')}
                </p>
              )}
            </div>
            <div className="card-surface rounded-2xl p-3 shadow-soft">
              <p className="text-[11px] text-ink-400">{t('statsPage.totalIncome')}</p>
              <p className="font-display text-lg font-extrabold text-mint-600">{formatVND(totalIncome)}</p>
            </div>
          </div>

          <section className="card-surface mt-4 rounded-2xl p-4 shadow-soft">
            <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">
              {t('statsPage.breakdown')}
            </h2>
            <CategoryDonut items={breakdown} total={totalExpense} />
            <div className="mt-2 space-y-3">
              {breakdown.map((b) => (
                <div key={b.categoryId}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-ink-600 dark:text-ink-300">
                      <span>{b.category?.icon}</span>
                      {b.category ? localizeCategoryName(b.category.name, lang) : ''}
                    </span>
                    <span className="font-semibold text-ink-800 dark:text-white">
                      {formatVND(b.total)} · {b.percent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${b.percent}%`, backgroundColor: b.category?.color }}
                    />
                  </div>
                </div>
              ))}
              {breakdown.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-400">{t('statsPage.noExpenseThisMonth')}</p>
              )}
            </div>
          </section>

          {monthBudgets.length > 0 && (
            <section className="card-surface mt-4 rounded-2xl p-4 shadow-soft">
              <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">
                {t('statsPage.budgetsThisMonth')}
              </h2>
              <div className="mt-1 divide-y divide-ink-100 dark:divide-ink-800">
                {monthBudgets.map((b) => {
                  const spent = monthTx
                    .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
                    .reduce((s, t) => s + t.amount, 0)
                  return (
                    <BudgetProgressBar
                      key={b.id}
                      category={categories.find((c) => c.id === b.categoryId)}
                      spent={spent}
                      budget={b.amount}
                      month={month}
                    />
                  )
                })}
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-2 shadow-soft dark:bg-ink-900">
            <button onClick={() => setYear((y) => y - 1)} className="text-sm font-semibold text-ink-500">
              ← {year - 1}
            </button>
            <span className="font-display text-base font-extrabold text-ink-900 dark:text-white">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= new Date().getFullYear()}
              className="text-sm font-semibold text-ink-500 disabled:opacity-30"
            >
              {year + 1} →
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="card-surface rounded-2xl p-3 shadow-soft">
              <p className="text-[11px] text-ink-400">{t('statsPage.totalExpenseYear')}</p>
              <p className="font-display text-lg font-extrabold text-rose-500">{formatVND(yearExpense)}</p>
            </div>
            <div className="card-surface rounded-2xl p-3 shadow-soft">
              <p className="text-[11px] text-ink-400">{t('statsPage.totalIncomeYear')}</p>
              <p className="font-display text-lg font-extrabold text-mint-600">{formatVND(yearIncome)}</p>
            </div>
          </div>

          <section className="card-surface mt-4 rounded-2xl p-4 shadow-soft">
            <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">
              {t('statsPage.monthlyChart')}
            </h2>
            <YearlyBarChart data={yearPoints} />
          </section>

          <section className="card-surface mt-4 rounded-2xl p-4 shadow-soft">
            <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">
              {t('statsPage.topCategoriesYear')}
            </h2>
            <div className="mt-2 space-y-3">
              {yearBreakdown.slice(0, 8).map((b) => (
                <div key={b.categoryId} className="flex items-center gap-2 text-sm">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: (b.category?.color ?? '#999') + '22' }}
                  >
                    {b.category?.icon}
                  </span>
                  <span className="flex-1 truncate text-ink-600 dark:text-ink-300">
                    {b.category ? localizeCategoryName(b.category.name, lang) : ''}
                  </span>
                  <span className="font-semibold text-ink-800 dark:text-white">{formatVND(b.total)}</span>
                </div>
              ))}
              {yearBreakdown.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-400">{t('statsPage.noDataYear', year)}</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
