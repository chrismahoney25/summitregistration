import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { campRegistrationSchema } from '@/lib/camp-validations'
import {
  CAMP_ESSENCE_EVENT_DATE_TIMESTAMP_MS,
  CAMP_ESSENCE_FORM_GUID,
  CAMP_ESSENCE_LOCATION,
  CAMP_ESSENCE_PRICE_PER_ATTENDEE,
} from '@/lib/camp-essence'

const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID
const HUBSPOT_CAMP_ESSENCE_FORM_GUID =
  process.env.HUBSPOT_CAMP_ESSENCE_FORM_GUID || CAMP_ESSENCE_FORM_GUID

function formatAdditionalAttendees(
  attendees: Array<{ fullName: string; email: string; phone: string }>
): string {
  return attendees
    .map(
      (attendee, index) =>
        `Attendee ${index + 2}:\nName: ${attendee.fullName}\nEmail: ${attendee.email}\nPhone: ${attendee.phone}`
    )
    .join('\n\n')
}

export async function POST(request: NextRequest) {
  if (!HUBSPOT_PORTAL_ID || !HUBSPOT_CAMP_ESSENCE_FORM_GUID) {
    console.error('Missing HubSpot portal configuration')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const validatedData = campRegistrationSchema.parse(body)
    const hubspotutk = request.cookies.get('hubspotutk')?.value

    const totalAmount =
      validatedData.totalAttendees * CAMP_ESSENCE_PRICE_PER_ATTENDEE
    const additionalAttendeesStr = formatAdditionalAttendees(
      validatedData.additionalAttendees
    )

    const formData = {
      fields: [
        { name: 'camp_essence_registration_location', value: CAMP_ESSENCE_LOCATION },
        {
          name: 'camp_essence_registration_event_date',
          value: String(CAMP_ESSENCE_EVENT_DATE_TIMESTAMP_MS),
        },
        {
          name: 'camp_essence_registration_salon_name',
          value: validatedData.salonName,
        },
        { name: 'camp_essence_registration_salon_city', value: validatedData.city },
        { name: 'camp_essence_registration_salon_state', value: validatedData.state },
        {
          name: 'camp_essence_registration_number_of_attendees',
          value: String(validatedData.totalAttendees),
        },
        {
          name: 'camp_essence_registration_additional_attendees',
          value: additionalAttendeesStr,
        },
        {
          name: 'camp_essence_registration_payment_method',
          value: validatedData.paymentMethod,
        },
        {
          name: 'camp_essence_registration_total_amount',
          value: String(totalAmount),
        },
        {
          name: 'camp_essence_cancellation_policy',
          value: String(validatedData.cancellationPolicyAccepted),
        },
        { name: 'firstname', value: validatedData.primaryAttendee.firstName },
        { name: 'lastname', value: validatedData.primaryAttendee.lastName },
        { name: 'email', value: validatedData.primaryAttendee.email },
      ],
      context: {
        ...(hubspotutk && { hutk: hubspotutk }),
        pageUri: request.headers.get('referer') || '',
        pageName: 'Camp Essence Registration',
      },
    }

    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_CAMP_ESSENCE_FORM_GUID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      let parsedError: unknown = errorBody
      let errorMessage = errorBody

      try {
        const parsed = JSON.parse(errorBody) as { message?: string }
        parsedError = parsed
        if (parsed.message) {
          errorMessage = parsed.message
        }
      } catch {
        // Keep raw text when HubSpot error payload is not JSON.
      }

      const normalizedError = errorMessage.toLowerCase()
      const isFormNotFound =
        normalizedError.includes("can't be found") ||
        normalizedError.includes('cannot be found') ||
        normalizedError.includes('form with guid')

      console.error('HubSpot Camp submission error:', {
        status: response.status,
        portalId: HUBSPOT_PORTAL_ID,
        formGuid: HUBSPOT_CAMP_ESSENCE_FORM_GUID,
        error: parsedError,
      })

      if (isFormNotFound) {
        return NextResponse.json(
          {
            error:
              'Camp Essence form configuration error: HubSpot form was not found. Please verify HUBSPOT_CAMP_ESSENCE_FORM_GUID.',
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to submit registration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Camp Essence registration submitted successfully',
    })
  } catch (error) {
    console.error('Camp Essence registration error:', {
      portalId: HUBSPOT_PORTAL_ID,
      formGuid: HUBSPOT_CAMP_ESSENCE_FORM_GUID,
      error: error instanceof Error ? error.message : error,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}
