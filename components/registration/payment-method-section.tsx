'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { RegistrationFormData, PaymentMethod } from '@/lib/types'
import { cn } from '@/lib/utils'

const PAYMENT_OPTIONS = [
  {
    id: 'credit' as const,
    name: 'Credit Card',
    description: 'We\'ll send you a secure payment link',
  },
  {
    id: 'loyalty' as const,
    name: 'Level Loyalty Points',
    description: 'Use your accumulated Level points',
  },
]

export function PaymentMethodSection() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<RegistrationFormData>()

  const [selectedOptions, setSelectedOptions] = useState<Set<'credit' | 'loyalty'>>(new Set())

  // Update form value when selections change
  useEffect(() => {
    let paymentMethod: PaymentMethod | undefined
    if (selectedOptions.has('credit') && selectedOptions.has('loyalty')) {
      paymentMethod = 'combo'
    } else if (selectedOptions.has('credit')) {
      paymentMethod = 'credit'
    } else if (selectedOptions.has('loyalty')) {
      paymentMethod = 'loyalty'
    }

    if (paymentMethod) {
      setValue('paymentMethod', paymentMethod, { shouldValidate: true })
    }
  }, [selectedOptions, setValue])

  const handleToggle = (optionId: 'credit' | 'loyalty') => {
    setSelectedOptions((prev) => {
      const next = new Set(prev)
      if (next.has(optionId)) {
        next.delete(optionId)
      } else {
        next.add(optionId)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">Payment Method</h3>
        <p className="text-sm text-zinc-500">Select both if paying with a combination of credit card and Level points</p>
      </div>
      {errors.paymentMethod && (
        <p className="text-brand-orange text-sm">{errors.paymentMethod.message}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PAYMENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleToggle(option.id)}
            className={cn(
              'text-left p-4 rounded-xl border-2 transition-all',
              selectedOptions.has(option.id)
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
