'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import {
  CAMP_ESSENCE_PAYMENT_OPTIONS,
  CampEssencePaymentMethod,
} from '@/lib/camp-essence'
import { CampRegistrationFormSchema } from '@/lib/camp-validations'

export function CampPaymentMethodSection() {
  const { control, clearErrors } = useFormContext<CampRegistrationFormSchema>()

  return (
    <Controller
      name="paymentMethod"
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-4" data-field="paymentMethod">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Payment Method</h3>
            <p className="text-sm text-zinc-500">Choose one option for Camp Essence.</p>
          </div>
          {error && <p className="text-brand-orange text-sm">{error.message}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CAMP_ESSENCE_PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  field.onChange(option.id as CampEssencePaymentMethod)
                  clearErrors('paymentMethod')
                }}
                className={cn(
                  'text-left p-4 rounded-xl border-2 transition-all',
                  field.value === option.id
                    ? 'border-brand-teal bg-brand-teal/10 ring-1 ring-brand-teal'
                    : error
                      ? 'border-brand-orange hover:border-brand-orange'
                      : 'border-zinc-200 hover:border-brand-teal'
                )}
              >
                <p className="font-semibold text-zinc-900">{option.label}</p>
                <p className="text-sm text-zinc-600 mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    />
  )
}
