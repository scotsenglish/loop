import { useEffect } from 'react'
import type { ThemePref } from '@/types'

export function useTheme(pref: ThemePref) {
  useEffect(() => {
    const root = document.documentElement
    const apply = (isDark: boolean) => root.classList.toggle('dark', isDark)

    if (pref === 'dark') {
      apply(true)
      return
    }
    if (pref === 'light') {
      apply(false)
      return
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mq.matches)
    const listener = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [pref])
}
