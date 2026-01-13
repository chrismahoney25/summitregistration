'use client'

import { useEffect } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { RegistrationFormData } from '@/lib/types'

export function AdditionalAttendeesSection() {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormData & { totalAttendees?: number }>()

  const totalAttendees = watch('totalAttendees')
  const additionalCount = watch('additionalAttendeeCount')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalAttendees',
  })

  // Sync field array with additional count
  useEffect(() => {
    const currentLength = fields.length
    if (additionalCount > currentLength) {
      for (let i = currentLength; i < additionalCount; i++) {
        append({ fullName: '' }, { shouldFocus: false })
      }
    } else if (additionalCount < currentLength) {
      for (let i = currentLength - 1; i >= additionalCount; i--) {
        remove(i)
      }
    }
  }, [additionalCount, fields.length, append, remove])

  // Don't render if no attendees selected or no additional attendees needed
  if (!totalAttendees || additionalCount === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">
          Other Attendees
        </h3>
        <p className="text-sm text-zinc-600 mt-1">
          Please provide names for the other {additionalCount} {additionalCount === 1 ? 'attendee' : 'attendees'}
        </p>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Input
            key={field.id}
            label={`Attendee ${index + 2}`}
            placeholder="Full Name"
            error={errors.additionalAttendees?.[index]?.fullName?.message}
            {...register(`additionalAttendees.${index}.fullName`)}
          />
        ))}
      </div>
    </div>
  )
}
