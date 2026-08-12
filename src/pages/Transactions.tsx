import { useMemo, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { TransactionRow } from '@/components/TransactionRow'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'
import { formatVND } from '@/lib/format'
import { groupByDay, monthKey, monthTransactions, sumByType } from '@/lib/stats'
import type { Transaction } from '@/types'

type Filter = 'all' | 'expense' | 'income'

export default function Transactions() {
  const { transactions, categories, softDeleteTransactions, undoSoftDelete } = useData()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [month, setMonth] = useState(monthKey(new Date()))
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const monthTx = useMemo(() => monthTransactions(transactions, month), [transactions, month])

  const filtered = useMemo(() => {
    return monthTx.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false
      if (search.trim()) {
        const cat = categories.find((c) => c.id === t.categoryId)
        const haystack = `${cat?.name ?? ''} ${t.note}`.toLowerCase()
        if (!haystack.includes(search.trim().toLowerCase())) return false
      }
      return true
    })
  }, [monthTx, filter, search, categories])

  const grouped = useMemo(() => groupByDay(filtered), [filtered])
  const totalExpense = sumByType(filtered, 'expense')
  const totalIncome = sumByType(filtered, 'income')

  const filters: [Filter, string][] = [
    ['all', t('txPage.filterAll')],
    ['expense', t('txPage.filterExpense')],
    ['income', t('txPage.filterIncome')],
  ]

  function toggleSelectMode() {
    setSelectMode((v) => !v)
    setSelectedIds(new Set())
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleBulkDelete() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    const batchId = softDeleteTransactions(ids)
    showToast(ids.length === 1 ? t('toast.deletedOne') : t('toast.deletedMany', ids.length), {
      action: { label: t('toast.undo'), onClick: () => undoSoftDelete(batchId) },
    })
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
          {selectMode ? t('txPage.selectedCount', selectedIds.size) : t('txPage.title')}
        </h1>
        <button onClick={toggleSelectMode} className="text-sm font-semibold text-brand-500">
          {selectMode ? t('txPage.doneSelect') : t('txPage.select')}
        </button>
      </div>

      <div className="mt-4">
        <MonthSwitcher month={month} onChange={setMonth} />
      </div>

      <div className="mt-3 flex gap-2 text-sm">
        <div className="flex-1 rounded-xl bg-rose-50 px-3 py-2 dark:bg-rose-500/10">
          <p className="text-[11px] text-rose-500">{t('txPage.expenseShort')}</p>
          <p className="font-bold text-rose-600">{formatVND(totalExpense)}</p>
        </div>
        <div className="flex-1 rounded-xl bg-mint-50 px-3 py-2 dark:bg-mint-500/10">
          <p className="text-[11px] text-mint-600">{t('txPage.incomeShort')}</p>
          <p className="font-bold text-mint-700 dark:text-mint-400">{formatVND(totalIncome)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 dark:border-ink-800 dark:bg-ink-900">
        <Search className="h-4 w-4 text-ink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('txPage.searchPlaceholder')}
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
        />
      </div>

      <div className="mt-3 flex gap-2">
        {filters.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
              filter === value
                ? 'bg-brand-500 text-white'
                : 'bg-white text-ink-500 dark:bg-ink-900 dark:text-ink-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4 pb-24">
        {grouped.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">{t('txPage.noneMatch')}</p>
        )}
        {grouped.map((g) => (
          <div key={g.date}>
            <p className="mb-1 px-1 text-xs font-semibold text-ink-400">
              {new Date(`${g.date}T00:00:00`).toLocaleDateString(t('locale.code'), {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
              })}
            </p>
            <div className="card-surface rounded-2xl p-2 shadow-soft">
              {g.items.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  category={categories.find((c) => c.id === tx.categoryId)}
                  onClick={() => setEditing(tx)}
                  selectable={selectMode}
                  selected={selectedIds.has(tx.id)}
                  onToggleSelect={() => toggleSelect(tx.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectMode && selectedIds.size > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 safe-x">
          <div className="animate-rise-in pointer-events-auto flex w-full max-w-lg items-center justify-between rounded-2xl bg-ink-900 px-4 py-3 text-white shadow-card dark:bg-ink-800">
            <span className="text-sm font-semibold">{t('txPage.selectedCount', selectedIds.size)}</span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-1.5 text-xs font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t('txPage.deleteSelected')}
            </button>
          </div>
        </div>
      )}

      <AddTransactionSheet open={!!editing} onClose={() => setEditing(null)} editing={editing} />
    </div>
  )
}
