// Server-side API route to handle Prokerala API calls
// This avoids CORS issues and keeps API keys secure

import { NextResponse } from 'next/server'

const PROKERALA_API_URL = 'https://api.prokerala.com/v2/astrology'
const PROKERALA_API_KEY = process.env.PROKERALA_API_KEY

export async function POST(request) {
  try {
    const { birthDate, birthTime, latitude, longitude } = await request.json()

    if (!birthDate || !birthTime || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required birth data' },
        { status: 400 }
      )
    }

    if (!PROKERALA_API_KEY) {
      console.warn('Prokerala API key not found')
      return NextResponse.json(
        { error: 'Astrology API key not configured. Please set up PROKERALA_API_KEY in your environment variables.' },
        { status: 503 }
      )
    }

    // Format date and time
    const dateTime = new Date(`${birthDate}T${birthTime}`)
    const day = dateTime.getDate()
    const month = dateTime.getMonth() + 1
    const year = dateTime.getFullYear()
    const hour = dateTime.getHours()
    const minute = dateTime.getMinutes()

    // Try Prokerala planetary positions endpoint
    try {
      console.log('Calling Prokerala planetary positions endpoint')
      
      const response = await fetch(`${PROKERALA_API_URL}/planetary-positions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PROKERALA_API_KEY}`
        },
        body: JSON.stringify({
          ayanamsa: 1, // Lahiri ayanamsa
          coordinates: `${latitude},${longitude}`,
          datetime: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`
        })
      })

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
        console.warn('Prokerala API failed:', response.status, response.statusText)
        const errorText = await response.text()
        console.warn('API error response:', errorText)
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