'use client'

import { useEffect } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { CampRegistrationFormSchema } from '@/lib/camp-validations'

export function CampAdditionalAttendeesSection() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CampRegistrationFormSchema>()

  const totalAttendees = watch('totalAttendees')
  const additionalAttendeeCount = Math.max(0, (totalAttendees || 0) - 1)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalAttendees',
  })

  useEffect(() => {
    const currentLength = fields.length

    if (additionalAttendeeCount > currentLength) {
      for (let i = currentLength; i < additionalAttendeeCount; i++) {
        append({ fullName: '', email: '', phone: '' }, { shouldFocus: false })
      }
      return
    }

    if (additionalAttendeeCount < currentLength) {
      for (let i = currentLength - 1; i >= additionalAttendeeCount; i--) {
        remove(i)
      }
    }
  }, [additionalAttendeeCount, fields.length, append, remove])

  if (additionalAttendeeCount === 0) {
    return null
  }

  return (
    <div className="space-y-4" data-field="additionalAttendees">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">Additional Attendees</h3>
        <p className="text-sm text-zinc-600 mt-1">
          Provide attendee details for the other {additionalAttendeeCount}{' '}
          {additionalAttendeeCount === 1 ? 'person' : 'people'}.
        </p>
      </div>

      {typeof errors.additionalAttendees?.message === 'string' && (
        <p className="text-brand-orange text-sm">{errors.additionalAttendees.message}</p>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 rounded-xl border border-zinc-200 space-y-4">
            <p className="font-medium text-zinc-800">Attendee {index + 2}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Full name"
                error={errors.additionalAttendees?.[index]?.fullName?.message}
                {...register(`additionalAttendees.${index}.fullName`)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                error={errors.additionalAttendees?.[index]?.email?.message}
                {...register(`additionalAttendees.${index}.email`)}
              />
            </div>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 555-5555"
              error={errors.additionalAttendees?.[index]?.phone?.message}
              {...register(`additionalAttendees.${index}.phone`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
