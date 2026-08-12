import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { useData } from '@/context/DataContext'
import { MonthSwitcher } from '@/components/MonthSwitcher'
import { TransactionRow } from '@/components/TransactionRow'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'
import { formatVND } from '@/lib/format'
import { groupByDay, monthKey, monthTransactions, sumByType } from '@/lib/stats'
import type { Transaction } from '@/types'

type Filter = 'all' | 'expense' | 'income'

export default function Transactions() {
  const { transactions, categories } = useData()
  const [month, setMonth] = useState(monthKey(new Date()))
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Transaction | null>(null)

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

  return (
    <div className="px-4 pt-6">
      <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">Giao dịch</h1>

      <div className="mt-4">
        <MonthSwitcher month={month} onChange={setMonth} />
      </div>

      <div className="mt-3 flex gap-2 text-sm">
        <div className="flex-1 rounded-xl bg-rose-50 px-3 py-2 dark:bg-rose-500/10">
          <p className="text-[11px] text-rose-500">Chi</p>
          <p className="font-bold text-rose-600">{formatVND(totalExpense)}</p>
        </div>
        <div className="flex-1 rounded-xl bg-mint-50 px-3 py-2 dark:bg-mint-500/10">
          <p className="text-[11px] text-mint-600">Thu</p>
          <p className="font-bold text-mint-700 dark:text-mint-400">{formatVND(totalIncome)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 dark:border-ink-800 dark:bg-ink-900">
        <Search className="h-4 w-4 text-ink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo danh mục hoặc ghi chú"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
        />
      </div>

      <div className="mt-3 flex gap-2">
        {(
          [
            ['all', 'Tất cả'],
            ['expense', 'Chi tiêu'],
            ['income', 'Thu nhập'],
          ] as [Filter, string][]
        ).map(([value, label]) => (
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

      <div className="mt-4 space-y-4 pb-6">
        {grouped.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">Không có giao dịch nào phù hợp</p>
        )}
        {grouped.map((g) => (
          <div key={g.date}>
            <p className="mb-1 px-1 text-xs font-semibold text-ink-400">
              {new Date(`${g.date}T00:00:00`).toLocaleDateString('vi-VN', {
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
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddTransactionSheet open={!!editing} onClose={() => setEditing(null)} editing={editing} />
    </div>
  )
}
