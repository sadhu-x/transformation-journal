// Server-side API route to handle Prokerala API calls
// This avoids CORS issues and keeps API keys secure

import { NextResponse } from 'next/server'

const PROKERALA_API_URL = 'https://api.prokerala.com/v2/astrology'
const PROKERALA_CLIENT_ID = process.env.PROKERALA_CLIENT_ID
const PROKERALA_CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET

// Cache for access token
let accessToken = null
let tokenExpiry = null

async function getAccessToken() {
  // Check if we have a valid cached token
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    console.log('Using cached access token')
    return accessToken
  }

  console.log('Getting new access token...')
  console.log('Client ID available:', !!PROKERALA_CLIENT_ID)
  console.log('Client Secret available:', !!PROKERALA_CLIENT_SECRET)

  if (!PROKERALA_CLIENT_ID || !PROKERALA_CLIENT_SECRET) {
    throw new Error('Prokerala credentials not configured')
  }

  try {
    const tokenResponse = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PROKERALA_CLIENT_ID,
        client_secret: PROKERALA_CLIENT_SECRET
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token request failed:', tokenResponse.status, errorText)
      throw new Error(`Failed to get access token: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Access token obtained successfully')
    
    // Cache the token with expiry
    accessToken = tokenData.access_token
    tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 60) * 1000) // Expire 1 minute early
    
    return accessToken
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

export async function POST(request) {
  try {
    const { birthDate, birthTime, latitude, longitude } = await request.json()

    console.log('=== Astrology API Request ===')
    console.log('Birth data:', { birthDate, birthTime, latitude, longitude })
    
    // Enhanced debugging for environment variables
    console.log('Environment check:')
    console.log('- PROKERALA_CLIENT_ID exists:', !!process.env.PROKERALA_CLIENT_ID)
    console.log('- PROKERALA_CLIENT_SECRET exists:', !!process.env.PROKERALA_CLIENT_SECRET)
    console.log('- PROKERALA_CLIENT_ID length:', process.env.PROKERALA_CLIENT_ID ? process.env.PROKERALA_CLIENT_ID.length : 0)
    console.log('- PROKERALA_CLIENT_SECRET length:', process.env.PROKERALA_CLIENT_SECRET ? process.env.PROKERALA_CLIENT_SECRET.length : 0)
    console.log('- All env vars:', Object.keys(process.env).filter(key => key.includes('PROKERALA')))

    if (!birthDate || !birthTime || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required birth data' },
        { status: 400 }
      )
    }

    if (!PROKERALA_CLIENT_ID || !PROKERALA_CLIENT_SECRET) {
      console.warn('Prokerala credentials not found')
      console.warn('Available environment variables:', Object.keys(process.env).filter(key => key.includes('PROKERALA')))
      return NextResponse.json(
        { error: 'Astrology API credentials not configured. Please set up PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET in your environment variables.' },
        { status: 503 }
      )
    }

    // Get access token
    let token
    try {
      token = await getAccessToken()
    } catch (tokenError) {
      console.error('Failed to get access token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to authenticate with astrology API. Please check your credentials.' },
        { status: 503 }
      )
    }

    // Format date and time for ISO 8601 format
    const dateTime = new Date(`${birthDate}T${birthTime}`)
    const isoDateTime = dateTime.toISOString().replace('Z', '+00:00')
    
    // Debug datetime formatting
    console.log('Original datetime:', `${birthDate}T${birthTime}`)
    console.log('ISO datetime:', isoDateTime)
    
    // Build query parameters (no need for extra encoding since URLSearchParams handles it)
    const params = new URLSearchParams({
      ayanamsa: '1', // Lahiri ayanamsa
      coordinates: `${latitude},${longitude}`,
      datetime: isoDateTime
    })

    console.log('Query parameters:', params.toString())
    console.log('Decoded datetime from params:', params.get('datetime'))

    // Try Prokerala kundli endpoint (POST method with JSON body)
    try {
      console.log('Calling Prokerala kundli endpoint with POST')
      const url = `${PROKERALA_API_URL}/kundli`
      console.log('API URL:', url)
      console.log('Request body:', {
        ayanamsa: 1,
        coordinates: `${latitude},${longitude}`,
        datetime: isoDateTime
      })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ayanamsa: 1,
          coordinates: `${latitude},${longitude}`,
          datetime: isoDateTime
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Also try the birth details endpoint as a fallback
      if (!response.ok) {
        console.log('Trying Prokerala birth details endpoint as fallback...')
        const birthDetailsUrl = `${PROKERALA_API_URL}/birth-details?${params.toString()}`
        const birthDetailsResponse = await fetch(birthDetailsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (birthDetailsResponse.ok) {
          const birthDetailsData = await birthDetailsResponse.json()
          console.log('✅ Birth details API response:', birthDetailsData)
          const formattedData = formatProkeralaData(birthDetailsData)
          if (formattedData) {
            return NextResponse.json(formattedData)
          }
        } else {
          console.warn('❌ Birth details API also failed:', birthDetailsResponse.status, birthDetailsResponse.statusText)
          const errorText = await birthDetailsResponse.text()
          console.warn('❌ Birth details API error response:', errorText)
        }
      }

      if (response.ok) {
        const data = await response.json()
        console.log('Prokerala API response:', data)
        console.log('API response structure:', JSON.stringify(data, null, 2))
        console.log('Response keys:', Object.keys(data))
        
        // Check for different possible response structures
        if (data.data) {
          console.log('Found data.data structure:', data.data)
          console.log('data.data keys:', Object.keys(data.data))
        }
        if (data.result) {
          console.log('Found data.result structure:', data.result)
          console.log('data.result keys:', Object.keys(data.result))
        }
        
        // Format the response
        const formattedData = formatProkeralaData(data)
        console.log('Formatted data:', formattedData)
        if (formattedData) {
          return NextResponse.json(formattedData)
        }
      } else {
        console.warn('❌ Prokerala API failed:', response.status, response.statusText)
        const errorText = await response.text()
        console.warn('❌ API error response:', errorText)
        console.warn('❌ Response headers:', Object.fromEntries(response.headers.entries()))
      }
    } catch (apiError) {
      console.warn('Prokerala API error:', apiError)
    }

    // If all endpoints fail, return error
    console.log('All Prokerala endpoints failed')
    return NextResponse.json(
      { error: 'Unable to fetch astrology data. Please check your API configuration and try again.' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Astrology API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch astrology data' },
      { status: 500 }
    )
  }
}

function formatProkeralaData(data) {
  try {
    console.log('Formatting Prokerala data, input structure:', Object.keys(data))
    
    // Handle different response structures
    let actualData = data
    if (data.data) {
      console.log('Using data.data structure')
      actualData = data.data
    } else if (data.result) {
      console.log('Using data.result structure')
      actualData = data.result
    }
    
    console.log('Processing actual data structure:', Object.keys(actualData))
    
    const planets = []
    
    // Prokerala returns data in a specific format
    if (actualData.planets) {
      console.log('Processing planets:', actualData.planets.length)
      actualData.planets.forEach((planet, index) => {
        console.log(`Planet ${index}:`, planet)
        planets.push({
          planet: planet.name || planet.planet || planet.planet_name,
          rashi: planet.sign || planet.rashi || planet.zodiac,
          degree: parseFloat(planet.degree || planet.longitude || planet.position) || 0,
          nakshatra: planet.nakshatra || planet.nakshatra_name || 'Unknown'
        })
      })
    } else if (actualData.planetary_positions) {
      // Alternative format
      console.log('Processing planetary_positions:', actualData.planetary_positions.length)
      actualData.planetary_positions.forEach((planet, index) => {
        console.log(`Planet ${index}:`, planet)
        planets.push({
          planet: planet.name || planet.planet || planet.planet_name,
          rashi: planet.sign || planet.rashi || planet.zodiac,
          degree: parseFloat(planet.degree || planet.longitude || planet.position) || 0,
          nakshatra: planet.nakshatra || planet.nakshatra_name || 'Unknown'
        })
      })
    } else {
      console.log('No planets found in response. Available keys:', Object.keys(actualData))
    }

    // Handle ascendant data
    let ascendant = {
      rashi: 'Unknown',
      degree: 0,
      nakshatra: 'Unknown'
    }

    if (actualData.ascendant) {
      console.log('Processing ascendant:', actualData.ascendant)
      ascendant = {
        rashi: actualData.ascendant.sign || actualData.ascendant.rashi || actualData.ascendant.zodiac || 'Unknown',
        degree: parseFloat(actualData.ascendant.degree || actualData.ascendant.longitude || actualData.ascendant.position) || 0,
        nakshatra: actualData.ascendant.nakshatra || actualData.ascendant.nakshatra_name || 'Unknown'
      }
    } else if (actualData.houses && actualData.houses.length > 0) {
      // If no ascendant, use first house
      const firstHouse = actualData.houses[0]
      console.log('Using first house as ascendant:', firstHouse)
      ascendant = {
        rashi: firstHouse.sign || firstHouse.rashi || firstHouse.zodiac || 'Unknown',
        degree: parseFloat(firstHouse.degree || firstHouse.longitude || firstHouse.position) || 0,
        nakshatra: firstHouse.nakshatra || firstHouse.nakshatra_name || 'Unknown'
      }
    } else if (actualData.lagna) {
      // Alternative ascendant field
      console.log('Processing lagna:', actualData.lagna)
      ascendant = {
        rashi: actualData.lagna.sign || actualData.lagna.rashi || actualData.lagna.zodiac || 'Unknown',
        degree: parseFloat(actualData.lagna.degree || actualData.lagna.longitude || actualData.lagna.position) || 0,
        nakshatra: actualData.lagna.nakshatra || actualData.lagna.nakshatra_name || 'Unknown'
      }
    } else {
      console.log('No ascendant data found. Available keys:', Object.keys(actualData))
    }

    console.log('Final ascendant:', ascendant)
    console.log('Final planets count:', planets.length)

    return {
      ascendant,
      planets,
      houses: generateHouses(ascendant.degree)
    }
  } catch (error) {
    console.error('Error formatting Prokerala data:', error)
    return null
  }
}

function generateHouses(ascendantDegree) {
  const houses = []
  const RASHIS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ]
  
  for (let i = 1; i <= 12; i++) {
    const houseLongitude = (ascendantDegree + (i - 1) * 30) % 360
    const rashiIndex = Math.floor(houseLongitude / 30)
    houses.push({
      house: i,
      rashi: RASHIS[rashiIndex],
      degree: houseLongitude % 30
    })
  }
  
  return houses
} 