'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSummits } from '@/hooks/use-summits'
import { usePriceCalculation } from '@/hooks/use-price-calculation'
import { registrationSchema } from '@/lib/validations'
import { RegistrationFormData } from '@/lib/types'
import { formatDateRange } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SummitCard } from './summit-card'
import { SummitSelector } from './summit-selector'
import { SalonInfoSection } from './salon-info-section'
import { PrimaryAttendeeSection } from './primary-attendee-section'
import { RegistrationTypeSection } from './registration-type-section'
import { AdditionalAttendeesSection } from './additional-attendees-section'
import { PaymentMethodSection } from './payment-method-section'
import { PriceSummary } from './price-summary'

type ExtendedFormData = RegistrationFormData & {
  isAlumni?: boolean
  isLevelMember?: boolean
  totalAttendees?: number
}

export function RegistrationForm() {
  const searchParams = useSearchParams()
  const summitParam = searchParams.get('summit')

  const { summits, isLoading: summitsLoading } = useSummits()
  const [showSummitSelector, setShowSummitSelector] = useState(!summitParam)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<ExtendedFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      summitId: '',
      salonName: '',
      city: '',
      state: '',
      primaryAttendee: { firstName: '', lastName: '', email: '' },
      registrationType: undefined,
      additionalAttendeeCount: 0,
      additionalAttendees: [],
      paymentMethod: undefined,
      isAlumni: undefined,
      isLevelMember: undefined,
      totalAttendees: undefined,
    },
    mode: 'onBlur',
  })

  const registrationType = form.watch('registrationType')
  const additionalCount = form.watch('additionalAttendeeCount')
  const selectedSummitId = form.watch('summitId')
  const totalAttendees = form.watch('totalAttendees')

  const pricing = usePriceCalculation(registrationType, additionalCount)
  const selectedSummit = summits.find((s) => s.id === selectedSummitId)

  useEffect(() => {
    if (summitParam && summits.length > 0 && !selectedSummitId) {
      const matchingSummit = summits.find((s) => s.id === summitParam)
      if (matchingSummit) {
        form.setValue('summitId', matchingSummit.id)
        setShowSummitSelector(false)
      }
    }
  }, [summitParam, summits, selectedSummitId, form])

  const handleSummitSelect = (summitId: string) => {
    form.setValue('summitId', summitId, { shouldValidate: true })
    setShowSummitSelector(false)
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    // Get the extended form values
    const formValues = form.getValues()

    // Build summit name from location and date
    const summitName = selectedSummit
      ? `Summit - ${selectedSummit.location} - ${formatDateRange(selectedSummit.startDate)}`
      : ''

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          summitName,
          isAlumni: formValues.isAlumni,
          isLevelMember: formValues.isLevelMember,
          totalAttendees: formValues.totalAttendees,
          totalPrice: pricing?.total,
        }),
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
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Registration Submitted!
        </h2>
        <p className="text-zinc-600 max-w-md mx-auto">
          Thank you for registering for The Summit Immersive. You'll receive a
          confirmation email shortly with next steps.
        </p>
      </Card>
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ overflowAnchor: 'none' }}>
        <Card>
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 text-center">Summit Registration</h1>

            {/* Summit Selection */}
            {selectedSummit && !showSummitSelector ? (
              <SummitCard
                summit={selectedSummit}
                onChangeClick={() => setShowSummitSelector(true)}
                showChangeButton={summits.length > 1}
              />
            ) : (
              <SummitSelector
                summits={summits}
                selectedId={selectedSummitId}
                onSelect={handleSummitSelect}
                isLoading={summitsLoading}
              />
            )}

            <SalonInfoSection />
            <PrimaryAttendeeSection />
            <RegistrationTypeSection />
            {additionalCount > 0 && <AdditionalAttendeesSection />}
            {totalAttendees && <PaymentMethodSection />}
            <PriceSummary pricing={pricing} />

            {submitError && (
              <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-4">
                <p className="text-brand-orange-dark">{submitError}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              disabled={!selectedSummitId || !pricing}
            >
              Complete Registration
            </Button>
          </div>
        </Card>
      </form>
    </FormProvider>
  )
}
