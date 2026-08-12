import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'

export function Layout() {
  const [addOpen, setAddOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-ink-50 pb-28 dark:bg-ink-950">
      <div className="mx-auto max-w-lg safe-x safe-top">
        {/* Keying on the path forces a remount on navigation so the fade+slide
            entrance animation replays for every screen, not just the first. */}
        <div key={location.pathname} className="animate-page-in">
          <Outlet />
        </div>
      </div>
      <BottomNav onAdd={() => setAddOpen(true)} />
      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
