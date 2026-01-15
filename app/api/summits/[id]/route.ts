import { NextResponse } from 'next/server'

const HUBSPOT_API_KEY = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const SUMMIT_OBJECT_TYPE_ID = process.env.HUBSPOT_SUMMIT_OBJECT_TYPE_ID

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!HUBSPOT_API_KEY || !SUMMIT_OBJECT_TYPE_ID) {
    console.error('Missing HubSpot configuration')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/${SUMMIT_OBJECT_TYPE_ID}/${id}?properties=hs_object_id,start_date,location`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Summit not found' },
        { status: 404 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HubSpot API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch summit' },
        { status: 500 }
      )
    }

    const data = await response.json()

    const summit = {
      id: data.properties.hs_object_id || data.id,
      startDate: data.properties.start_date,
      location: data.properties.location,
    }

    return NextResponse.json({ summit })
  } catch (error) {
    console.error('Error fetching summit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summit' },
      { status: 500 }
    )
  }
}
