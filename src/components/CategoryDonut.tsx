import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdownItem } from '@/lib/stats'
import { formatVND } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'

export function CategoryDonut({
  items,
  total,
}: {
  items: CategoryBreakdownItem[]
  total: number
}) {
  const { t, lang } = useLanguage()
  const top = items.slice(0, 6)
  const data = top.map((i) => ({
    name: i.category ? localizeCategoryName(i.category.name, lang) : t('common.other'),
    value: i.total,
    color: i.category?.color ?? '#6B7280',
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-400">{t('common.noData')}</div>
    )
  }

  return (
    <div className="relative">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] text-ink-400">{t('common.totalExpense')}</span>
        <span className="font-display text-base font-extrabold text-ink-900 dark:text-white">
          {formatVND(total)}
        </span>
      </div>
    </div>
  )
}
