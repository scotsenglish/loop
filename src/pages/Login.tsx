import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

type Mode = 'signin' | 'signup'

function friendlyError(code: string | null, t: (key: string, ...args: unknown[]) => string): string | null {
  if (!code) return null
  const map: Record<string, string> = {
    'auth/invalid-email': t('login.err.invalidEmail'),
    'auth/user-not-found': t('login.err.userNotFound'),
    'auth/wrong-password': t('login.err.wrongPassword'),
    'auth/invalid-credential': t('login.err.invalidCredential'),
    'auth/email-already-in-use': t('login.err.emailInUse'),
    'auth/weak-password': t('login.err.weakPassword'),
    'auth/too-many-requests': t('login.err.tooManyRequests'),
  }
  return map[code] ?? t('login.err.generic', code)
}

export default function Login() {
  const { signInWithEmail, signUpWithEmail, resetPassword, configured } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!email.trim() || !password) {
      setError(t('login.err.fillFields'))
      return
    }
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password)
      } else {
        await signUpWithEmail(email.trim(), password)
      }
    } catch (e) {
      const code = (e as { code?: string })?.code ?? null
      setError(friendlyError(code, t) ?? t('login.err.somethingWrong'))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setInfo(null)
    if (!email.trim()) {
      setError(t('login.err.enterEmailFirst'))
      return
    }
    try {
      await resetPassword(email.trim())
      setInfo(t('login.resetSent'))
    } catch (e) {
      const code = (e as { code?: string })?.code ?? null
      setError(friendlyError(code, t) ?? t('login.err.resetFailed'))
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-ink-950 px-6 pb-10 pt-12 text-white safe-top safe-bottom">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/30 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent-500/20 blur-[100px]" />

      <div className="relative z-10 flex w-full max-w-sm items-center justify-end">
        <LangSwitch lang={lang} setLang={setLang} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-accent-500 shadow-card animate-pop">
          <LoopMark className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Loop</h1>
        <p className="mt-2 max-w-xs text-balance text-sm leading-relaxed text-ink-200">{t('login.tagline')}</p>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {configured ? (
          <>
            <div className="mb-4 flex rounded-full bg-white/10 p-1 text-sm font-semibold">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 rounded-full py-2 transition ${
                  mode === 'signin' ? 'bg-white text-ink-900' : 'text-ink-200'
                }`}
              >
                {t('login.signin')}
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-full py-2 transition ${
                  mode === 'signup' ? 'bg-white text-ink-900' : 'text-ink-200'
                }`}
              >
                {t('login.signup')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-ink-300 outline-none focus:border-brand-400"
              />
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-ink-300 outline-none focus:border-brand-400"
              />

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-brand-300"
                >
                  {t('login.forgotPassword')}
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 px-5 py-3.5 font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? t('login.processing') : mode === 'signin' ? t('login.signin') : t('login.signup')}
              </button>
            </form>

            {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
            {info && <p className="mt-3 text-center text-sm text-mint-400">{info}</p>}

            <p className="mt-6 text-center text-xs text-ink-400">{t('login.syncNote')}</p>
          </>
        ) : (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
            <p className="font-semibold">{t('login.notConfiguredTitle')}</p>
            <p className="mt-1 text-amber-200/80">{t('login.notConfiguredBody')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LangSwitch({ lang, setLang }: { lang: 'vi' | 'en'; setLang: (l: 'vi' | 'en') => void }) {
  return (
    <div className="flex rounded-full bg-white/10 p-0.5 text-xs font-semibold">
      <button
        onClick={() => setLang('vi')}
        className={`rounded-full px-2.5 py-1 transition ${lang === 'vi' ? 'bg-white text-ink-900' : 'text-ink-300'}`}
      >
        VI
      </button>
      <button
        onClick={() => setLang('en')}
        className={`rounded-full px-2.5 py-1 transition ${lang === 'en' ? 'bg-white text-ink-900' : 'text-ink-300'}`}
      >
        EN
      </button>
    </div>
  )
}

function LoopMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="18" cy="24" r="9" stroke="currentColor" strokeWidth="4" />
      <circle cx="30" cy="24" r="9" stroke="currentColor" strokeWidth="4" />
    </svg>
  )
}
