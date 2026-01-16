import { useMemo } from 'react'
import { RegistrationType, PriceCalculation } from '@/lib/types'
import { REGISTRATION_TYPES, ADDITIONAL_ATTENDEE_PRICE } from '@/lib/constants'

export function usePriceCalculation(
  registrationType: RegistrationType | null | undefined,
  additionalAttendeeCount: number
): PriceCalculation | null {
  return useMemo(() => {
    if (!registrationType) return null

    const type = REGISTRATION_TYPES.find((t) => t.id === registrationType)
    if (!type) return null

    // additionalAttendeeCount represents form fields (totalAttendees - 1)
    // For pricing, we need to calculate attendees beyond what's included in base price
    const totalAttendees = additionalAttendeeCount + 1
    const pricingAdditionalCount = Math.max(0, totalAttendees - type.attendees)

    const base = type.price
    const additional = pricingAdditionalCount * ADDITIONAL_ATTENDEE_PRICE

    return {
      base,
      additional,
      total: base + additional,
      baseAttendees: type.attendees,
      additionalAttendees: pricingAdditionalCount,
      registrationTypeName: type.name,
    }
  }, [registrationType, additionalAttendeeCount])
}
