import { useEffect, useState } from 'react'

/** Tracks window.scrollY, throttled to one read per animation frame. */
export function useScrollY(): number {
  const [y, setY] = useState(() => (typeof window !== 'undefined' ? window.scrollY : 0))

  useEffect(() => {
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setY(window.scrollY)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return y
}
