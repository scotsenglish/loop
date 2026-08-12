import { Flame, ArrowRight } from 'lucide-react'

export function ReminderBanner({ streak, onAdd }: { streak: number; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 p-4 text-left text-white shadow-soft transition active:scale-[0.99]"
    >
      <Flame className="h-8 w-8 shrink-0 drop-shadow" />
      <div className="flex-1">
        <p className="text-sm font-bold">Hôm nay bạn chưa ghi chi tiêu nào</p>
        <p className="text-xs text-white/85">
          {streak > 0
            ? `Đừng để đứt chuỗi ${streak} ngày liên tiếp nhé!`
            : 'Ghi lại ngay để bắt đầu chuỗi thói quen của bạn.'}
        </p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0" />
    </button>
  )
}
