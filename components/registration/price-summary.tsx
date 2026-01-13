'use client'

import { PriceCalculation } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { ADDITIONAL_ATTENDEE_PRICE } from '@/lib/constants'

interface PriceSummaryProps {
  pricing: PriceCalculation | null
}

export function PriceSummary({ pricing }: PriceSummaryProps) {
  if (!pricing) {
    return null
  }

  return (
    <div className="bg-zinc-900 text-white rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-zinc-300">
            {pricing.registrationTypeName} ({pricing.baseAttendees}{' '}
            {pricing.baseAttendees === 1 ? 'person' : 'people'})
          </span>
          <span className="font-medium">{formatCurrency(pricing.base)}</span>
        </div>
        {pricing.additionalAttendees > 0 && (
          <div className="flex justify-between">
            <span className="text-zinc-300">
              Additional Attendees ({pricing.additionalAttendees} x{' '}
              {formatCurrency(ADDITIONAL_ATTENDEE_PRICE)})
            </span>
            <span className="font-medium">
              {formatCurrency(pricing.additional)}
            </span>
          </div>
        )}
        <div className="border-t border-zinc-700 pt-3 mt-3">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>{formatCurrency(pricing.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
