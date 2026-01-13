import { z } from 'zod'
import { US_STATES } from './constants'

const stateValues = US_STATES.map((s) => s.value) as [string, ...string[]]

const attendeeSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
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
})

export const registrationSchema = z
  .object({
    summitId: z.string().min(1, 'Please select a summit'),

    salonName: z
      .string()
      .min(2, 'Salon name must be at least 2 characters')
      .max(100, 'Salon name must be less than 100 characters'),
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must be less than 50 characters'),
    state: z.enum(stateValues, 'Please select a valid state'),

    primaryAttendee: primaryAttendeeSchema,

    registrationType: z.enum(
      ['non-level-member', 'level-member', 'level-member-solo', 'alumni'],
      'Please select a registration type'
    ),

    additionalAttendeeCount: z
      .number()
      .min(0, 'Cannot be negative')
      .max(10, 'Maximum 10 additional attendees'),

    additionalAttendees: z.array(attendeeSchema).max(10),

    paymentMethod: z.enum(['credit', 'loyalty'], 'Please select a payment method'),
  })
  .refine(
    (data) => data.additionalAttendees.length === data.additionalAttendeeCount,
    {
      message: 'Please provide names for all additional attendees',
      path: ['additionalAttendees'],
    }
  )

export type RegistrationFormSchema = z.infer<typeof registrationSchema>
