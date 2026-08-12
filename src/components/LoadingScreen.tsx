export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-50 dark:bg-ink-950">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
      <p className="font-display text-sm font-semibold text-ink-400">Đang tải Loop…</p>
    </div>
  )
}
