export type TransactionType = 'expense' | 'income'

export interface Category {
  id: string
  name: string
  icon: string // emoji
  color: string // hex
  type: TransactionType | 'both'
  order: number
  isCustom?: boolean
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  note: string
  date: string // yyyy-MM-dd, local calendar day this expense belongs to
  createdAt: number // epoch ms, for ordering / streak checks
  updatedAt?: number
}

export interface Budget {
  id: string
  categoryId: string
  month: string // yyyy-MM
  amount: number
}

export interface GoalContribution {
  id: string
  amount: number // positive = deposit, negative = withdrawal
  date: string // yyyy-MM-dd
  createdAt: number // epoch ms, used for pace projection
}

export interface SavingsGoal {
  id: string
  name: string
  icon: string // emoji
  color: string // hex
  targetAmount: number
  targetDate?: string | null // yyyy-MM-dd, optional
  currentAmount: number
  contributions: GoalContribution[]
  createdAt: number
}

export type ThemePref = 'light' | 'dark' | 'system'

export interface UserSettings {
  currency: string
  theme: ThemePref
  reminderEnabled: boolean
  reminderTime: string // HH:mm 24h
  pushEnabled: boolean
  monthlyBudgetTotal?: number
  streakCount: number
  bestStreak: number
  lastLoggedDate: string | null // yyyy-MM-dd
  fcmTokens?: string[]
}

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'VND',
  theme: 'system',
  reminderEnabled: true,
  reminderTime: '20:00',
  pushEnabled: false,
  streakCount: 0,
  bestStreak: 0,
  lastLoggedDate: null,
}
