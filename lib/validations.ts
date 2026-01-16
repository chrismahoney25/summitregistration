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
    state: z.enum(stateValues, {
      error: 'Please select a state/province',
    }),

    primaryAttendee: primaryAttendeeSchema,

    // These are derived from user selections, made optional for validation
    registrationType: z.enum(
      ['non-level-member', 'level-member', 'level-member-solo', 'alumni']
    ).optional(),

    additionalAttendeeCount: z
      .number()
      .min(0, 'Cannot be negative')
      .max(10, 'Maximum 10 additional attendees')
      .default(0),

    additionalAttendees: z.array(attendeeSchema).max(10),

    paymentMethod: z.enum(['credit', 'loyalty', 'combo'], {
      error: 'Please select a payment method',
    }),

    // User-facing fields for registration type selection
    isAlumni: z.boolean().optional(),
    isLevelMember: z.boolean().optional(),
    totalAttendees: z.number().min(1, 'Please select how many people are attending').optional(),
  })
  .refine(
    (data) => data.additionalAttendees.length === data.additionalAttendeeCount,
    {
      message: 'Please provide names for all additional attendees',
      path: ['additionalAttendees'],
    }
  )
  .refine(
    (data) => {
      // If not alumni, must answer level member question (only when visible)
      if (data.isAlumni === false && data.isLevelMember === undefined) {
        return false
      }
      return true
    },
    {
      message: 'Please answer if you are a LEVEL Loyalty member',
      path: ['isLevelMember'],
    }
  )
  .refine(
    (data) => {
      // totalAttendees is required only when the field is visible
      // Visible when: isAlumni is answered AND (isAlumni is true OR isLevelMember is answered)
      const isVisible = data.isAlumni !== undefined && (data.isAlumni === true || data.isLevelMember !== undefined)
      if (isVisible && data.totalAttendees === undefined) {
        return false
      }
      return true
    },
    {
      message: 'Please select how many people are attending',
      path: ['totalAttendees'],
    }
  )

export type RegistrationFormSchema = z.infer<typeof registrationSchema>
