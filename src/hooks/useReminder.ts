import { useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import type { UserSettings } from '@/types'

const REMINDER_MESSAGES = [
  'Hôm nay bạn đã tiêu gì chưa? Ghi lại để giữ streak nhé! 🔥',
  'Đừng quên ghi chép chi tiêu hôm nay — chỉ mất 10 giây thôi!',
  'Một dòng ghi chú nhỏ hôm nay, một thói quen tốt về sau. ✨',
]

function msUntil(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target.getTime() <= now.getTime()) return -1
  return target.getTime() - now.getTime()
}

/** Returns whether the "haven't logged today" banner should show, and schedules
 *  a best-effort local notification at the user's reminder time while the app
 *  stays open in a tab (foreground or background). This works reliably on all
 *  platforms without any backend; for notifications while the app/browser is
 *  fully closed, the optional Cloud Function push (see /functions) is required. */
export function useReminder(settings: UserSettings) {
  const todayISO = format(new Date(), 'yyyy-MM-dd')
  const loggedToday = settings.lastLoggedDate === todayISO

  useEffect(() => {
    if (!settings.reminderEnabled || loggedToday) return
    if (typeof Notification === 'undefined') return

    const delay = msUntil(settings.reminderTime)
    if (delay < 0) return

    const timer = window.setTimeout(async () => {
      if (Notification.permission !== 'granted') return
      const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)]
      try {
        const base = import.meta.env.BASE_URL
        const reg = await navigator.serviceWorker?.getRegistration()
        if (reg) {
          reg.showNotification('Loop nhắc bạn 👋', {
            body: msg,
            icon: `${base}icons/icon-192.png`,
            badge: `${base}icons/icon-96.png`,
            tag: 'loop-daily-reminder',
          })
        } else {
          new Notification('Loop nhắc bạn 👋', { body: msg, icon: `${base}icons/icon-192.png` })
        }
      } catch {
        // Notifications unsupported or blocked — the in-app banner still covers this.
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [settings.reminderEnabled, settings.reminderTime, loggedToday])

  return useMemo(
    () => ({
      loggedToday,
      showBanner: settings.reminderEnabled && !loggedToday,
    }),
    [loggedToday, settings.reminderEnabled]
  )
}
