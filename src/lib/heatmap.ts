import { addDays, format, startOfWeek } from 'date-fns'
import type { Transaction } from '@/types'

export interface HeatmapDay {
  date: string // yyyy-MM-dd
  count: number
  /** -1 = a future day (not shown), 0-4 = activity intensity level */
  level: -1 | 0 | 1 | 2 | 3 | 4
}

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

/** Builds a GitHub-style contribution grid: `weeks` columns of 7 days each
 *  (Monday-Sunday), ending on the current week. Each cell's level reflects
 *  how many transactions were logged that day — a quick visual of how
 *  consistently the habit is being kept up. */
export function buildHeatmap(transactions: Transaction[], weeks = 18): HeatmapDay[][] {
  const counts = new Map<string, number>()
  for (const t of transactions) {
    counts.set(t.date, (counts.get(t.date) ?? 0) + 1)
  }

  const today = new Date()
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 })
  const gridStart = addDays(currentWeekStart, -(weeks - 1) * 7)

  const columns: HeatmapDay[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: HeatmapDay[] = []
    for (let d = 0; d < 7; d++) {
      const date = addDays(gridStart, w * 7 + d)
      const key = format(date, 'yyyy-MM-dd')
      const isFuture = date > today
      col.push({
        date: key,
        count: isFuture ? 0 : counts.get(key) ?? 0,
        level: isFuture ? -1 : levelFor(counts.get(key) ?? 0),
      })
    }
    columns.push(col)
  }
  return columns
}
