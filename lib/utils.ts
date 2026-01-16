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
  // Parse as local date to avoid timezone shift
  const [year, month, day] = startDate.split('-').map(Number)
  const start = new Date(year, month - 1, day)
  const end = new Date(year, month - 1, day + 1)

  const startDay = start.getDate()
  const endDay = end.getDate()
  const monthName = start.toLocaleDateString('en-US', { month: 'long' })

  return `${monthName} ${startDay}-${endDay}, ${year}`
}

export function formatSummitDisplay(startDate: string, location: string): string {
  return `${formatDateRange(startDate)} | ${location}`
}
