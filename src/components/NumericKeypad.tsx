import { Delete } from 'lucide-react'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'back']

export function NumericKeypad({
  onKey,
}: {
  onKey: (key: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onKey(key)}
          className="flex h-14 items-center justify-center rounded-2xl bg-ink-50 text-xl font-semibold text-ink-800 transition active:scale-95 active:bg-ink-100 dark:bg-ink-800 dark:text-ink-50 dark:active:bg-ink-700"
        >
          {key === 'back' ? <Delete className="h-6 w-6" /> : key}
        </button>
      ))}
    </div>
  )
}
