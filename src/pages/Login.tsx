import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'

type Mode = 'signin' | 'signup'

function friendlyError(code: string | null): string | null {
  if (!code) return null
  const map: Record<string, string> = {
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này. Bấm "Tạo tài khoản" nếu đây là lần đầu.',
    'auth/wrong-password': 'Sai mật khẩu, thử lại nhé.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/email-already-in-use': 'Email này đã có tài khoản — thử đăng nhập thay vì tạo mới.',
    'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.',
    'auth/too-many-requests': 'Bạn thử sai quá nhiều lần, vui lòng đợi một lát rồi thử lại.',
  }
  return map[code] ?? `Có lỗi xảy ra (${code}).`
}

export default function Login() {
  const { signInWithEmail, signUpWithEmail, resetPassword, configured } = useAuth()
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
      setError('Nhập đầy đủ email và mật khẩu nhé.')
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
      setError(friendlyError(code) ?? 'Có lỗi xảy ra, thử lại nhé.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setInfo(null)
    if (!email.trim()) {
      setError('Nhập email của bạn ở ô trên trước, rồi bấm "Quên mật khẩu?" lại nhé.')
      return
    }
    try {
      await resetPassword(email.trim())
      setInfo('Đã gửi email đặt lại mật khẩu — kiểm tra hộp thư của bạn.')
    } catch (e) {
      const code = (e as { code?: string })?.code ?? null
      setError(friendlyError(code) ?? 'Không gửi được email đặt lại mật khẩu.')
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-ink-950 px-6 pb-10 pt-12 text-white safe-top safe-bottom">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/30 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent-500/20 blur-[100px]" />

      <div className="relative z-10 mt-4 flex flex-col items-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-accent-500 shadow-card animate-pop">
          <LoopMark className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Loop</h1>
        <p className="mt-2 max-w-xs text-balance text-sm leading-relaxed text-ink-200">
          Ghi lại từng khoản chi trong một vòng lặp thói quen nhẹ nhàng.
        </p>
      </div>

      <div className="relative z-10 mt-8 w-full max-w-sm flex-1">
        {configured ? (
          <>
            <div className="mb-4 flex rounded-full bg-white/10 p-1 text-sm font-semibold">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 rounded-full py-2 transition ${
                  mode === 'signin' ? 'bg-white text-ink-900' : 'text-ink-200'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-full py-2 transition ${
                  mode === 'signup' ? 'bg-white text-ink-900' : 'text-ink-200'
                }`}
              >
                Tạo tài khoản
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-ink-300 outline-none focus:border-brand-400"
              />
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-ink-300 outline-none focus:border-brand-400"
              />

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-brand-300"
                >
                  Quên mật khẩu?
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 px-5 py-3.5 font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
              >
                {loading
                  ? 'Đang xử lý…'
                  : mode === 'signin'
                    ? 'Đăng nhập'
                    : 'Tạo tài khoản'}
              </button>
            </form>

            {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
            {info && <p className="mt-3 text-center text-sm text-mint-400">{info}</p>}

            <p className="mt-6 text-center text-xs text-ink-400">
              Dữ liệu của bạn được đồng bộ an toàn và riêng tư giữa các thiết bị.
            </p>
          </>
        ) : (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
            <p className="font-semibold">Chưa cấu hình Firebase</p>
            <p className="mt-1 text-amber-200/80">
              Tạo file <code className="rounded bg-black/30 px-1">.env</code> từ{' '}
              <code className="rounded bg-black/30 px-1">.env.example</code> và điền thông tin dự
              án Firebase của bạn. Xem hướng dẫn trong README.md.
            </p>
          </div>
        )}
      </div>
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
