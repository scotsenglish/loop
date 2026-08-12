import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { MonthPoint } from '@/lib/stats'
import { formatVNDCompact } from '@/lib/format'

export function YearlyBarChart({ data }: { data: MonthPoint[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barGap={2}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#8b8fa8' }} />
          <Tooltip
            formatter={(value) => formatVNDCompact(Number(value))}
            contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          />
          <Bar dataKey="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
