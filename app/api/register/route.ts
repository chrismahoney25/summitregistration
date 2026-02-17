import { NextRequest, NextResponse } from 'next/server'
import { registrationSchema } from '@/lib/validations'
import { z } from 'zod'

const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID
const HUBSPOT_FORM_GUID = process.env.HUBSPOT_REGISTRATION_FORM_GUID

export async function POST(request: NextRequest) {
  if (!HUBSPOT_PORTAL_ID || !HUBSPOT_FORM_GUID) {
    console.error('Missing HubSpot form configuration')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()

    // Server-side validation
    const validatedData = registrationSchema.parse(body)

    // Get HubSpot tracking cookie (may not exist if user hasn't visited before)
    const hubspotutk = request.cookies.get('hubspotutk')?.value

    // Format additional attendees as numbered list with newlines
    const additionalAttendeesStr = validatedData.additionalAttendees
      .map((a, i) => `${i + 1}. ${a.fullName}`)
      .join('\n')

    // Map payment method to HubSpot values
    const paymentMethodMap: Record<string, string> = {
      credit: 'credit_card',
      // HubSpot Summit payment option internal value is "level".
      loyalty: 'level',
      combo: 'combo',
    }

    // Transform data to HubSpot Forms API format
    const formData = {
      fields: [
        { name: 'summit_registration_summit_name', value: body.summitName || '' },
        { name: 'summit_registration_summit_date', value: body.summitDate || '' },
        { name: 'summit_registration_salon_name', value: validatedData.salonName },
        { name: 'summit_registration_salon_city', value: validatedData.city },
        { name: 'summit_registration_salon_state', value: validatedData.state },
        { name: 'summit_registration_alumni', value: String(body.isAlumni ?? false) },
        { name: 'summit_registration_level_member', value: String(body.isLevelMember ?? false) },
        { name: 'summit_registration_number_of_attendees', value: String(body.totalAttendees || 1) },
        { name: 'firstname', value: validatedData.primaryAttendee.firstName },
        { name: 'lastname', value: validatedData.primaryAttendee.lastName },
        { name: 'email', value: validatedData.primaryAttendee.email },
        { name: 'mobilephone', value: validatedData.primaryAttendee.phone },
        { name: 'summit_registration_additional_attendees', value: additionalAttendeesStr },
        { name: 'summit_registration_payment_method', value: validatedData.paymentMethod ? (paymentMethodMap[validatedData.paymentMethod] || validatedData.paymentMethod) : '' },
        { name: 'summit_registration_total_amount', value: String(body.totalPrice || 0) },
      ],
      context: {
        ...(hubspotutk && { hutk: hubspotutk }),
        pageUri: request.headers.get('referer') || '',
        pageName: 'Summit Registration',
      },
    }

    // Submit to HubSpot Forms API
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('HubSpot submission error:', errorData)
      throw new Error('Failed to submit registration')
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully',
    })
  } catch (error) {
    console.error('Registration error:', error)

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
