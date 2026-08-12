import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth'
import { getDocs, collection, limit, query } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { ensureUserInitialized } from '@/lib/firestoreApi'

interface AuthContextValue {
  user: User | null
  loading: boolean
  configured: boolean
  authError: string | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const catSnap = await getDocs(query(collection(db, 'users', u.uid, 'categories'), limit(1)))
          if (catSnap.empty) {
            await ensureUserInitialized(u.uid, u.email)
          }
        } catch (err) {
          console.error('Init user data error:', err)
        }
      }
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null)
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmail = async (email: string, password: string) => {
    setAuthError(null)
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const resetPassword = async (email: string) => {
    setAuthError(null)
    await sendPasswordResetEmail(auth, email)
  }

  const signOut = () => fbSignOut(auth)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isFirebaseConfigured,
        authError,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
