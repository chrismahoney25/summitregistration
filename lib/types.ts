export interface Summit {
  id: string
  startDate: string
  location: string
}

export interface Attendee {
  fullName: string
}

export interface PrimaryAttendee {
  firstName: string
  lastName: string
  email: string
}

export interface PriceCalculation {
  base: number
  additional: number
  total: number
  baseAttendees: number
  additionalAttendees: number
  registrationTypeName: string
}

export type RegistrationType =
  | 'non-level-member'
  | 'level-member'
  | 'level-member-solo'
  | 'alumni'

export type PaymentMethod = 'credit' | 'loyalty'

// RegistrationFormData is exported from validations.ts as RegistrationFormSchema
// Re-export here for backwards compatibility
export type { RegistrationFormSchema as RegistrationFormData } from './validations'

export interface RegistrationTypeOption {
  id: RegistrationType
  name: string
  price: number
  attendees: number
  description: string
}
