import { useEffect, useRef, useState } from 'react'

/** Animates numeric changes with an ease-out tween instead of jumping
 *  straight to the new value — chains smoothly even if `target` changes
 *  again mid-animation. */
export function useCountUp(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target)
  const valueRef = useRef(target)

  useEffect(() => {
    const from = valueRef.current
    const to = target
    if (from === to) return

    let raf = 0
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased
      valueRef.current = current
      setDisplay(current)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        valueRef.current = to
        setDisplay(to)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}
