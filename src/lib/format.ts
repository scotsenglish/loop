const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const vndCompactFormatter = new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatVND(amount: number): string {
  return vndFormatter.format(amount)
}

export function formatVNDCompact(amount: number): string {
  return vndCompactFormatter.format(amount) + '₫'
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export function parseAmountInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}
