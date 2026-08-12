import { useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'

const THRESHOLD = 64
const MAX_PULL = 96

/** A lightweight pull-down-to-refresh gesture. Note: data here already
 *  syncs live via Firestore listeners, so there's no real refetch to run —
 *  this is a deliberate, honest "you're up to date" ritual rather than a
 *  fake network call, matching a gesture people expect from finance apps. */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [pull, setPull] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)

  function handleTouchStart(e: TouchEvent) {
    if (refreshing) return
    if (window.scrollY <= 0) {
      startYRef.current = e.touches[0].clientY
      setDragging(true)
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (startYRef.current === null || refreshing) return
    const delta = e.touches[0].clientY - startYRef.current
    setPull(delta <= 0 ? 0 : Math.min(MAX_PULL, delta * 0.5))
  }

  async function handleTouchEnd() {
    if (startYRef.current === null) return
    startYRef.current = null
    setDragging(false)
    if (pull >= THRESHOLD) {
      setRefreshing(true)
      setPull(THRESHOLD)
      await new Promise((resolve) => setTimeout(resolve, 700))
      setRefreshing(false)
      setPull(0)
      showToast(t('common.upToDate'))
    } else {
      setPull(0)
    }
  }

  const progress = Math.min(1, pull / THRESHOLD)

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className={clsx(
          'flex items-center justify-center overflow-hidden',
          !dragging && 'transition-[height] duration-200'
        )}
        style={{ height: pull }}
      >
        <RefreshCw
          className={clsx('h-5 w-5 text-brand-500', refreshing && 'animate-spin')}
          style={refreshing ? undefined : { transform: `rotate(${progress * 360}deg)`, opacity: progress }}
        />
      </div>
      {children}
    </div>
  )
}
