'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { STATES_AND_PROVINCES_GROUPED } from '@/lib/constants'
import { CampRegistrationFormSchema } from '@/lib/camp-validations'

export function CampSalonInfoSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CampRegistrationFormSchema>()

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
          label="State/Province"
          placeholder="Select state/province"
          groups={STATES_AND_PROVINCES_GROUPED}
          error={errors.state?.message}
          {...register('state')}
        />
      </div>
    </div>
  )
}
