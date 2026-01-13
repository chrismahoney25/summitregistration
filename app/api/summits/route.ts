import { NextResponse } from 'next/server'

const HUBSPOT_API_KEY = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const SUMMIT_OBJECT_TYPE_ID = process.env.HUBSPOT_SUMMIT_OBJECT_TYPE_ID

// Simple in-memory cache
let cachedSummits: any[] | null = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  if (!HUBSPOT_API_KEY || !SUMMIT_OBJECT_TYPE_ID) {
    console.error('Missing HubSpot configuration')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  // Return cached data if fresh
  const now = Date.now()
  if (cachedSummits && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json({ summits: cachedSummits })
  }

  try {
    // Get today's date at midnight as Unix timestamp in milliseconds
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // Use HubSpot Search API with timestamp filter
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/${SUMMIT_OBJECT_TYPE_ID}/search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'start_date',
                  operator: 'GTE',
                  value: todayTimestamp.toString(),
                },
              ],
            },
          ],
          sorts: [
            {
              propertyName: 'start_date',
              direction: 'ASCENDING',
            },
          ],
          properties: ['hs_object_id', 'start_date', 'location'],
          limit: 100,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HubSpot Search API error:', response.status, errorText)

      // Fallback to regular endpoint if search fails
      return await fetchWithPagination()
    }

    const data = await response.json()

    const summits = data.results.map((summit: any) => ({
      id: summit.properties.hs_object_id || summit.id,
      startDate: summit.properties.start_date,
      location: summit.properties.location,
    }))

    // Cache the results
    cachedSummits = summits
    cacheTime = now

    console.log(`Found ${summits.length} future summits via Search API`)
    return NextResponse.json({ summits })
  } catch (error) {
    console.error('Error fetching summits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summits' },
      { status: 500 }
    )
  }
}

// Fallback: paginate through all results
async function fetchWithPagination() {
  const allResults: any[] = []
  let after: string | undefined = undefined

  do {
    const url = new URL(
      `https://api.hubapi.com/crm/v3/objects/${SUMMIT_OBJECT_TYPE_ID}`
    )
    url.searchParams.set('properties', 'hs_object_id,start_date,location')
    url.searchParams.set('limit', '100')
    if (after) {
      url.searchParams.set('after', after)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`)
    }

    const data = await response.json()
    allResults.push(...data.results)
    after = data.paging?.next?.after
  } while (after)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureSummits = allResults
    .filter((summit) => new Date(summit.properties.start_date) >= today)
    .map((summit) => ({
      id: summit.properties.hs_object_id || summit.id,
      startDate: summit.properties.start_date,
      location: summit.properties.location,
    }))
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

  // Cache the results
  cachedSummits = futureSummits
  cacheTime = Date.now()

  console.log(`Found ${futureSummits.length} future summits via pagination fallback`)
  return NextResponse.json({ summits: futureSummits })
}
