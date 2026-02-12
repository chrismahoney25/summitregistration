'use client'

import { useEffect, useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { RegistrationFormData, RegistrationType } from '@/lib/types'
import { ADDITIONAL_ATTENDEE_PRICE, isCanadianProvince } from '@/lib/constants'
import { formatCurrency, cn } from '@/lib/utils'

interface AttendeeOption {
  count: number
  price: number
  label: string
}

export function RegistrationTypeSection() {
  const {
    watch,
    setValue,
    control,
    clearErrors,
  } = useFormContext<RegistrationFormData>()

  const isAlumni = watch('isAlumni')
  const isLevelMember = watch('isLevelMember')
  const totalAttendees = watch('totalAttendees')
  const state = watch('state')
  const isCanadian = isCanadianProvince(state || '')

  // Calculate attendee options with pricing
  const attendeeOptions = useMemo((): AttendeeOption[] => {
    const options: AttendeeOption[] = []

    if (isAlumni) {
      // Alumni: starts at 2 for $1,250, max 10
      for (let i = 2; i <= 10; i++) {
        const additionalCount = i - 2
        const price = 1250 + (additionalCount * ADDITIONAL_ATTENDEE_PRICE)
        options.push({ count: i, price, label: `${i} people — ${formatCurrency(price)}` })
      }
    } else if (isLevelMember) {
      // Level Member: $1,450 base + $600 per additional person
      for (let i = 1; i <= 10; i++) {
        const additionalCount = i - 1
        const price = 1450 + (additionalCount * ADDITIONAL_ATTENDEE_PRICE)
        const label = i === 1 ? `Just me — ${formatCurrency(price)}` : `${i} people — ${formatCurrency(price)}`
        options.push({ count: i, price, label })
      }
    } else if (isAlumni === false && isLevelMember === false) {
      // Non-Level Member: starts at 2 for $2,750, max 10
      for (let i = 2; i <= 10; i++) {
        const additionalCount = i - 2
        const price = 2750 + (additionalCount * ADDITIONAL_ATTENDEE_PRICE)
        options.push({ count: i, price, label: `${i} people — ${formatCurrency(price)}` })
      }
    }

    return options
  }, [isAlumni, isLevelMember])

  // Update registration type and additional attendees when total changes
  useEffect(() => {
    if (totalAttendees === undefined) return

    let regType: RegistrationType | undefined
    let includedAttendees = 2 // Default for most types

    if (isAlumni) {
      regType = 'alumni'
      includedAttendees = 2
    } else if (isLevelMember) {
      if (totalAttendees === 1) {
        regType = 'level-member-solo'
        includedAttendees = 1
      } else {
        regType = 'level-member'
        includedAttendees = 2
      }
    } else if (isAlumni === false && isLevelMember === false) {
      regType = 'non-level-member'
      includedAttendees = 2
    }

    if (regType) {
      // Calculate additional attendee form fields (everyone except the primary registrant)
      const actualAdditionalCount = Math.max(0, totalAttendees - 1)

      setValue('registrationType', regType, { shouldValidate: true })
      setValue('additionalAttendeeCount', actualAdditionalCount, { shouldValidate: true })
    }
  }, [totalAttendees, isAlumni, isLevelMember, setValue])

  const showAttendeesQuestion = isAlumni !== undefined && (isAlumni || isLevelMember !== undefined)

  return (
    <div className="space-y-6">
      {/* Alumni Question */}
      <Controller
        name="isAlumni"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-3" data-field="isAlumni">
            <p className="text-sm font-medium text-zinc-700">
              Have you attended The Summit before?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (field.value === true) return // Already selected, don't reset
                  field.onChange(true)
                  setValue('isLevelMember', undefined)
                  setValue('totalAttendees', undefined)
                  clearErrors('isAlumni')
                }}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                  field.value === true
                    ? 'border-brand-teal bg-brand-teal text-white'
                    : error
                      ? 'border-brand-orange hover:border-brand-orange'
                      : 'border-zinc-200 hover:border-zinc-400'
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  if (field.value === false) return // Already selected, don't reset
                  field.onChange(false)
                  setValue('totalAttendees', undefined)
                  clearErrors('isAlumni')
                }}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                  field.value === false
                    ? 'border-brand-teal bg-brand-teal text-white'
                    : error
                      ? 'border-brand-orange hover:border-brand-orange'
                      : 'border-zinc-200 hover:border-zinc-400'
                )}
              >
                No
              </button>
            </div>
            {error && (
              <p className="text-brand-orange text-sm">{error.message}</p>
            )}
          </div>
        )}
      />

      {/* Level Member Question - only show if not alumni */}
      {isAlumni === false && (
        <Controller
          name="isLevelMember"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-3" data-field="isLevelMember">
              <p className="text-sm font-medium text-zinc-700">
                {isCanadian
                  ? 'Are you a member of a L\'Oréal loyalty program (Redken C5A, L\'Oréal Excellence, Club Matrix)?'
                  : 'Are you a LEVEL Loyalty member?'}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (field.value === true) return // Already selected, don't reset
                    field.onChange(true)
                    setValue('totalAttendees', 2) // Default to 2 people for level members
                    clearErrors('isLevelMember')
                  }}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                    field.value === true
                      ? 'border-brand-teal bg-brand-teal text-white'
                      : error
                        ? 'border-brand-orange hover:border-brand-orange'
                        : 'border-zinc-200 hover:border-zinc-400'
                  )}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (field.value === false) return // Already selected, don't reset
                    field.onChange(false)
                    setValue('totalAttendees', undefined)
                    clearErrors('isLevelMember')
                  }}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                    field.value === false
                      ? 'border-brand-teal bg-brand-teal text-white'
                      : error
                        ? 'border-brand-orange hover:border-brand-orange'
                        : 'border-zinc-200 hover:border-zinc-400'
                  )}
                >
                  No
                </button>
              </div>
              {error && (
                <p className="text-brand-orange text-sm">{error.message}</p>
              )}
            </div>
          )}
        />
      )}

      {/* Attendees Selection with Pricing */}
      {showAttendeesQuestion && attendeeOptions.length > 0 && (
        <Controller
          name="totalAttendees"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-3" data-field="totalAttendees">
              <p className="text-sm font-medium text-zinc-700">
                How many people are attending?
              </p>
              <select
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(parseInt(e.target.value, 10))
                  clearErrors('totalAttendees')
                }}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors bg-white appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
                  error
                    ? 'border-brand-orange focus:border-brand-orange'
                    : 'border-zinc-200 focus:border-brand-teal'
                )}
              >
                <option value="" disabled>
                  Select number of attendees...
                </option>
                {attendeeOptions.map((option) => (
                  <option key={option.count} value={option.count}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error && (
                <p className="text-brand-orange text-sm">{error.message}</p>
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
