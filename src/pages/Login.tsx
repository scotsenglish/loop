import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { signInWithGoogle, configured } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError('Đăng nhập thất bại, vui lòng thử lại.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-ink-950 px-6 pb-10 pt-16 text-white safe-top safe-bottom">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/30 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent-500/20 blur-[100px]" />

      <div /> {/* spacer */}

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-accent-500 shadow-card animate-pop">
          <LoopMark className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Loop</h1>
        <p className="mt-3 max-w-xs text-balance text-sm leading-relaxed text-ink-200">
          Ghi lại từng khoản chi trong một vòng lặp thói quen nhẹ nhàng — để tiền của bạn luôn
          trong tầm kiểm soát.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {configured ? (
          <>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-semibold text-ink-900 shadow-soft transition active:scale-[0.98] disabled:opacity-60"
            >
              <GoogleIcon className="h-5 w-5" />
              {loading ? 'Đang đăng nhập…' : 'Tiếp tục với Google'}
            </button>
            {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v3h3.93c2.3-2.12 3.52-5.24 3.52-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.93-3c-1.09.73-2.5 1.16-4 1.16-3.08 0-5.68-2.08-6.61-4.88H1.34v3.09C3.31 21.3 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.39 14.37c-.24-.73-.38-1.5-.38-2.37s.14-1.64.38-2.37V6.54H1.34C.49 8.2 0 10.05 0 12s.49 3.8 1.34 5.46l4.05-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.33 0 3.31 2.7 1.34 6.54l4.05 3.09C6.32 6.83 8.92 4.75 12 4.75z"
      />
    </svg>
  )
}
