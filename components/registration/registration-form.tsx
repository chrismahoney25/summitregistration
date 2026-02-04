'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm, FormProvider, FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSummits } from '@/hooks/use-summits'
import { usePriceCalculation } from '@/hooks/use-price-calculation'
import { registrationSchema, RegistrationFormSchema } from '@/lib/validations'
import { z } from 'zod'
import { formatDateRange, cn } from '@/lib/utils'
import { isCanadianProvince } from '@/lib/constants'
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
  const hasUserChangedSummit = useRef(false)

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
  const paymentMethod = form.watch('paymentMethod')

  const pricing = usePriceCalculation(registrationType, additionalCount ?? 0)
  const selectedSummit = summits.find((s) => s.id === selectedSummitId)

  useEffect(() => {
    if (summitParam && summits.length > 0 && !selectedSummitId && !isValidatingSummitParam && !hasUserChangedSummit.current) {
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

  // Field order for scroll-to-first-error (matches form layout)
  const fieldOrder = [
    'summitId',
    'salonName',
    'city',
    'state',
    'isAlumni',
    'isLevelMember',
    'totalAttendees',
    'primaryAttendee.firstName',
    'primaryAttendee.lastName',
    'primaryAttendee.email',
    'additionalAttendees',
    'paymentMethod',
  ]

  // Scroll to the first field with an error
  const scrollToFirstError = useCallback(() => {
    const errors = form.formState.errors

    for (const fieldName of fieldOrder) {
      // Special handling for additionalAttendees array
      if (fieldName === 'additionalAttendees') {
        const attendeeErrors = errors.additionalAttendees
        if (Array.isArray(attendeeErrors)) {
          // Find the first attendee with an error
          const firstErrorIndex = attendeeErrors.findIndex(err => err?.fullName)
          if (firstErrorIndex !== -1) {
            const element = document.querySelector(
              `[name="additionalAttendees.${firstErrorIndex}.fullName"]`
            )
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              if (element instanceof HTMLElement && 'focus' in element) {
                setTimeout(() => (element as HTMLElement).focus(), 300)
              }
              return
            }
            // Fallback to section wrapper
            const sectionElement = document.querySelector(`[data-field="additionalAttendees"]`)
            if (sectionElement) {
              sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              return
            }
          }
        }
        continue
      }

      // Check if this field has an error (handle nested paths like primaryAttendee.firstName)
      const hasError = fieldName.includes('.')
        ? fieldName.split('.').reduce((obj: Record<string, unknown> | undefined, key) => 
            obj?.[key] as Record<string, unknown> | undefined, errors as unknown as Record<string, unknown>)
        : errors[fieldName as keyof typeof errors]

      if (hasError) {
        // Try to find the element by name attribute first (inputs/selects)
        let element = document.querySelector(`[name="${fieldName}"]`)
        
        // For button groups and special fields, use data-field attribute
        if (!element) {
          element = document.querySelector(`[data-field="${fieldName}"]`)
        }
        
        // For summit selector, use the ref
        if (!element && fieldName === 'summitId') {
          element = selectorRef.current
        }

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Focus the element if it's focusable
          if (element instanceof HTMLElement && 'focus' in element) {
            setTimeout(() => (element as HTMLElement).focus(), 300)
          }
          break
        }
      }
    }
  }, [form.formState.errors])

  // Manual validation for conditional fields (bypasses Zod superRefine issues)
  const validateConditionalFields = useCallback((): boolean => {
    let isValid = true
    const values = form.getValues()

    // Clear previous manual errors first
    form.clearErrors(['isAlumni', 'isLevelMember', 'totalAttendees', 'paymentMethod'])

    // 1. isAlumni is always required
    if (values.isAlumni === undefined) {
      form.setError('isAlumni', {
        type: 'manual',
        message: 'Please indicate if you have attended a Summit before',
      })
      isValid = false
    }

    // 2. isLevelMember required when isAlumni === false
    if (values.isAlumni === false && values.isLevelMember === undefined) {
      const isCanadian = isCanadianProvince(values.state || '')
      form.setError('isLevelMember', {
        type: 'manual',
        message: isCanadian
          ? "Please indicate if you are a member of a L'Oréal loyalty program"
          : 'Please answer if you are a LEVEL Loyalty member',
      })
      isValid = false
    }

    // 3. totalAttendees required when visible
    const showAttendees = values.isAlumni !== undefined &&
      (values.isAlumni === true || values.isLevelMember !== undefined)
    if (showAttendees && values.totalAttendees === undefined) {
      form.setError('totalAttendees', {
        type: 'manual',
        message: 'Please select how many people are attending',
      })
      isValid = false
    }

    // 4. paymentMethod required when totalAttendees is set
    if (values.totalAttendees !== undefined && values.paymentMethod === undefined) {
      form.setError('paymentMethod', {
        type: 'manual',
        message: 'Please select a payment method',
      })
      isValid = false
    }

    return isValid
  }, [form])

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
          summitDate: selectedSummit?.startDate || '',
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

  // Fields that Zod validates (non-conditional)
  const zodValidatedFields: FieldPath<RegistrationFormSchema>[] = [
    'summitId',
    'salonName',
    'city',
    'state',
    'primaryAttendee.firstName',
    'primaryAttendee.lastName',
    'primaryAttendee.email',
    'additionalAttendees',
  ]

  // Wrapper that runs Zod validation first, then manual validation for conditional fields
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Trigger Zod validation ONLY for standard fields (excludes conditional fields)
    // This prevents Zod from clearing our manually-set errors on conditional fields
    const standardFieldsValid = await form.trigger(zodValidatedFields)

    // Run manual validation for conditional fields AFTER Zod validation
    // so our errors don't get cleared by the resolver
    const conditionalFieldsValid = validateConditionalFields()

    if (!standardFieldsValid || !conditionalFieldsValid) {
      // Scroll to first error after a brief delay to let errors render
      setTimeout(() => scrollToFirstError(), 100)
      return
    }

    // Proceed with submission
    const data = form.getValues()
    await onSubmit(data as z.infer<typeof registrationSchema>)
  }

  if (submitSuccess) {
    const summitDate = selectedSummit
      ? (() => {
          const [year, month, day] = selectedSummit.startDate.split('-').map(Number)
          return new Date(year, month - 1, day).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
          })
        })()
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
      <form onSubmit={handleFormSubmit} style={{ overflowAnchor: 'none' }}>
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
                  onChangeClick={() => {
                    hasUserChangedSummit.current = true
                    form.setValue('summitId', '')
                    setShowSummitSelector(true)
                  }}
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
            <PriceSummary pricing={pricing} paymentMethod={paymentMethod} />

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
              onClick={async () => {
                if (!selectedSummitId || !pricing) {
                  // Trigger only standard fields, then validate conditional fields
                  await form.trigger(zodValidatedFields)
                  validateConditionalFields()
                  // Scroll to first error after a brief delay to let errors render
                  setTimeout(() => scrollToFirstError(), 100)
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
