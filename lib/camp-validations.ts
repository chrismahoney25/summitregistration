import { z } from 'zod'
import { US_STATES } from './constants'
import {
  CAMP_ESSENCE_MAX_ATTENDEES,
  CAMP_ESSENCE_PAYMENT_METHODS,
} from './camp-essence'

const stateValues = US_STATES.map((s) => s.value) as [string, ...string[]]

function isValidUsCaPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (!/^[+()\-\s.\d]+$/.test(trimmed)) return false

  const digits = trimmed.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
}

const additionalAttendeeSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(isValidUsCaPhone, 'Please enter a valid US/CA phone number'),
})

const primaryAttendeeSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  phone: z
    .string()
    .min(1, 'Mobile phone is required')
    .refine(isValidUsCaPhone, 'Please enter a valid US/CA mobile phone number'),
})

export const campRegistrationSchema = z
  .object({
    salonName: z
      .string()
      .min(2, 'Salon name must be at least 2 characters')
      .max(100, 'Salon name must be less than 100 characters'),
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must be less than 50 characters'),
    state: z.enum(stateValues, {
      error: 'Please select a state/province',
    }),
    primaryAttendee: primaryAttendeeSchema,
    totalAttendees: z
      .number()
      .int('Please select a whole number')
      .min(1, 'At least 1 attendee is required')
      .max(CAMP_ESSENCE_MAX_ATTENDEES, `Maximum ${CAMP_ESSENCE_MAX_ATTENDEES} attendees`),
    additionalAttendees: z
      .array(additionalAttendeeSchema)
      .max(CAMP_ESSENCE_MAX_ATTENDEES - 1, `Maximum ${CAMP_ESSENCE_MAX_ATTENDEES - 1} additional attendees`),
    paymentMethod: z.enum(CAMP_ESSENCE_PAYMENT_METHODS, {
      error: 'Please select a payment method',
    }),
    cancellationPolicyAccepted: z
      .boolean()
      .refine((value) => value === true, {
        message:
          'You must acknowledge the cancellation and refund policy to continue',
      }),
  })
  .refine(
    (data) => data.additionalAttendees.length === Math.max(0, data.totalAttendees - 1),
    {
      message: 'Please provide details for all additional attendees',
      path: ['additionalAttendees'],
    }
  )

export type CampRegistrationFormSchema = z.infer<typeof campRegistrationSchema>
