import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastOptions {
  action?: ToastAction
  duration?: number
}

interface ToastState {
  id: number
  message: string
  action?: ToastAction
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<number | null>(null)

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    const id = Date.now()
    setToast({ id, message, action: options?.action })
    const duration = options?.duration ?? (options?.action ? 5000 : 3500)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      setToast((cur) => (cur?.id === id ? null : cur))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 safe-x">
          <div className="animate-rise-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-sm text-white shadow-card dark:bg-ink-800">
            <span className="flex-1 leading-snug">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick()
                  dismiss()
                }}
                className="shrink-0 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wide text-brand-300 active:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
