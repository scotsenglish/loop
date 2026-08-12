import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth'
import { getDocs, collection, limit, query } from 'firebase/firestore'
import { auth, googleProvider, db, isFirebaseConfigured } from '@/lib/firebase'
import { ensureUserInitialized } from '@/lib/firestoreApi'

interface AuthContextValue {
  user: User | null
  loading: boolean
  configured: boolean
  authError: string | null
  signInWithGoogle: () => Promise<void>
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

    // Resolve any pending redirect-based sign-in (mobile flow) and surface
    // errors instead of silently getting stuck on the login screen.
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect sign-in error:', err)
      setAuthError(err?.code ?? 'Đăng nhập qua redirect thất bại')
    })

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

  const signInWithGoogle = async () => {
    setAuthError(null)
    // Popup works reliably in regular browser tabs (desktop + mobile) and,
    // on Android, inside an installed home-screen app too (it's still full
    // Chrome under the hood). Only fall back to redirect if the popup path
    // itself fails — e.g. iOS standalone mode, where window.open can't hand
    // control back to the app.
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string })?.code
      const redirectFallbackCodes = [
        'auth/popup-blocked',
        'auth/cancelled-popup-request',
        'auth/operation-not-supported-in-this-environment',
      ]
      if (code && redirectFallbackCodes.includes(code)) {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      setAuthError(code ?? 'unknown-error')
      throw err
    }
  }

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
        signInWithGoogle,
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
