import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Wallet, TrendingDown, TrendingUp, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { useReminder } from '@/hooks/useReminder'
import { useScrollY } from '@/hooks/useScrollY'
import { StatCard } from '@/components/StatCard'
import { ReminderBanner } from '@/components/ReminderBanner'
import { CategoryDonut } from '@/components/CategoryDonut'
import { TrendChart } from '@/components/TrendChart'
import { TransactionRow } from '@/components/TransactionRow'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { EmptyState } from '@/components/EmptyState'
import { PullToRefresh } from '@/components/PullToRefresh'
import { GoalProgressBar } from '@/components/GoalProgressBar'
import { formatVND } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import { goalProgress, isGoalComplete } from '@/lib/goals'
import { categoryBreakdown, dailyTrend, monthKey, monthTransactions, previousMonthKey, sumByType } from '@/lib/stats'
import type { Transaction } from '@/types'

const COLLAPSE_RANGE = 60

export default function Home() {
  const { user } = useAuth()
  const { transactions, categories, settings, goals } = useData()
  const { t, lang } = useLanguage()
  const { showBanner } = useReminder(settings)
  const scrollY = useScrollY()
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const currentMonth = monthKey(new Date())
  const prevMonth = previousMonthKey(currentMonth)

  const thisMonthTx = useMemo(() => monthTransactions(transactions, currentMonth), [transactions, currentMonth])
  const prevMonthTx = useMemo(() => monthTransactions(transactions, prevMonth), [transactions, prevMonth])

  const totalExpense = sumByType(thisMonthTx, 'expense')
  const totalIncome = sumByType(thisMonthTx, 'income')
  const balance = totalIncome - totalExpense
  const prevExpense = sumByType(prevMonthTx, 'expense')
  const expenseDelta = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0

  const breakdown = useMemo(() => categoryBreakdown(thisMonthTx, categories, 'expense'), [thisMonthTx, categories])
  const trend = useMemo(() => dailyTrend(transactions, 14), [transactions])
  const recent = transactions.slice(0, 6)

  const firstName = user?.displayName?.split(' ').slice(-1)[0] ?? ''
  const collapseProgress = Math.min(1, scrollY / COLLAPSE_RANGE)

  const nearestGoal = useMemo(() => {
    const active = goals.filter((g) => !isGoalComplete(g))
    if (active.length === 0) return null
    return [...active].sort((a, b) => goalProgress(b) - goalProgress(a))[0]
  }, [goals])

  return (
    <>
      {/* Compact sticky title bar — fades in once the large greeting has
          scrolled mostly out of view, iOS-large-title style. */}
      <div
        className={clsx(
          'fixed inset-x-0 top-0 z-20 border-b bg-white/90 backdrop-blur-xl safe-top dark:bg-ink-950/90',
          collapseProgress > 0.5 ? 'border-ink-100 dark:border-ink-800' : 'border-transparent'
        )}
        style={{ opacity: collapseProgress, pointerEvents: collapseProgress > 0.5 ? 'auto' : 'none' }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-center py-3 safe-x">
          <span className="font-display text-sm font-bold text-ink-900 dark:text-white">Loop</span>
        </div>
      </div>

      <PullToRefresh>
        <div className="px-4 pt-6">
          <header
            className="flex items-center justify-between"
            style={{
              transform: `scale(${1 - collapseProgress * 0.06})`,
              opacity: 1 - collapseProgress * 0.25,
              transformOrigin: 'left center',
            }}
          >
            <div>
              <p className="text-sm text-ink-400">{t('home.greeting')}</p>
              <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
                {firstName || t('home.you')} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-soft dark:bg-ink-900">
              <Flame className={settings.streakCount > 0 ? 'h-4 w-4 text-amber-500' : 'h-4 w-4 text-ink-300'} />
              <span className="text-sm font-bold text-ink-800 dark:text-ink-50">{settings.streakCount}</span>
            </div>
          </header>

          {showBanner && (
            <div className="mt-4">
              <ReminderBanner streak={settings.streakCount} onAdd={() => setAddOpen(true)} />
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard
              label={t('home.expenseThisMonth')}
              value={<AnimatedNumber value={totalExpense} formatter={formatVND} />}
              tone="negative"
              icon={<TrendingDown className="h-4 w-4 text-rose-400" />}
              sub={
                prevExpense > 0
                  ? `${expenseDelta >= 0 ? '+' : ''}${expenseDelta.toFixed(0)}% ${t('home.vsLastMonthSuffix')}`
                  : undefined
              }
            />
            <StatCard
              label={t('home.incomeThisMonth')}
              value={<AnimatedNumber value={totalIncome} formatter={formatVND} />}
              tone="positive"
              icon={<TrendingUp className="h-4 w-4 text-mint-500" />}
            />
          </div>

          <div className="mt-3 card-surface flex items-center justify-between rounded-2xl p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-medium text-ink-500">{t('home.balanceThisMonth')}</span>
            </div>
            <span
              className={`font-display text-lg font-extrabold tabular-nums ${
                balance >= 0 ? 'text-mint-600' : 'text-rose-500'
              }`}
            >
              {balance >= 0 ? '+' : ''}
              <AnimatedNumber value={balance} formatter={formatVND} />
            </span>
          </div>

          {nearestGoal && (
            <Link to="/goals" className="card-surface mt-3 block rounded-2xl p-4 shadow-soft">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">
                  {t('goalsPage.title')}
                </h2>
                <span className="text-xs font-semibold text-brand-500">{t('home.viewAll')}</span>
              </div>
              <GoalProgressBar goal={nearestGoal} />
            </Link>
          )}

          <section className="card-surface mt-4 rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">{t('home.byCategory')}</h2>
              <Link to="/stats" className="text-xs font-semibold text-brand-500">
                {t('home.details')}
              </Link>
            </div>
            <div className="mt-2">
              <CategoryDonut items={breakdown} total={totalExpense} />
            </div>
            <div className="mt-1 space-y-2">
              {breakdown.slice(0, 4).map((b) => (
                <div key={b.categoryId} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.category?.color }} />
                  <span className="flex-1 truncate text-ink-600 dark:text-ink-300">
                    {b.category ? localizeCategoryName(b.category.name, lang) : t('common.other')}
                  </span>
                  <span className="font-semibold text-ink-800 dark:text-white">{b.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card-surface mt-4 rounded-2xl p-4 shadow-soft">
            <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">{t('home.trend14')}</h2>
            <TrendChart data={trend} />
          </section>

          <section className="mt-4 pb-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-sm font-bold text-ink-800 dark:text-white">{t('home.recentTx')}</h2>
              <Link to="/transactions" className="text-xs font-semibold text-brand-500">
                {t('home.viewAll')}
              </Link>
            </div>
            <div className="card-surface mt-2 rounded-2xl p-2 shadow-soft">
              {recent.length === 0 ? (
                <EmptyState
                  icon="🧾"
                  title={t('home.noTx')}
                  action={
                    <button
                      onClick={() => setAddOpen(true)}
                      className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t('home.addFirstTx')}
                    </button>
                  }
                />
              ) : (
                recent.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    category={categories.find((c) => c.id === tx.categoryId)}
                    onClick={() => setEditing(tx)}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </PullToRefresh>

      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <AddTransactionSheet open={!!editing} onClose={() => setEditing(null)} editing={editing} />
    </>
  )
}
