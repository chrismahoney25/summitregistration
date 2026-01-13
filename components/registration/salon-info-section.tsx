'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { US_STATES } from '@/lib/constants'
import { RegistrationFormData } from '@/lib/types'

export function SalonInfoSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationFormData>()

  return (
    <div className="space-y-4">
      <Input
        label="Salon Name"
        placeholder="Enter your salon name"
        error={errors.salonName?.message}
        {...register('salonName')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="City"
          error={errors.city?.message}
          {...register('city')}
        />
        <Select
          label="State"
          placeholder="Select state"
          options={US_STATES.map((s) => ({ value: s.value, label: s.label }))}
          error={errors.state?.message}
          {...register('state')}
        />
      </div>
    </div>
  )
}
