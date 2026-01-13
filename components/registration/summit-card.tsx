'use client'

import { Summit } from '@/lib/types'
import { formatDateRange } from '@/lib/utils'

interface SummitCardProps {
  summit: Summit
  onChangeClick?: () => void
  showChangeButton?: boolean
}

export function SummitCard({
  summit,
  onChangeClick,
  showChangeButton = true,
}: SummitCardProps) {
  return (
    <div className="bg-brand-teal/10 rounded-xl p-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-medium text-brand-teal uppercase tracking-wider mb-1">
            Your Event
          </p>
          <p className="font-semibold text-zinc-900">
            The Summit Immersive · {summit.location}
          </p>
          <p className="text-sm text-zinc-600">
            {formatDateRange(summit.startDate)}
          </p>
        </div>
        {showChangeButton && onChangeClick && (
          <button
            type="button"
            onClick={onChangeClick}
            className="text-sm text-brand-teal hover:text-brand-teal-dark transition-colors shrink-0"
          >
            Change
          </button>
        )}
      </div>
    </div>
  )
}
