import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Download,
  Flame,
  LogOut,
  Moon,
  PiggyBank,
  Sun,
  SunMoon,
  Tag,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { exportTransactionsCSV, exportTransactionsJSON } from '@/lib/exportData'
import { enablePush } from '@/lib/push'
import type { ThemePref } from '@/types'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { settings, updateSettings, transactions, categories } = useData()
  const [pushBusy, setPushBusy] = useState(false)

  async function togglePush(next: boolean) {
    if (!next) {
      await updateSettings({ pushEnabled: false })
      return
    }
    setPushBusy(true)
    try {
      const token = await enablePush()
      if (token) {
        const tokens = Array.from(new Set([...(settings.fcmTokens ?? []), token]))
        await updateSettings({ pushEnabled: true, fcmTokens: tokens })
      } else {
        await updateSettings({ pushEnabled: false })
      }
    } finally {
      setPushBusy(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-10">
      <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">Cài đặt</h1>

      <div className="card-surface mt-4 flex items-center gap-3 rounded-2xl p-4 shadow-soft">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600 dark:bg-brand-900/40">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-800 dark:text-white">
            {user?.displayName ?? 'Người dùng Loop'}
          </p>
          <p className="truncate text-xs text-ink-400">{user?.email}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 p-4 text-white shadow-soft">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          <span className="text-sm font-semibold">Chuỗi ghi chép hiện tại</span>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-extrabold">{settings.streakCount} ngày</p>
          <p className="text-[11px] text-white/80">Kỷ lục: {settings.bestStreak} ngày</p>
        </div>
      </div>

      <SectionTitle>Nhắc nhở & thói quen</SectionTitle>
      <div className="card-surface divide-y divide-ink-100 rounded-2xl shadow-soft dark:divide-ink-800">
        <Row
          icon={<Bell className="h-5 w-5 text-brand-500" />}
          label="Nhắc trong app"
          desc="Banner + thông báo cục bộ khi mở app"
        >
          <Toggle
            checked={settings.reminderEnabled}
            onChange={(v) => updateSettings({ reminderEnabled: v })}
          />
        </Row>
        <Row icon={<span className="w-5" />} label="Giờ nhắc" desc="Mỗi ngày">
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => updateSettings({ reminderTime: e.target.value })}
            className="rounded-lg border border-ink-200 bg-ink-50 px-2 py-1 text-sm dark:border-ink-700 dark:bg-ink-800"
          />
        </Row>
        <Row
          icon={<Bell className="h-5 w-5 text-accent-500" />}
          label="Push nâng cao"
          desc="Nhắc kể cả khi đã đóng app (cần cấu hình Firebase Cloud Messaging)"
        >
          <Toggle checked={settings.pushEnabled} onChange={togglePush} disabled={pushBusy} />
        </Row>
      </div>

      <SectionTitle>Quản lý</SectionTitle>
      <div className="card-surface divide-y divide-ink-100 rounded-2xl shadow-soft dark:divide-ink-800">
        <Link to="/budgets" className="flex items-center gap-3 px-4 py-3.5">
          <PiggyBank className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-sm font-medium text-ink-700 dark:text-ink-100">
            Ngân sách theo danh mục
          </span>
          <ChevronRight className="h-4 w-4 text-ink-300" />
        </Link>
        <Link to="/categories" className="flex items-center gap-3 px-4 py-3.5">
          <Tag className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-sm font-medium text-ink-700 dark:text-ink-100">
            Danh mục chi tiêu / thu nhập
          </span>
          <ChevronRight className="h-4 w-4 text-ink-300" />
        </Link>
      </div>

      <SectionTitle>Giao diện</SectionTitle>
      <div className="card-surface flex gap-2 rounded-2xl p-2 shadow-soft">
        {(
          [
            ['light', 'Sáng', Sun],
            ['dark', 'Tối', Moon],
            ['system', 'Tự động', SunMoon],
          ] as [ThemePref, string, typeof Sun][]
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            onClick={() => updateSettings({ theme: value })}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-semibold transition',
              settings.theme === value
                ? 'bg-brand-500 text-white'
                : 'text-ink-500 dark:text-ink-300'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <SectionTitle>Dữ liệu</SectionTitle>
      <div className="card-surface divide-y divide-ink-100 rounded-2xl shadow-soft dark:divide-ink-800">
        <button
          onClick={() => exportTransactionsCSV(transactions, categories)}
          className="flex w-full items-center gap-3 px-4 py-3.5"
        >
          <Download className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-left text-sm font-medium text-ink-700 dark:text-ink-100">
            Xuất CSV
          </span>
        </button>
        <button
          onClick={() => exportTransactionsJSON(transactions, categories)}
          className="flex w-full items-center gap-3 px-4 py-3.5"
        >
          <Download className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-left text-sm font-medium text-ink-700 dark:text-ink-100">
            Xuất JSON (sao lưu đầy đủ)
          </span>
        </button>
      </div>

      <button
        onClick={signOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10"
      >
        <LogOut className="h-4 w-4" /> Đăng xuất
      </button>

      <p className="mt-6 text-center text-[11px] text-ink-300">Loop · phiên bản 1.0</p>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="mb-2 mt-6 px-1 text-xs font-bold uppercase tracking-wide text-ink-400">{children}</p>
}

function Row({
  icon,
  label,
  desc,
  children,
}: {
  icon: ReactNode
  label: string
  desc?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-700 dark:text-ink-100">{label}</p>
        {desc && <p className="text-[11px] text-ink-400">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={clsx(
        'relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50',
        checked ? 'bg-brand-500' : 'bg-ink-200 dark:bg-ink-700'
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
