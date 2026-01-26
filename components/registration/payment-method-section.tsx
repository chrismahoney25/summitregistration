'use client'

import { useEffect, useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { RegistrationFormData, PaymentMethod } from '@/lib/types'
import { isCanadianProvince } from '@/lib/constants'
import { cn } from '@/lib/utils'

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
  const { control, clearErrors, setValue, watch } = useFormContext<RegistrationFormData>()
  const currentValue = watch('paymentMethod')
  const state = watch('state')
  const isAlumni = watch('isAlumni')
  const isLevelMember = watch('isLevelMember')

  const isCanadian = isCanadianProvince(state || '')
  const showLoyalty = isAlumni === true || isLevelMember === true

  const paymentOptions = useMemo(() => {
    const options: { id: 'credit' | 'loyalty'; name: string; description: string }[] = [
      {
        id: 'credit',
        name: 'Credit Card',
        description: "We'll send you a secure payment link",
      },
    ]

    if (showLoyalty) {
      options.push({
        id: 'loyalty',
        name: isCanadian ? "L'Oréal Loyalty Points" : 'Level Loyalty Points',
        description: isCanadian
          ? "Use your accumulated L'Oréal loyalty points (Redken C5A, L'Oréal Excellence, Club Matrix)"
          : 'Use your accumulated Level points',
      })
    }

    return options
  }, [showLoyalty, isCanadian])

  // Clear paymentMethod if loyalty option becomes hidden while it was selected
  useEffect(() => {
    if (!showLoyalty && (currentValue === 'loyalty' || currentValue === 'combo')) {
      setValue('paymentMethod', undefined, { shouldDirty: true })
    }
  }, [showLoyalty, currentValue, setValue])

  const handleToggle = (optionId: 'credit' | 'loyalty') => {
    const currentSelected = getSelectedFromValue(currentValue)
    const next = new Set(currentSelected)

    if (next.has(optionId)) {
      next.delete(optionId)
    } else {
      next.add(optionId)
    }

    const newValue = getValueFromSelected(next)
    // Use setValue instead of field.onChange for more reliable undefined handling
    setValue('paymentMethod', newValue, { shouldDirty: true })
    
    // Clear error when a valid payment method is selected
    if (newValue !== undefined) {
      clearErrors('paymentMethod')
    }
  }

  return (
    <Controller
      name="paymentMethod"
      control={control}
      render={({ fieldState: { error } }) => {
        // Derive selected state from form value (single source of truth)
        const selectedOptions = getSelectedFromValue(currentValue)

        return (
          <div className="space-y-4" data-field="paymentMethod">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Payment Method</h3>
              <p className="text-sm text-zinc-500">
                {showLoyalty
                  ? `Select both if paying with a combination of credit card and ${isCanadian ? "L'Oréal loyalty" : 'Level'} points`
                  : 'Payment will be processed via credit card'}
              </p>
            </div>
            {error && (
              <p className="text-brand-orange text-sm">{error.message}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggle(option.id)}
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
