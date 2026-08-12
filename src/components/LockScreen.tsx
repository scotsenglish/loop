import { useEffect, useState } from 'react'
import { Fingerprint } from 'lucide-react'
import clsx from 'clsx'
import { useLanguage } from '@/context/LanguageContext'
import { useLock } from '@/context/LockContext'
import { PinKeypad } from '@/components/PinKeypad'

const PIN_LENGTH = 6

export function LockScreen() {
  const { t } = useLanguage()
  const { verifyPin, unlock, biometricEnabled, tryBiometricUnlock } = useLock()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)
  const [triedBiometric, setTriedBiometric] = useState(false)

  useEffect(() => {
    if (biometricEnabled && !triedBiometric) {
      setTriedBiometric(true)
      tryBiometricUnlock()
    }
  }, [biometricEnabled, triedBiometric, tryBiometricUnlock])

  async function handleKey(key: string) {
    if (checking) return
    if (key === 'back') {
      setPin((p) => p.slice(0, -1))
      setError(false)
      return
    }
    if (pin.length >= PIN_LENGTH) return
    const next = pin + key
    setPin(next)
    setError(false)
    if (next.length === PIN_LENGTH) {
      setChecking(true)
      const ok = await verifyPin(next)
      if (ok) {
        unlock()
      } else {
        setError(true)
        setPin('')
      }
      setChecking(false)
    }
  }

  return (
    <div className="animate-fade-in flex min-h-dvh flex-col items-center justify-center gap-8 bg-ink-950 px-6 text-white safe-top safe-bottom">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold">{t('lock.title')}</h1>
        <p className={clsx('mt-1 text-sm', error ? 'text-rose-400' : 'text-ink-300')}>
          {error ? t('lock.wrongPin') : t('lock.enterPin')}
        </p>
      </div>

      <div className="flex gap-3">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={clsx(
              'h-3.5 w-3.5 rounded-full border-2 transition',
              error ? 'border-rose-500' : i < pin.length ? 'border-brand-400 bg-brand-400' : 'border-white/30'
            )}
          />
        ))}
      </div>

      <div className="w-full max-w-xs">
        <PinKeypad onKey={handleKey} />
      </div>

      {biometricEnabled && (
        <button
          onClick={() => tryBiometricUnlock()}
          className="flex items-center gap-2 text-sm font-medium text-ink-300"
        >
          <Fingerprint className="h-5 w-5" /> {t('lock.useBiometric')}
        </button>
      )}
    </div>
  )
}
