import type { Category, Transaction } from '@/types'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportTransactionsCSV(transactions: Transaction[], categories: Category[]) {
  const header = ['Ngày', 'Loại', 'Danh mục', 'Số tiền', 'Ghi chú']
  const rows = transactions.map((t) => {
    const cat = categories.find((c) => c.id === t.categoryId)
    return [
      t.date,
      t.type === 'expense' ? 'Chi tiêu' : 'Thu nhập',
      cat?.name ?? '',
      String(t.amount),
      (t.note ?? '').replace(/[\r\n,]+/g, ' '),
    ]
  })
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
  download(`loop-giao-dich-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + csv, 'text/csv;charset=utf-8')
}

export function exportTransactionsJSON(transactions: Transaction[], categories: Category[]) {
  const payload = { exportedAt: new Date().toISOString(), categories, transactions }
  download(
    `loop-du-lieu-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json'
  )
}
