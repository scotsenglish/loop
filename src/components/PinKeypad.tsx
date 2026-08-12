import { Delete } from 'lucide-react'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

export function PinKeypad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key, i) =>
        key === '' ? (
          <div key={`spacer-${i}`} />
        ) : (
          <button
            key={key}
            onClick={() => onKey(key)}
            className="flex h-16 items-center justify-center rounded-full text-xl font-semibold text-white transition active:scale-95 active:bg-white/10"
          >
            {key === 'back' ? <Delete className="h-6 w-6" /> : key}
          </button>
        )
      )}
    </div>
  )
}
