import { eachDayOfInterval, endOfMonth, format, startOfMonth, subDays } from 'date-fns'
import type { Category, Transaction } from '@/types'

export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function isInMonth(tx: Transaction, month: string): boolean {
  return tx.date.startsWith(month)
}

export function sumByType(transactions: Transaction[], type: 'expense' | 'income'): number {
  return transactions.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)
}

export interface CategoryBreakdownItem {
  categoryId: string
  category: Category | undefined
  total: number
  count: number
  percent: number
}

export function categoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: 'expense' | 'income' = 'expense'
): CategoryBreakdownItem[] {
  const filtered = transactions.filter((t) => t.type === type)
  const total = filtered.reduce((s, t) => s + t.amount, 0)
  const map = new Map<string, { total: number; count: number }>()
  for (const t of filtered) {
    const cur = map.get(t.categoryId) ?? { total: 0, count: 0 }
    cur.total += t.amount
    cur.count += 1
    map.set(t.categoryId, cur)
  }
  const items: CategoryBreakdownItem[] = Array.from(map.entries()).map(([categoryId, v]) => ({
    categoryId,
    category: categories.find((c) => c.id === categoryId),
    total: v.total,
    count: v.count,
    percent: total > 0 ? (v.total / total) * 100 : 0,
  }))
  return items.sort((a, b) => b.total - a.total)
}

export interface DayPoint {
  date: string
  label: string
  expense: number
  income: number
}

export function dailyTrend(transactions: Transaction[], days: number): DayPoint[] {
  const end = new Date()
  const start = subDays(end, days - 1)
  const interval = eachDayOfInterval({ start, end })
  const byDay = new Map<string, { expense: number; income: number }>()
  for (const d of interval) {
    byDay.set(format(d, 'yyyy-MM-dd'), { expense: 0, income: 0 })
  }
  for (const t of transactions) {
    const bucket = byDay.get(t.date)
    if (!bucket) continue
    if (t.type === 'expense') bucket.expense += t.amount
    else bucket.income += t.amount
  }
  return interval.map((d) => {
    const key = format(d, 'yyyy-MM-dd')
    const v = byDay.get(key)!
    return { date: key, label: format(d, 'd/M'), expense: v.expense, income: v.income }
  })
}

export function monthTransactions(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month))
}

export function monthRange(month: string): { start: Date; end: Date } {
  const d = new Date(`${month}-01T00:00:00`)
  return { start: startOfMonth(d), end: endOfMonth(d) }
}

export function previousMonthKey(month: string): string {
  const d = new Date(`${month}-01T00:00:00`)
  d.setMonth(d.getMonth() - 1)
  return format(d, 'yyyy-MM')
}

export function yearTransactions(transactions: Transaction[], year: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(year))
}

export interface MonthPoint {
  month: string
  label: string
  expense: number
  income: number
}

export function monthlyTotalsForYear(
  transactions: Transaction[],
  year: string,
  lang: 'vi' | 'en' = 'vi'
): MonthPoint[] {
  const points: MonthPoint[] = []
  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0')
    const key = `${year}-${mm}`
    const tx = transactions.filter((t) => t.date.startsWith(key))
    points.push({
      month: key,
      label: lang === 'en' ? `M${m}` : `Th${m}`,
      expense: sumByType(tx, 'expense'),
      income: sumByType(tx, 'income'),
    })
  }
  return points
}

export function groupByDay(transactions: Transaction[]): { date: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const arr = map.get(t.date) ?? []
    arr.push(t)
    map.set(t.date, arr)
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({ date, items: items.sort((a, b) => b.createdAt - a.createdAt) }))
}
