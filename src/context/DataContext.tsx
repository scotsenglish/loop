import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import type { Budget, Category, Transaction, UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import {
  addTransaction as apiAddTransaction,
  deleteTransaction as apiDeleteTransaction,
  deleteTransactionsBatch as apiDeleteTransactionsBatch,
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
  /** Hides the given transaction ids immediately and schedules the real
   *  Firestore delete after a grace period, so the caller can offer an
   *  "Undo" toast. Returns a batchId to pass to undoSoftDelete(). */
  softDeleteTransactions: (ids: string[]) => string
  undoSoftDelete: (batchId: string) => void
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  setBudget: (categoryId: string, month: string, amount: number) => Promise<void>
  removeBudget: (id: string) => Promise<void>
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

const UNDO_GRACE_MS = 5000

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set())
  const pendingBatchesRef = useRef<Map<string, { ids: string[]; timer: number }>>(new Map())

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setCategories([])
      setBudgets([])
      setSettings(DEFAULT_SETTINGS)
      setReady(false)
      // Drop any in-flight undo timers — the signed-out user's transactions
      // list is gone anyway, so there's nothing left to actually delete.
      pendingBatchesRef.current.forEach((entry) => window.clearTimeout(entry.timer))
      pendingBatchesRef.current.clear()
      setPendingDeleteIds(new Set())
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

  function softDeleteTransactions(ids: string[]): string {
    const uid = user?.uid
    const batchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setPendingDeleteIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
    const timer = window.setTimeout(async () => {
      pendingBatchesRef.current.delete(batchId)
      setPendingDeleteIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      if (uid) {
        try {
          await apiDeleteTransactionsBatch(uid, ids)
        } catch (err) {
          console.error('Failed to commit soft-deleted transactions:', err)
        }
      }
    }, UNDO_GRACE_MS)
    pendingBatchesRef.current.set(batchId, { ids, timer })
    return batchId
  }

  function undoSoftDelete(batchId: string) {
    const entry = pendingBatchesRef.current.get(batchId)
    if (!entry) return
    window.clearTimeout(entry.timer)
    pendingBatchesRef.current.delete(batchId)
    setPendingDeleteIds((prev) => {
      const next = new Set(prev)
      entry.ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const value: DataContextValue = {
    ready,
    transactions: transactions.filter((t) => !pendingDeleteIds.has(t.id)),
    categories,
    budgets,
    settings,
    addTransaction,
    updateTransaction: (id, patch) => (user ? apiUpdateTransaction(user.uid, id, patch) : Promise.resolve()),
    deleteTransaction: (id) => (user ? apiDeleteTransaction(user.uid, id) : Promise.resolve()),
    softDeleteTransactions,
    undoSoftDelete,
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
