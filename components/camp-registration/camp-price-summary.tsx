'use client'

import { formatCurrency } from '@/lib/utils'
import {
  CAMP_ESSENCE_PAYMENT_OPTIONS,
  CAMP_ESSENCE_PRICE_PER_ATTENDEE,
  CampEssencePaymentMethod,
} from '@/lib/camp-essence'

interface CampPriceSummaryProps {
  totalAttendees: number
  paymentMethod?: CampEssencePaymentMethod
}

export function CampPriceSummary({
  totalAttendees,
  paymentMethod,
}: CampPriceSummaryProps) {
  const totalAmount = totalAttendees * CAMP_ESSENCE_PRICE_PER_ATTENDEE
  const paymentLabel = CAMP_ESSENCE_PAYMENT_OPTIONS.find(
    (option) => option.id === paymentMethod
  )?.label

  return (
    <div className="bg-zinc-900 text-white rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-zinc-300">
            Camp Essence ({totalAttendees} {totalAttendees === 1 ? 'attendee' : 'attendees'})
          </span>
          <span className="font-medium">
            {formatCurrency(CAMP_ESSENCE_PRICE_PER_ATTENDEE)} x {totalAttendees}
          </span>
        </div>
        <div className="border-t border-zinc-700 pt-3 mt-3">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
        {paymentLabel && (
          <div className="border-t border-zinc-700 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-zinc-300">Payment Method</span>
              <span className="font-medium">{paymentLabel}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
