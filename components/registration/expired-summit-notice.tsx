'use client'

import { useEffect, useCallback } from 'react'
import { formatDateRange } from '@/lib/utils'

interface ExpiredSummitNoticeProps {
  summit?: {
    location: string
    startDate: string
  } | null
  onDismiss: () => void
}

export function ExpiredSummitNotice({ summit, onDismiss }: ExpiredSummitNoticeProps) {
  const handleDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [handleDismiss])

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {summit ? (
            <>
              <p className="text-amber-800 font-medium">
                {summit.location} ({formatDateRange(summit.startDate)})
              </p>
              <p className="text-amber-700 text-sm mt-1">
                This summit has already taken place. Please select from an upcoming summit below.
              </p>
            </>
          ) : (
            <p className="text-amber-800">
              This summit is no longer available. Please select from an upcoming summit below.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-amber-600 hover:text-amber-800 transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
