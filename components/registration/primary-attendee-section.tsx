'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { RegistrationFormData } from '@/lib/types'

export function PrimaryAttendeeSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormData>()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900">Primary Attendee</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="First name"
            error={errors.primaryAttendee?.firstName?.message}
            {...register('primaryAttendee.firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Last name"
            error={errors.primaryAttendee?.lastName?.message}
            {...register('primaryAttendee.lastName')}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          error={errors.primaryAttendee?.email?.message}
          {...register('primaryAttendee.email')}
        />
      </div>
    </div>
  )
}
