'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSummits } from '@/hooks/use-summits'
import { usePriceCalculation } from '@/hooks/use-price-calculation'
import { registrationSchema } from '@/lib/validations'
import { z } from 'zod'
import { formatDateRange, cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SummitCard } from './summit-card'
import { SummitSelector } from './summit-selector'
import { ExpiredSummitNotice } from './expired-summit-notice'
import { SalonInfoSection } from './salon-info-section'
import { PrimaryAttendeeSection } from './primary-attendee-section'
import { RegistrationTypeSection } from './registration-type-section'
import { AdditionalAttendeesSection } from './additional-attendees-section'
import { PaymentMethodSection } from './payment-method-section'
import { PriceSummary } from './price-summary'

export function RegistrationForm() {
  const searchParams = useSearchParams()
  const summitParam = searchParams.get('id')

  const { summits, isLoading: summitsLoading } = useSummits()
  const [showSummitSelector, setShowSummitSelector] = useState(!summitParam)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [expiredSummitInfo, setExpiredSummitInfo] = useState<{
    location: string
    startDate: string
  } | null>(null)
  const [showExpiredNotice, setShowExpiredNotice] = useState(false)
  const [isValidatingSummitParam, setIsValidatingSummitParam] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  const form = useForm({
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

  const pricing = usePriceCalculation(registrationType, additionalCount ?? 0)
  const selectedSummit = summits.find((s) => s.id === selectedSummitId)

  useEffect(() => {
    if (summitParam && summits.length > 0 && !selectedSummitId && !isValidatingSummitParam) {
      const matchingSummit = summits.find((s) => s.id === summitParam)

      if (matchingSummit) {
        // Valid future summit - select it
        form.setValue('summitId', matchingSummit.id)
        setShowSummitSelector(false)
      } else {
        // Summit not in available list - check if it exists (may be past/completed)
        setIsValidatingSummitParam(true)

        fetch(`/api/summits/${summitParam}`)
          .then((res) => {
            if (res.status === 404) {
              return { summit: null }
            }
            return res.json()
          })
          .then((data) => {
            if (data.summit) {
              // Summit exists but is past/completed
              setExpiredSummitInfo({
                location: data.summit.location,
                startDate: data.summit.startDate,
              })
            } else {
              // Summit not found at all
              setExpiredSummitInfo(null)
            }
            setShowExpiredNotice(true)
            setShowSummitSelector(true)
          })
          .catch(() => {
            // API error - show generic message
            setExpiredSummitInfo(null)
            setShowExpiredNotice(true)
            setShowSummitSelector(true)
          })
          .finally(() => {
            setIsValidatingSummitParam(false)
          })
      }
    }
  }, [summitParam, summits, selectedSummitId, form, isValidatingSummitParam])

  const handleSummitSelect = (summitId: string) => {
    form.setValue('summitId', summitId, { shouldValidate: true })
    setShowSummitSelector(false)
  }

  const handleExpiredNoticeDismiss = useCallback(() => {
    setShowExpiredNotice(false)
    // Scroll to selector
    setTimeout(() => {
      selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    setIsSubmitting(true)
    setSubmitError(null)

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
    const summitDate = selectedSummit
      ? new Date(selectedSummit.startDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        })
      : ''

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
        Congratulations! 
        </h2>
        <p className="text-zinc-600 max-w-md mx-auto">
          You are preliminarily enrolled in Summit Immersive.
          We will contact you within 2 business days with payment instructions
          and enrollment in Summit Online (Class App). You will receive a
          confirmation once payment is received.
          {selectedSummit && (
            <>
              {' '}We look forward to seeing you in {selectedSummit.location} on {summitDate}!
            </>
          )}
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
            <div ref={selectorRef}>
              {showExpiredNotice && (
                <ExpiredSummitNotice
                  summit={expiredSummitInfo}
                  onDismiss={handleExpiredNoticeDismiss}
                />
              )}

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
                  error={form.formState.errors.summitId?.message}
                />
              )}
            </div>

            <SalonInfoSection />
            <RegistrationTypeSection />
            <PrimaryAttendeeSection />
            {(additionalCount ?? 0) > 0 && <AdditionalAttendeesSection />}
            {totalAttendees && <PaymentMethodSection />}
            <PriceSummary pricing={pricing} />

            {submitError && (
              <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-4">
                <p className="text-brand-orange-dark">{submitError}</p>
              </div>
            )}

            <Button
              type={!selectedSummitId || !pricing ? 'button' : 'submit'}
              size="lg"
              className={cn('w-full', (!selectedSummitId || !pricing) && 'opacity-50 cursor-not-allowed')}
              isLoading={isSubmitting}
              onClick={() => {
                if (!selectedSummitId || !pricing) {
                  form.trigger()
                }
              }}
            >
              Complete Registration
            </Button>
          </div>
        </Card>
      </form>
    </FormProvider>
  )
}
