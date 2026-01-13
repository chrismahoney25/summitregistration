import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateRange(startDate: string): string {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const startDay = start.getDate()
  const endDay = end.getDate()
  const month = start.toLocaleDateString('en-US', { month: 'long' })
  const year = start.getFullYear()

  return `${month} ${startDay}-${endDay}, ${year}`
}

export function formatSummitDisplay(startDate: string, location: string): string {
  return `${formatDateRange(startDate)} | ${location}`
}
