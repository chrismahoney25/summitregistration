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

    const base = type.price
    const additional = additionalAttendeeCount * ADDITIONAL_ATTENDEE_PRICE

    return {
      base,
      additional,
      total: base + additional,
      baseAttendees: type.attendees,
      additionalAttendees: additionalAttendeeCount,
      registrationTypeName: type.name,
    }
  }, [registrationType, additionalAttendeeCount])
}
