import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getRedirectResult,
  onAuthStateChanged,
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
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** True when the app is running installed on the home screen (standalone
 *  display mode). In that mode `signInWithPopup` can't hand control back to
 *  the app on iOS, so we must use the redirect flow there. In a normal
 *  mobile browser tab, popup works fine and avoids Safari's redirect/ITP
 *  storage quirks — same reliable path as desktop. */
function isStandalonePWA() {
  const mql = window.matchMedia?.('(display-mode: standalone)').matches
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true
  return Boolean(mql || iosStandalone)
}

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
    if (isStandalonePWA()) {
      await signInWithRedirect(auth, googleProvider)
      return
    }
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string })?.code
      // Some mobile browsers block/kill popups — fall back to redirect.
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      throw err
    }
  }

  const signOut = () => fbSignOut(auth)

  return (
    <AuthContext.Provider
      value={{ user, loading, configured: isFirebaseConfigured, authError, signInWithGoogle, signOut }}
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
