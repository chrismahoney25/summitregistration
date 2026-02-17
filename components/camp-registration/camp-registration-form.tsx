'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import {
  CAMP_ESSENCE_END_DATE,
  CAMP_ESSENCE_EVENT_NAME,
  CAMP_ESSENCE_LOCATION,
  CAMP_ESSENCE_MAX_ATTENDEES,
  CAMP_ESSENCE_PRICE_PER_ATTENDEE,
  CAMP_ESSENCE_START_DATE,
} from '@/lib/camp-essence'
import {
  campRegistrationSchema,
  CampRegistrationFormSchema,
} from '@/lib/camp-validations'
import { CampSalonInfoSection } from './camp-salon-info-section'
import { CampPrimaryAttendeeSection } from './camp-primary-attendee-section'
import { CampAdditionalAttendeesSection } from './camp-additional-attendees-section'
import { CampPaymentMethodSection } from './camp-payment-method-section'
import { CampPriceSummary } from './camp-price-summary'
import { CampCancellationPolicySection } from './camp-cancellation-policy-section'

function formatDateRange(startDate: string, endDate: string): string {
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
  const start = new Date(startYear, startMonth - 1, startDay)
  const end = new Date(endYear, endMonth - 1, endDay)

  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`
  }

  return `${start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })} - ${end.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`
}

export function CampRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<CampRegistrationFormSchema>({
    resolver: zodResolver(campRegistrationSchema),
    defaultValues: {
      salonName: '',
      city: '',
      state: '',
      primaryAttendee: {
        firstName: '',
        lastName: '',
        email: '',
      },
      totalAttendees: 1,
      additionalAttendees: [],
      cancellationPolicyAccepted: false,
    },
    mode: 'onBlur',
  })

  const totalAttendees = form.watch('totalAttendees') || 1
  const paymentMethod = form.watch('paymentMethod')
  const totalAmount = totalAttendees * CAMP_ESSENCE_PRICE_PER_ATTENDEE

  const attendeeOptions = useMemo(
    () =>
      Array.from({ length: CAMP_ESSENCE_MAX_ATTENDEES }, (_, i) => i + 1).map(
        (count) => ({
          count,
          label: `${count} ${count === 1 ? 'person' : 'people'}`,
        })
      ),
    []
  )

  const onSubmit = async (data: CampRegistrationFormSchema) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/register/camp-essence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit registration')
      }

      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDateRange = formatDateRange(
    CAMP_ESSENCE_START_DATE,
    CAMP_ESSENCE_END_DATE
  )

  if (submitSuccess) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-brand-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Congratulations!</h2>
        <p className="text-zinc-600 max-w-md mx-auto">
          You are preliminarily enrolled in {CAMP_ESSENCE_EVENT_NAME}. We will
          contact you within 2 business days with payment instructions and
          confirmation details. We look forward to seeing you in {CAMP_ESSENCE_LOCATION}{' '}
          on {formattedDateRange}.
        </p>
      </Card>
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 text-center">
              Camp Essence Registration
            </h1>

            <div className="bg-brand-teal/10 rounded-xl p-4">
              <p className="text-xs font-medium text-brand-teal uppercase tracking-wider mb-1">
                Your Event
              </p>
              <p className="font-semibold text-zinc-900">
                {CAMP_ESSENCE_EVENT_NAME} · {CAMP_ESSENCE_LOCATION}
              </p>
              <p className="text-sm text-zinc-600">{formattedDateRange}</p>
            </div>

            <CampSalonInfoSection />
            <CampPrimaryAttendeeSection />

            <div className="space-y-3" data-field="totalAttendees">
              <label
                htmlFor="camp-total-attendees"
                className="block text-sm font-medium text-zinc-700"
              >
                How many people are attending?
              </label>
              <select
                id="camp-total-attendees"
                {...form.register('totalAttendees', { valueAsNumber: true })}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors bg-white appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
                  form.formState.errors.totalAttendees
                    ? 'border-brand-orange focus:border-brand-orange'
                    : 'border-zinc-200 focus:border-brand-teal'
                )}
              >
                {attendeeOptions.map((option) => (
                  <option key={option.count} value={option.count}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-zinc-500">
                {formatCurrency(CAMP_ESSENCE_PRICE_PER_ATTENDEE)} per attendee
                ({formatCurrency(totalAmount)} total).
              </p>
              {form.formState.errors.totalAttendees && (
                <p className="text-brand-orange text-sm">
                  {form.formState.errors.totalAttendees.message}
                </p>
              )}
            </div>

            <CampAdditionalAttendeesSection />
            <CampPaymentMethodSection />
            <CampPriceSummary
              totalAttendees={totalAttendees}
              paymentMethod={paymentMethod}
            />
            <CampCancellationPolicySection />

            {submitError && (
              <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-4">
                <p className="text-brand-orange-dark">{submitError}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
              Complete Registration
            </Button>
          </div>
        </Card>
      </form>
    </FormProvider>
  )
}
