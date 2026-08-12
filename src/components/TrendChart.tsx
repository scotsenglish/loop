import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { DayPoint } from '@/lib/stats'
import { formatVNDCompact } from '@/lib/format'

export function TrendChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={{ fontSize: 10, fill: '#8b8fa8' }}
          />
          <Tooltip
            formatter={(value) => formatVNDCompact(Number(value))}
            labelStyle={{ fontSize: 12 }}
            contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#F43F5E"
            strokeWidth={2.5}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
