'use client'

import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { RegistrationFormData, RegistrationType } from '@/lib/types'
import { ADDITIONAL_ATTENDEE_PRICE } from '@/lib/constants'
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
    formState: { errors },
  } = useFormContext<RegistrationFormData>()

  const isAlumni = watch('isAlumni')
  const isLevelMember = watch('isLevelMember')
  const totalAttendees = watch('totalAttendees')

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
      // Level Member: can do solo ($1,450) or 2-10 ($1,950 base)
      options.push({ count: 1, price: 1450, label: `Just me — ${formatCurrency(1450)}` })
      for (let i = 2; i <= 10; i++) {
        const additionalCount = i - 2
        const price = 1950 + (additionalCount * ADDITIONAL_ATTENDEE_PRICE)
        options.push({ count: i, price, label: `${i} people — ${formatCurrency(price)}` })
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
    // Collect names for everyone except the primary attendee
    const additionalNamesNeeded = Math.max(0, totalAttendees - 1)

    if (isAlumni) {
      regType = 'alumni'
    } else if (isLevelMember) {
      if (totalAttendees === 1) {
        regType = 'level-member-solo'
      } else {
        regType = 'level-member'
      }
    } else if (isAlumni === false && isLevelMember === false) {
      regType = 'non-level-member'
    }

    if (regType) {
      setValue('registrationType', regType, { shouldValidate: true })
      setValue('additionalAttendeeCount', additionalNamesNeeded, { shouldValidate: true })
    }
  }, [totalAttendees, isAlumni, isLevelMember, setValue])

  const showAttendeesQuestion = isAlumni !== undefined && (isAlumni || isLevelMember !== undefined)

  return (
    <div className="space-y-6">
      {/* Alumni Question */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">
          Have you attended The Summit before?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setValue('isAlumni', true, { shouldValidate: true })
              setValue('isLevelMember', undefined)
              setValue('totalAttendees', undefined)
            }}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
              isAlumni === true
                ? 'border-brand-teal bg-brand-teal text-white'
                : errors.isAlumni
                  ? 'border-brand-orange hover:border-brand-orange'
                  : 'border-zinc-200 hover:border-zinc-400'
            )}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('isAlumni', false, { shouldValidate: true })
              setValue('totalAttendees', undefined)
            }}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
              isAlumni === false
                ? 'border-brand-teal bg-brand-teal text-white'
                : errors.isAlumni
                  ? 'border-brand-orange hover:border-brand-orange'
                  : 'border-zinc-200 hover:border-zinc-400'
            )}
          >
            No
          </button>
        </div>
        {errors.isAlumni && (
          <p className="text-brand-orange text-sm">{errors.isAlumni.message}</p>
        )}
      </div>

      {/* Level Member Question - only show if not alumni */}
      {isAlumni === false && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700">
            Are you a LEVEL Loyalty member?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setValue('isLevelMember', true, { shouldValidate: true })
                setValue('totalAttendees', undefined)
              }}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                isLevelMember === true
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : errors.isLevelMember
                    ? 'border-brand-orange hover:border-brand-orange'
                    : 'border-zinc-200 hover:border-zinc-400'
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('isLevelMember', false, { shouldValidate: true })
                setValue('totalAttendees', undefined)
              }}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                isLevelMember === false
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : errors.isLevelMember
                    ? 'border-brand-orange hover:border-brand-orange'
                    : 'border-zinc-200 hover:border-zinc-400'
              )}
            >
              No
            </button>
          </div>
          {errors.isLevelMember && (
            <p className="text-brand-orange text-sm">{errors.isLevelMember.message}</p>
          )}
        </div>
      )}

      {/* Attendees Selection with Pricing */}
      {showAttendeesQuestion && attendeeOptions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700">
            How many people are attending?
          </p>
          <select
            value={totalAttendees || ''}
            onChange={(e) => setValue('totalAttendees', parseInt(e.target.value, 10), { shouldValidate: true })}
            className={cn(
              "w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors bg-white appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
              errors.totalAttendees
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
          {errors.totalAttendees && (
            <p className="text-brand-orange text-sm">{errors.totalAttendees.message}</p>
          )}
        </div>
      )}
    </div>
  )
}
