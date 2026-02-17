export const CAMP_ESSENCE_FORM_GUID = 'd994766d-5dce-4837-a6d3-4cd464a75b79'

export const CAMP_ESSENCE_EVENT_NAME = 'Camp Essence'
export const CAMP_ESSENCE_LOCATION = 'Colorado'
export const CAMP_ESSENCE_START_DATE = '2026-07-23'
export const CAMP_ESSENCE_END_DATE = '2026-07-26'
export const CAMP_ESSENCE_EVENT_DATE_TIMESTAMP_MS = Date.UTC(2026, 6, 23)

export const CAMP_ESSENCE_PRICE_PER_ATTENDEE = 1950
export const CAMP_ESSENCE_MAX_ATTENDEES = 6

export const CAMP_ESSENCE_PAYMENT_METHODS = [
  'credit_card',
  'loyalty_points',
  'credit_card_payment_plan',
] as const

export type CampEssencePaymentMethod =
  (typeof CAMP_ESSENCE_PAYMENT_METHODS)[number]

export const CAMP_ESSENCE_PAYMENT_OPTIONS: Array<{
  id: CampEssencePaymentMethod
  label: string
  description: string
}> = [
  {
    id: 'credit_card',
    label: 'Credit Card',
    description: "We'll send you a secure payment link.",
  },
  {
    id: 'loyalty_points',
    label: 'Loyalty Points',
    description: 'Apply eligible loyalty points toward your registration.',
  },
  {
    id: 'credit_card_payment_plan',
    label: 'Credit Card Payment Plan',
    description: 'Split payment across installments on a credit card.',
  },
]

export const CAMP_ESSENCE_CANCELLATION_COPY = {
  title: 'Cancellation & Refund Policy',
  intro:
    'Cancellations must be submitted in writing and are subject to the following refund schedule, based on the number of days prior to the event start date:',
  schedule: [
    '90 days or more prior to the event: 100% refund',
    '89–31 days prior to the event: 50% refund',
    '30 days or fewer prior to the event: No refund',
  ],
  noExceptions:
    'No exceptions will be made for late cancellations or no-shows. All refunds, if applicable, will be issued to the original form of payment.',
  requiredAcknowledgmentTitle: 'Required Acknowledgment (Checkbox Language)',
  requiredAcknowledgmentLabel:
    'I have read and understand the Cancellation & Refund Policy and agree to its terms.',
  acknowledgmentBody:
    'By checking this box, I acknowledge that I am responsible for adhering to the cancellation deadlines outlined above and understand that refunds are issued according to this policy.',
}
