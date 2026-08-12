import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import type { Budget, Category, Transaction, UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import {
  addTransaction as apiAddTransaction,
  deleteTransaction as apiDeleteTransaction,
  updateTransaction as apiUpdateTransaction,
  addCategory as apiAddCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  upsertBudget as apiUpsertBudget,
  deleteBudget as apiDeleteBudget,
  updateSettings as apiUpdateSettings,
  subscribeTransactions,
  subscribeCategories,
  subscribeBudgets,
  subscribeSettings,
} from '@/lib/firestoreApi'
import { computeNextStreak } from '@/lib/streak'

interface DataContextValue {
  ready: boolean
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  settings: UserSettings
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  setBudget: (categoryId: string, month: string, amount: number) => Promise<void>
  removeBudget: (id: string) => Promise<void>
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setCategories([])
      setBudgets([])
      setSettings(DEFAULT_SETTINGS)
      setReady(false)
      return
    }
    setReady(false)
    const unsubs = [
      subscribeTransactions(user.uid, setTransactions),
      subscribeCategories(user.uid, setCategories),
      subscribeBudgets(user.uid, setBudgets),
      subscribeSettings(user.uid, (s) => {
        setSettings(s)
        setReady(true)
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  async function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    if (!user) return
    await apiAddTransaction(user.uid, { ...tx, createdAt: Date.now() })
    const todayISO = format(new Date(), 'yyyy-MM-dd')
    const next = computeNextStreak(settings, todayISO)
    if (next.lastLoggedDate !== settings.lastLoggedDate || next.streakCount !== settings.streakCount) {
      await apiUpdateSettings(user.uid, next)
    }
  }

  const value: DataContextValue = {
    ready,
    transactions,
    categories,
    budgets,
    settings,
    addTransaction,
    updateTransaction: (id, patch) => (user ? apiUpdateTransaction(user.uid, id, patch) : Promise.resolve()),
    deleteTransaction: (id) => (user ? apiDeleteTransaction(user.uid, id) : Promise.resolve()),
    addCategory: (cat) => (user ? apiAddCategory(user.uid, cat) : Promise.resolve()),
    updateCategory: (id, patch) => (user ? apiUpdateCategory(user.uid, id, patch) : Promise.resolve()),
    deleteCategory: (id) => (user ? apiDeleteCategory(user.uid, id) : Promise.resolve()),
    setBudget: (categoryId, month, amount) =>
      user ? apiUpsertBudget(user.uid, categoryId, month, amount) : Promise.resolve(),
    removeBudget: (id) => (user ? apiDeleteBudget(user.uid, id) : Promise.resolve()),
    updateSettings: (patch) => (user ? apiUpdateSettings(user.uid, patch) : Promise.resolve()),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
