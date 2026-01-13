'use client'

import { useFormContext } from 'react-hook-form'
import { RegistrationFormData, PaymentMethod } from '@/lib/types'
import { cn } from '@/lib/utils'

const PAYMENT_OPTIONS = [
  {
    id: 'credit' as PaymentMethod,
    name: 'Credit Card',
    description: 'We\'ll send you a secure payment link',
  },
  {
    id: 'loyalty' as PaymentMethod,
    name: 'Level Loyalty Points',
    description: 'Use your accumulated Level points',
  },
]

export function PaymentMethodSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RegistrationFormData>()

  const selectedMethod = watch('paymentMethod')

  const handleSelect = (method: PaymentMethod) => {
    setValue('paymentMethod', method, { shouldValidate: true })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900">Payment Method</h3>
      {errors.paymentMethod && (
        <p className="text-brand-orange text-sm">{errors.paymentMethod.message}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PAYMENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            className={cn(
              'text-left p-4 rounded-xl border-2 transition-all',
              selectedMethod === option.id
                ? 'border-brand-teal bg-brand-teal/10 ring-1 ring-brand-teal'
                : 'border-zinc-200 hover:border-brand-teal'
            )}
          >
            <p className="font-semibold text-zinc-900">{option.name}</p>
            <p className="text-sm text-zinc-600">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
