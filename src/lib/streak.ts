import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { UserSettings } from '@/types'

/** Pure function: given current settings and today's date (yyyy-MM-dd), compute
 * the next streak state after the user logs at least one transaction today. */
export function computeNextStreak(
  settings: Pick<UserSettings, 'lastLoggedDate' | 'streakCount' | 'bestStreak'>,
  todayISO: string
): { streakCount: number; bestStreak: number; lastLoggedDate: string } {
  const { lastLoggedDate, streakCount, bestStreak } = settings

  if (lastLoggedDate === todayISO) {
    // Already logged today, no change.
    return { streakCount, bestStreak, lastLoggedDate: todayISO }
  }

  let nextCount = 1
  if (lastLoggedDate) {
    const diff = differenceInCalendarDays(parseISO(todayISO), parseISO(lastLoggedDate))
    if (diff === 1) {
      nextCount = streakCount + 1
    }
  }

  return {
    streakCount: nextCount,
    bestStreak: Math.max(bestStreak, nextCount),
    lastLoggedDate: todayISO,
  }
}

/** Whether the streak is still "alive" as of today (logged today or yesterday). */
export function isStreakActive(lastLoggedDate: string | null, todayISO: string): boolean {
  if (!lastLoggedDate) return false
  const diff = differenceInCalendarDays(parseISO(todayISO), parseISO(lastLoggedDate))
  return diff <= 1
}
