import { NavLink } from 'react-router-dom'
import { Home, Receipt, BarChart3, Settings, Plus } from 'lucide-react'
import clsx from 'clsx'

const items = [
  { to: '/', label: 'Trang chủ', icon: Home, end: true },
  { to: '/transactions', label: 'Giao dịch', icon: Receipt, end: false },
]
const itemsRight = [
  { to: '/stats', label: 'Thống kê', icon: BarChart3, end: false },
  { to: '/settings', label: 'Cài đặt', icon: Settings, end: false },
]

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 safe-bottom safe-x">
      <div className="relative mx-auto flex max-w-lg items-center justify-between border-t border-ink-100 bg-white/90 px-4 pb-1 pt-2 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-900/90">
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="w-16 shrink-0" />

        {itemsRight.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <button
          onClick={onAdd}
          aria-label="Thêm giao dịch"
          className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-white shadow-card transition active:scale-90"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: typeof Home
  end: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className="flex w-16 flex-col items-center gap-1 py-1.5 text-[11px] font-medium"
    >
      {({ isActive }) => (
        <>
          <Icon
            className={clsx('h-6 w-6', isActive ? 'text-brand-500' : 'text-ink-400')}
            strokeWidth={isActive ? 2.4 : 2}
          />
          <span className={isActive ? 'text-brand-500' : 'text-ink-400'}>{label}</span>
        </>
      )}
    </NavLink>
  )
}
