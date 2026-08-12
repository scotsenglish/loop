import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  hashPin,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  verifyBiometric,
} from '@/lib/appLock'

const LS_ENABLED = 'loop-lock-enabled'
const LS_PIN_HASH = 'loop-lock-pin-hash'
const LS_BIOMETRIC_ENABLED = 'loop-lock-biometric-enabled'
const LS_BIOMETRIC_CRED = 'loop-lock-biometric-cred'

// Only re-lock if the app was actually backgrounded for a while — avoids
// nagging the user for brief interruptions (a share sheet, a notification
// banner, switching keyboards) that also fire visibilitychange.
const REAUTH_THRESHOLD_MS = 20000

interface LockContextValue {
  lockEnabled: boolean
  locked: boolean
  biometricAvailable: boolean
  biometricEnabled: boolean
  setupPin: (pin: string) => Promise<void>
  disableLock: () => void
  verifyPin: (pin: string) => Promise<boolean>
  unlock: () => void
  tryBiometricUnlock: () => Promise<boolean>
  enableBiometric: () => Promise<boolean>
  disableBiometric: () => void
}

const LockContext = createContext<LockContextValue | undefined>(undefined)

export function LockProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lockEnabled, setLockEnabled] = useState(() => localStorage.getItem(LS_ENABLED) === '1')
  const [locked, setLocked] = useState(() => localStorage.getItem(LS_ENABLED) === '1')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabledState] = useState(
    () => localStorage.getItem(LS_BIOMETRIC_ENABLED) === '1'
  )
  const hiddenAtRef = useRef<number | null>(null)

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setBiometricAvailable)
  }, [])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
        return
      }
      const hiddenAt = hiddenAtRef.current
      hiddenAtRef.current = null
      if (lockEnabled && hiddenAt && Date.now() - hiddenAt > REAUTH_THRESHOLD_MS) {
        setLocked(true)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [lockEnabled])

  async function setupPin(pin: string) {
    const hash = await hashPin(pin)
    localStorage.setItem(LS_PIN_HASH, hash)
    localStorage.setItem(LS_ENABLED, '1')
    setLockEnabled(true)
    setLocked(false)
  }

  function disableLock() {
    localStorage.removeItem(LS_PIN_HASH)
    localStorage.removeItem(LS_ENABLED)
    localStorage.removeItem(LS_BIOMETRIC_ENABLED)
    localStorage.removeItem(LS_BIOMETRIC_CRED)
    setLockEnabled(false)
    setBiometricEnabledState(false)
    setLocked(false)
  }

  async function verifyPin(pin: string): Promise<boolean> {
    const stored = localStorage.getItem(LS_PIN_HASH)
    if (!stored) return false
    const hash = await hashPin(pin)
    return hash === stored
  }

  function unlock() {
    setLocked(false)
  }

  async function tryBiometricUnlock(): Promise<boolean> {
    const credId = localStorage.getItem(LS_BIOMETRIC_CRED)
    if (!credId) return false
    const ok = await verifyBiometric(credId)
    if (ok) setLocked(false)
    return ok
  }

  async function enableBiometric(): Promise<boolean> {
    if (!user) return false
    const credId = await registerBiometric(user.uid)
    if (!credId) return false
    localStorage.setItem(LS_BIOMETRIC_CRED, credId)
    localStorage.setItem(LS_BIOMETRIC_ENABLED, '1')
    setBiometricEnabledState(true)
    return true
  }

  function disableBiometric() {
    localStorage.removeItem(LS_BIOMETRIC_CRED)
    localStorage.removeItem(LS_BIOMETRIC_ENABLED)
    setBiometricEnabledState(false)
  }

  const value: LockContextValue = {
    lockEnabled,
    locked,
    biometricAvailable,
    biometricEnabled,
    setupPin,
    disableLock,
    verifyPin,
    unlock,
    tryBiometricUnlock,
    enableBiometric,
    disableBiometric,
  }

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>
}

export function useLock() {
  const ctx = useContext(LockContext)
  if (!ctx) throw new Error('useLock must be used within LockProvider')
  return ctx
}
