'use client'

import { useFormContext, Controller } from 'react-hook-form'
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

// Derive selected options from form value (single source of truth)
function getSelectedFromValue(value: PaymentMethod | undefined): Set<'credit' | 'loyalty'> {
  if (value === 'combo') return new Set<'credit' | 'loyalty'>(['credit', 'loyalty'])
  if (value === 'credit') return new Set<'credit' | 'loyalty'>(['credit'])
  if (value === 'loyalty') return new Set<'credit' | 'loyalty'>(['loyalty'])
  return new Set<'credit' | 'loyalty'>()
}

// Calculate payment method from selected options
function getValueFromSelected(selected: Set<'credit' | 'loyalty'>): PaymentMethod | undefined {
  if (selected.has('credit') && selected.has('loyalty')) return 'combo'
  if (selected.has('credit')) return 'credit'
  if (selected.has('loyalty')) return 'loyalty'
  return undefined
}

export function PaymentMethodSection() {
  const { control } = useFormContext<RegistrationFormData>()

  const handleToggle = (
    optionId: 'credit' | 'loyalty',
    currentValue: PaymentMethod | undefined,
    onChange: (value: PaymentMethod | undefined) => void
  ) => {
    const currentSelected = getSelectedFromValue(currentValue)
    const next = new Set(currentSelected)

    if (next.has(optionId)) {
      next.delete(optionId)
    } else {
      next.add(optionId)
    }

    onChange(getValueFromSelected(next))
  }

  return (
    <Controller
      name="paymentMethod"
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Derive selected state from form value (single source of truth)
        const selectedOptions = getSelectedFromValue(field.value)

        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Payment Method</h3>
              <p className="text-sm text-zinc-500">Select both if paying with a combination of credit card and Level points</p>
            </div>
            {error && (
              <p className="text-brand-orange text-sm">{error.message}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggle(option.id, field.value, field.onChange)}
                  className={cn(
                    'text-left p-4 rounded-xl border-2 transition-all',
                    selectedOptions.has(option.id)
                      ? 'border-brand-teal bg-brand-teal/10 ring-1 ring-brand-teal'
                      : error
                        ? 'border-brand-orange hover:border-brand-orange'
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
      }}
    />
  )
}
