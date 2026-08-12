import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'

export function Layout() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-ink-50 pb-28 dark:bg-ink-950">
      <div className="mx-auto max-w-lg safe-x">
        <Outlet />
      </div>
      <BottomNav onAdd={() => setAddOpen(true)} />
      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
