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

export interface RegistrationFormData {
  summitId: string
  salonName: string
  city: string
  state: string
  primaryAttendee: PrimaryAttendee
  registrationType?: RegistrationType
  additionalAttendeeCount: number
  additionalAttendees: Attendee[]
  paymentMethod: PaymentMethod
  // User-facing registration type fields
  isAlumni?: boolean
  isLevelMember?: boolean
  totalAttendees?: number
}

export interface RegistrationTypeOption {
  id: RegistrationType
  name: string
  price: number
  attendees: number
  description: string
}
