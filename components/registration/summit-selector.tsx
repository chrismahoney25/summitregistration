'use client'

import { Summit } from '@/lib/types'
import { formatDateRange } from '@/lib/utils'

interface SummitSelectorProps {
  summits: Summit[]
  selectedId: string | null
  onSelect: (summitId: string) => void
  isLoading?: boolean
}

export function SummitSelector({
  summits,
  selectedId,
  onSelect,
  isLoading,
}: SummitSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">Select Your Summit</p>
        <div className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (summits.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800">
          No upcoming summits available at this time. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label htmlFor="summit-select" className="block text-sm font-medium text-zinc-700">
        Select Your Summit
      </label>
      <select
        id="summit-select"
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 focus:border-brand-teal focus:outline-none transition-colors bg-white appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
      >
        <option value="" disabled>
          Choose a date and location...
        </option>
        {summits.map((summit) => (
          <option key={summit.id} value={summit.id}>
            {formatDateRange(summit.startDate)} — {summit.location}
          </option>
        ))}
      </select>
    </div>
  )
}
