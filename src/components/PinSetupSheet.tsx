import { useState } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { useLanguage } from '@/context/LanguageContext'
import { PinKeypad } from '@/components/PinKeypad'

const PIN_LENGTH = 6

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (pin: string) => void
}

export function PinSetupSheet({ open, onClose, onConfirm }: Props) {
  const { t } = useLanguage()
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [firstPin, setFirstPin] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function reset() {
    setStep('enter')
    setFirstPin('')
    setPin('')
    setError(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleKey(key: string) {
    if (key === 'back') {
      setPin((p) => p.slice(0, -1))
      setError(false)
      return
    }
    if (pin.length >= PIN_LENGTH) return
    const next = pin + key
    setPin(next)
    setError(false)
    if (next.length !== PIN_LENGTH) return

    if (step === 'enter') {
      setFirstPin(next)
      setPin('')
      setStep('confirm')
      return
    }

    if (next === firstPin) {
      onConfirm(next)
      reset()
    } else {
      setError(true)
      setPin('')
    }
  }

  if (!open) return null

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-ink-950 px-6 text-white safe-top safe-bottom">
      <button
        onClick={handleClose}
        className="absolute right-5 top-5 rounded-full p-2 text-ink-300 active:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="text-center">
        <h1 className="font-display text-xl font-bold">
          {step === 'enter' ? t('lock.setupTitle') : t('lock.confirmTitle')}
        </h1>
        <p className={clsx('mt-1 text-sm', error ? 'text-rose-400' : 'text-ink-300')}>
          {error ? t('lock.pinMismatch') : t('lock.setupDesc')}
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
    </div>
  )
}
