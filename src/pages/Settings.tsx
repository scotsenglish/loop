import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Download,
  Fingerprint,
  Flame,
  Lock,
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
import { useLanguage } from '@/context/LanguageContext'
import { useLock } from '@/context/LockContext'
import { useToast } from '@/context/ToastContext'
import { PinSetupSheet } from '@/components/PinSetupSheet'
import { PinVerifySheet } from '@/components/PinVerifySheet'
import { exportTransactionsCSV, exportTransactionsJSON } from '@/lib/exportData'
import { enablePush } from '@/lib/push'
import type { Lang } from '@/lib/i18n'
import type { ThemePref } from '@/types'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { settings, updateSettings, transactions, categories } = useData()
  const { t, lang, setLang } = useLanguage()
  const {
    lockEnabled,
    biometricAvailable,
    biometricEnabled,
    setupPin,
    disableLock,
    enableBiometric,
    disableBiometric,
  } = useLock()
  const { showToast } = useToast()
  const [pushBusy, setPushBusy] = useState(false)
  const [pinSetupOpen, setPinSetupOpen] = useState(false)
  const [pinVerifyMode, setPinVerifyMode] = useState<'disable' | 'change' | null>(null)

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

  function handleTogglePin(next: boolean) {
    if (next) {
      setPinSetupOpen(true)
    } else {
      setPinVerifyMode('disable')
    }
  }

  async function handlePinConfirmed(pin: string) {
    await setupPin(pin)
    setPinSetupOpen(false)
  }

  function handlePinVerified() {
    if (pinVerifyMode === 'disable') {
      disableLock()
      setPinVerifyMode(null)
    } else if (pinVerifyMode === 'change') {
      setPinVerifyMode(null)
      setPinSetupOpen(true)
    }
  }

  async function handleToggleBiometric(next: boolean) {
    if (next) {
      const ok = await enableBiometric()
      if (!ok) showToast(t('lock.biometricFailed'))
    } else {
      disableBiometric()
    }
  }

  return (
    <div className="px-4 pt-6 pb-10">
      <h1 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">{t('settingsPage.title')}</h1>

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
            {user?.displayName ?? t('settingsPage.defaultUser')}
          </p>
          <p className="truncate text-xs text-ink-400">{user?.email}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 p-4 text-white shadow-soft">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          <span className="text-sm font-semibold">{t('settingsPage.currentStreak')}</span>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-extrabold">{t('settingsPage.days', settings.streakCount)}</p>
          <p className="text-[11px] text-white/80">{t('settingsPage.bestStreak', settings.bestStreak)}</p>
        </div>
      </div>

      <SectionTitle>{t('settingsPage.reminderSection')}</SectionTitle>
      <div className="card-surface divide-y divide-ink-100 rounded-2xl shadow-soft dark:divide-ink-800">
        <Row
          icon={<Bell className="h-5 w-5 text-brand-500" />}
          label={t('settingsPage.reminderInApp')}
          desc={t('settingsPage.reminderInAppDesc')}
        >
          <Toggle
            checked={settings.reminderEnabled}
            onChange={(v) => updateSettings({ reminderEnabled: v })}
          />
        </Row>
        <Row icon={<span className="w-5" />} label={t('settingsPage.reminderTime')} desc={t('settingsPage.everyDay')}>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => updateSettings({ reminderTime: e.target.value })}
            className="rounded-lg border border-ink-200 bg-ink-50 px-2 py-1 text-sm dark:border-ink-700 dark:bg-ink-800"
          />
        </Row>
        <Row
          icon={<Bell className="h-5 w-5 text-accent-500" />}
          label={t('settingsPage.pushAdvanced')}
          desc={t('settingsPage.pushAdvancedDesc')}
        >
          <Toggle checked={settings.pushEnabled} onChange={togglePush} disabled={pushBusy} />
        </Row>
      </div>

      <SectionTitle>{t('lock.section')}</SectionTitle>
      <div className="card-surface divide-y divide-ink-100 rounded-2xl shadow-soft dark:divide-ink-800">
        <Row
          icon={<Lock className="h-5 w-5 text-brand-500" />}
          label={t('lock.pinLabel')}
          desc={t('lock.pinDesc')}
        >
          <Toggle checked={lockEnabled} onChange={handleTogglePin} />
        </Row>
        {lockEnabled && (
          <button
            onClick={() => setPinVerifyMode('change')}
            className="flex w-full items-center gap-3 px-4 py-3.5"
          >
            <span className="w-5" />
            <span className="flex-1 text-left text-sm font-medium text-ink-700 dark:text-ink-100">
              {t('lock.changePin')}
            </span>
            <ChevronRight className="h-4 w-4 text-ink-300" />
          </button>
        )}
        {lockEnabled && biometricAvailable && (
          <Row
            icon={<Fingerprint className="h-5 w-5 text-accent-500" />}
            label={t('lock.biometricLabel')}
            desc={t('lock.biometricDesc')}
          >
            <Toggle checked={biometricEnabled} onChange={handleToggleBiometric} />
          </Row>
        )}
      </div>

      <SectionTitle>{t('settingsPage.manageSection')}</SectionTitle>
      <div className="card-surface divide-y divide-ink-100 rounded-2xl shadow-soft dark:divide-ink-800">
        <Link to="/budgets" className="flex items-center gap-3 px-4 py-3.5">
          <PiggyBank className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-sm font-medium text-ink-700 dark:text-ink-100">
            {t('settingsPage.budgetsByCategory')}
          </span>
          <ChevronRight className="h-4 w-4 text-ink-300" />
        </Link>
        <Link to="/categories" className="flex items-center gap-3 px-4 py-3.5">
          <Tag className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-sm font-medium text-ink-700 dark:text-ink-100">
            {t('settingsPage.categoriesLink')}
          </span>
          <ChevronRight className="h-4 w-4 text-ink-300" />
        </Link>
      </div>

      <SectionTitle>{t('settingsPage.appearanceSection')}</SectionTitle>
      <div className="card-surface flex gap-2 rounded-2xl p-2 shadow-soft">
        {(
          [
            ['light', t('settingsPage.light'), Sun],
            ['dark', t('settingsPage.dark'), Moon],
            ['system', t('settingsPage.system'), SunMoon],
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

      <SectionTitle>{t('settingsPage.languageSection')}</SectionTitle>
      <div className="card-surface flex gap-2 rounded-2xl p-2 shadow-soft">
        {(
          [
            ['vi', t('settingsPage.langVi')],
            ['en', t('settingsPage.langEn')],
          ] as [Lang, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setLang(value)}
            className={clsx(
              'flex-1 rounded-xl py-2.5 text-xs font-semibold transition',
              lang === value ? 'bg-brand-500 text-white' : 'text-ink-500 dark:text-ink-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <SectionTitle>{t('settingsPage.dataSection')}</SectionTitle>
      <div className="card-surface divide-y divide-ink-100 rounded-2xl shadow-soft dark:divide-ink-800">
        <button
          onClick={() => exportTransactionsCSV(transactions, categories, lang)}
          className="flex w-full items-center gap-3 px-4 py-3.5"
        >
          <Download className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-left text-sm font-medium text-ink-700 dark:text-ink-100">
            {t('settingsPage.exportCsv')}
          </span>
        </button>
        <button
          onClick={() => exportTransactionsJSON(transactions, categories)}
          className="flex w-full items-center gap-3 px-4 py-3.5"
        >
          <Download className="h-5 w-5 text-brand-500" />
          <span className="flex-1 text-left text-sm font-medium text-ink-700 dark:text-ink-100">
            {t('settingsPage.exportJson')}
          </span>
        </button>
      </div>

      <button
        onClick={signOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-500/10"
      >
        <LogOut className="h-4 w-4" /> {t('settingsPage.signOut')}
      </button>

      <p className="mt-6 text-center text-[11px] text-ink-300">{t('settingsPage.version')}</p>

      <PinSetupSheet open={pinSetupOpen} onClose={() => setPinSetupOpen(false)} onConfirm={handlePinConfirmed} />
      <PinVerifySheet
        open={pinVerifyMode !== null}
        onClose={() => setPinVerifyMode(null)}
        onVerified={handlePinVerified}
      />
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
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0'
        )}
      />
    </button>
  )
}
