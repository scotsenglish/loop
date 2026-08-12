import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  increment,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Budget, Category, GoalContribution, SavingsGoal, Transaction, UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { ALL_DEFAULT_CATEGORIES } from '@/lib/defaultCategories'

const userDoc = (uid: string) => doc(db, 'users', uid)
const transactionsCol = (uid: string) => collection(db, 'users', uid, 'transactions')
const categoriesCol = (uid: string) => collection(db, 'users', uid, 'categories')
const budgetsCol = (uid: string) => collection(db, 'users', uid, 'budgets')
const goalsCol = (uid: string) => collection(db, 'users', uid, 'goals')

// ---------- Bootstrap ----------
export async function ensureUserInitialized(uid: string, email: string | null) {
  const batch = writeBatch(db)
  batch.set(
    userDoc(uid),
    { email, ...DEFAULT_SETTINGS, createdAt: serverTimestamp() },
    { merge: true }
  )
  for (const cat of ALL_DEFAULT_CATEGORIES) {
    const ref = doc(categoriesCol(uid))
    batch.set(ref, cat)
  }
  await batch.commit()
}

// ---------- Subscriptions ----------
export function subscribeSettings(
  uid: string,
  cb: (settings: UserSettings) => void
): Unsubscribe {
  return onSnapshot(userDoc(uid), (snap) => {
    const data = snap.data()
    cb({ ...DEFAULT_SETTINGS, ...(data as Partial<UserSettings>) })
  })
}

export function subscribeTransactions(
  uid: string,
  cb: (items: Transaction[]) => void
): Unsubscribe {
  const q = query(transactionsCol(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) })))
  })
}

export function subscribeCategories(
  uid: string,
  cb: (items: Category[]) => void
): Unsubscribe {
  const q = query(categoriesCol(uid), orderBy('order', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) })))
  })
}

export function subscribeBudgets(uid: string, cb: (items: Budget[]) => void): Unsubscribe {
  return onSnapshot(budgetsCol(uid), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Budget, 'id'>) })))
  })
}

export function subscribeGoals(uid: string, cb: (items: SavingsGoal[]) => void): Unsubscribe {
  return onSnapshot(goalsCol(uid), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavingsGoal, 'id'>) })))
  })
}

// ---------- Transactions ----------
export async function addTransaction(uid: string, tx: Omit<Transaction, 'id'>) {
  await addDoc(transactionsCol(uid), tx)
}

export async function updateTransaction(uid: string, id: string, patch: Partial<Transaction>) {
  await updateDoc(doc(transactionsCol(uid), id), { ...patch, updatedAt: Date.now() })
}

export async function deleteTransaction(uid: string, id: string) {
  await deleteDoc(doc(transactionsCol(uid), id))
}

export async function deleteTransactionsBatch(uid: string, ids: string[]) {
  if (ids.length === 0) return
  const batch = writeBatch(db)
  for (const id of ids) {
    batch.delete(doc(transactionsCol(uid), id))
  }
  await batch.commit()
}

// ---------- Categories ----------
export async function addCategory(uid: string, cat: Omit<Category, 'id'>) {
  await addDoc(categoriesCol(uid), { ...cat, isCustom: true })
}

export async function updateCategory(uid: string, id: string, patch: Partial<Category>) {
  await updateDoc(doc(categoriesCol(uid), id), patch)
}

export async function deleteCategory(uid: string, id: string) {
  await deleteDoc(doc(categoriesCol(uid), id))
}

// ---------- Budgets ----------
export async function upsertBudget(uid: string, categoryId: string, month: string, amount: number) {
  const id = `${categoryId}_${month}`
  await setDoc(doc(budgetsCol(uid), id), { categoryId, month, amount }, { merge: true })
}

export async function deleteBudget(uid: string, id: string) {
  await deleteDoc(doc(budgetsCol(uid), id))
}

// ---------- Savings goals ----------
export async function addGoal(uid: string, goal: Omit<SavingsGoal, 'id'>) {
  await addDoc(goalsCol(uid), goal)
}

export async function updateGoal(uid: string, id: string, patch: Partial<SavingsGoal>) {
  await updateDoc(doc(goalsCol(uid), id), patch)
}

export async function deleteGoal(uid: string, id: string) {
  await deleteDoc(doc(goalsCol(uid), id))
}

/** Atomically appends a contribution and adjusts the running total — using
 *  arrayUnion/increment instead of read-then-write avoids clobbering a
 *  contribution made from another tab/device at nearly the same time. */
export async function contributeToGoal(uid: string, goalId: string, contribution: GoalContribution) {
  await updateDoc(doc(goalsCol(uid), goalId), {
    contributions: arrayUnion(contribution),
    currentAmount: increment(contribution.amount),
  })
}

// ---------- Settings ----------
export async function updateSettings(uid: string, patch: Partial<UserSettings>) {
  await setDoc(userDoc(uid), patch, { merge: true })
}
