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
    
    // Build query parameters (no need for extra encoding since URLSearchParams handles it)
    const params = new URLSearchParams({
      ayanamsa: '1', // Lahiri ayanamsa
      coordinates: `${latitude},${longitude}`,
      datetime: isoDateTime
    })

    console.log('Query parameters:', params.toString())

    // Try Prokerala birth details endpoint (GET method with query parameters)
    try {
      console.log('Calling Prokerala birth details endpoint')
      const url = `${PROKERALA_API_URL}/birth-details?${params.toString()}`
      console.log('API URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      // Also try the planetary positions endpoint as a fallback
      if (!response.ok) {
        console.log('Trying Prokerala planetary positions endpoint as fallback...')
        const planetaryUrl = `${PROKERALA_API_URL}/planetary-positions?${params.toString()}`
        const planetaryResponse = await fetch(planetaryUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (planetaryResponse.ok) {
          const planetaryData = await planetaryResponse.json()
          console.log('✅ Planetary positions API response:', planetaryData)
          const formattedData = formatProkeralaData(planetaryData)
          if (formattedData) {
            return NextResponse.json(formattedData)
          }
        } else {
          console.warn('❌ Planetary positions API also failed:', planetaryResponse.status, planetaryResponse.statusText)
          const errorText = await planetaryResponse.text()
          console.warn('❌ Planetary API error response:', errorText)
        }
      }

      if (response.ok) {
        const data = await response.json()
        console.log('Prokerala API response:', data)
        console.log('API response structure:', JSON.stringify(data, null, 2))
        
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
    
    const planets = []
    
    // Prokerala returns data in a specific format
    if (data.planets) {
      console.log('Processing planets:', data.planets.length)
      data.planets.forEach((planet, index) => {
        console.log(`Planet ${index}:`, planet)
        planets.push({
          planet: planet.name || planet.planet || planet.planet_name,
          rashi: planet.sign || planet.rashi || planet.zodiac,
          degree: parseFloat(planet.degree || planet.longitude || planet.position) || 0,
          nakshatra: planet.nakshatra || planet.nakshatra_name || 'Unknown'
        })
      })
    } else if (data.planetary_positions) {
      // Alternative format
      console.log('Processing planetary_positions:', data.planetary_positions.length)
      data.planetary_positions.forEach((planet, index) => {
        console.log(`Planet ${index}:`, planet)
        planets.push({
          planet: planet.name || planet.planet || planet.planet_name,
          rashi: planet.sign || planet.rashi || planet.zodiac,
          degree: parseFloat(planet.degree || planet.longitude || planet.position) || 0,
          nakshatra: planet.nakshatra || planet.nakshatra_name || 'Unknown'
        })
      })
    }

    // Handle ascendant data
    let ascendant = {
      rashi: 'Unknown',
      degree: 0,
      nakshatra: 'Unknown'
    }

    if (data.ascendant) {
      console.log('Processing ascendant:', data.ascendant)
      ascendant = {
        rashi: data.ascendant.sign || data.ascendant.rashi || data.ascendant.zodiac || 'Unknown',
        degree: parseFloat(data.ascendant.degree || data.ascendant.longitude || data.ascendant.position) || 0,
        nakshatra: data.ascendant.nakshatra || data.ascendant.nakshatra_name || 'Unknown'
      }
    } else if (data.houses && data.houses.length > 0) {
      // If no ascendant, use first house
      const firstHouse = data.houses[0]
      console.log('Using first house as ascendant:', firstHouse)
      ascendant = {
        rashi: firstHouse.sign || firstHouse.rashi || firstHouse.zodiac || 'Unknown',
        degree: parseFloat(firstHouse.degree || firstHouse.longitude || firstHouse.position) || 0,
        nakshatra: firstHouse.nakshatra || firstHouse.nakshatra_name || 'Unknown'
      }
    } else if (data.lagna) {
      // Alternative ascendant field
      console.log('Processing lagna:', data.lagna)
      ascendant = {
        rashi: data.lagna.sign || data.lagna.rashi || data.lagna.zodiac || 'Unknown',
        degree: parseFloat(data.lagna.degree || data.lagna.longitude || data.lagna.position) || 0,
        nakshatra: data.lagna.nakshatra || data.lagna.nakshatra_name || 'Unknown'
      }
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