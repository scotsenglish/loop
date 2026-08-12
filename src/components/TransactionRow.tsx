import { useRef, useState, type PointerEvent } from 'react'
import { Check, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { Category, Transaction } from '@/types'
import { formatVND } from '@/lib/format'
import { localizeCategoryName } from '@/lib/i18n'
import { useLanguage } from '@/context/LanguageContext'
import { useData } from '@/context/DataContext'
import { useToast } from '@/context/ToastContext'

const REVEAL_WIDTH = 76
const DRAG_OPEN_THRESHOLD = 32
const MOVE_THRESHOLD = 8

export function TransactionRow({
  tx,
  category,
  onClick,
  selectable,
  selected,
  onToggleSelect,
}: {
  tx: Transaction
  category: Category | undefined
  onClick?: () => void
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}) {
  const { t, lang } = useLanguage()
  const { softDeleteTransactions, undoSoftDelete } = useData()
  const { showToast } = useToast()

  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const startRef = useRef<{ x: number; y: number; base: number } | null>(null)

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (selectable) return
    startRef.current = { x: e.clientX, y: e.clientY, base: dragX }
    movedRef.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (selectable || !startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    if (!draggingRef.current) {
      if (Math.abs(dx) < MOVE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return
      draggingRef.current = true
      setDragging(true)
    }
    movedRef.current = true
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, startRef.current.base + dx))
    setDragX(next)
  }

  function handlePointerUp() {
    if (selectable) return
    if (draggingRef.current) {
      setDragX((cur) => (cur <= -DRAG_OPEN_THRESHOLD ? -REVEAL_WIDTH : 0))
    }
    draggingRef.current = false
    setDragging(false)
    startRef.current = null
  }

  function handleRowClick() {
    if (selectable) {
      onToggleSelect?.()
      return
    }
    if (movedRef.current) {
      movedRef.current = false
      return
    }
    if (dragX !== 0) {
      setDragX(0)
      return
    }
    onClick?.()
  }

  function handleSwipeDelete() {
    const batchId = softDeleteTransactions([tx.id])
    showToast(t('toast.deletedOne'), {
      action: { label: t('toast.undo'), onClick: () => undoSoftDelete(batchId) },
    })
    setDragX(0)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {!selectable && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={handleSwipeDelete}
            style={{ width: REVEAL_WIDTH }}
            aria-label={t('tx.delete')}
            className="flex h-[calc(100%-4px)] items-center justify-center rounded-xl bg-rose-500 text-white"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleRowClick}
        style={{ transform: `translateX(${dragX}px)`, touchAction: 'pan-y' }}
        className={clsx(
          'relative flex w-full items-center gap-3 rounded-2xl bg-white px-2 py-2.5 text-left dark:bg-ink-900',
          !dragging && 'transition-transform duration-200',
          !selectable && 'active:bg-ink-100 dark:active:bg-ink-800'
        )}
      >
        {selectable && (
          <span
            className={clsx(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
              selected
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-ink-300 dark:border-ink-600'
            )}
          >
            {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
        )}
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg leading-none"
          style={{ backgroundColor: (category?.color ?? '#6B7280') + '22' }}
        >
          {category?.icon ?? '🔖'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-50">
            {category ? localizeCategoryName(category.name, lang) : t('tx.unknownCategory')}
          </p>
          {tx.note && <p className="truncate text-xs text-ink-400">{tx.note}</p>}
        </div>
        <span
          className={clsx(
            'shrink-0 text-sm font-bold tabular-nums',
            tx.type === 'income' ? 'text-mint-600' : 'text-ink-800 dark:text-ink-100'
          )}
        >
          {tx.type === 'income' ? '+' : '-'}
          {formatVND(tx.amount)}
        </span>
      </button>
    </div>
  )
}
