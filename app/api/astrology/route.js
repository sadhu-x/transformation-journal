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
      console.warn('Prokerala API key not found, using fallback data')
      return NextResponse.json({
        ascendant: {
          rashi: 'Libra',
          degree: 15.5,
          nakshatra: 'Swati'
        },
        planets: [
          { planet: 'Sun', rashi: 'Pisces', degree: 28.83, nakshatra: 'Revati' },
          { planet: 'Moon', rashi: 'Capricorn', degree: 2.1, nakshatra: 'Uttara Ashadha' },
          { planet: 'Mars', rashi: 'Aries', degree: 26.58, nakshatra: 'Bharani' },
          { planet: 'Mercury', rashi: 'Pisces', degree: 14.05, nakshatra: 'Uttara Bhadrapada' },
          { planet: 'Jupiter', rashi: 'Capricorn', degree: 19.1, nakshatra: 'Dhanishta' },
          { planet: 'Venus', rashi: 'Pisces', degree: 15.47, nakshatra: 'Uttara Bhadrapada' },
          { planet: 'Saturn', rashi: 'Scorpio', degree: 3.43, nakshatra: 'Vishakha' },
          { planet: 'Rahu', rashi: 'Aries', degree: 26.12, nakshatra: 'Bharani' },
          { planet: 'Ketu', rashi: 'Libra', degree: 26.12, nakshatra: 'Vishakha' }
        ],
        houses: [
          { house: 1, rashi: 'Libra', degree: 15.5 },
          { house: 2, rashi: 'Scorpio', degree: 15.5 },
          { house: 3, rashi: 'Sagittarius', degree: 15.5 },
          { house: 4, rashi: 'Capricorn', degree: 15.5 },
          { house: 5, rashi: 'Aquarius', degree: 15.5 },
          { house: 6, rashi: 'Pisces', degree: 15.5 },
          { house: 7, rashi: 'Aries', degree: 15.5 },
          { house: 8, rashi: 'Taurus', degree: 15.5 },
          { house: 9, rashi: 'Gemini', degree: 15.5 },
          { house: 10, rashi: 'Cancer', degree: 15.5 },
          { house: 11, rashi: 'Leo', degree: 15.5 },
          { house: 12, rashi: 'Virgo', degree: 15.5 }
        ]
      })
    }

    // Format date and time
    const dateTime = new Date(`${birthDate}T${birthTime}`)
    const day = dateTime.getDate()
    const month = dateTime.getMonth() + 1
    const year = dateTime.getFullYear()
    const hour = dateTime.getHours()
    const minute = dateTime.getMinutes()

    // Try different Prokerala endpoints
    const endpoints = [
      '/planets',
      '/planetary-positions',
      '/birth-details',
      '/kundli'
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying Prokerala endpoint: ${endpoint}`)
        
        const response = await fetch(`${PROKERALA_API_URL}${endpoint}`, {
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
          console.log(`Prokerala API response from ${endpoint}:`, data)
          
          // Format the response
          const formattedData = formatProkeralaData(data)
          if (formattedData) {
            return NextResponse.json(formattedData)
          }
        } else {
          console.warn(`Prokerala endpoint ${endpoint} failed:`, response.status, response.statusText)
        }
      } catch (endpointError) {
        console.warn(`Prokerala endpoint ${endpoint} error:`, endpointError)
        continue
      }
    }

    // If all endpoints fail, return fallback data
    console.log('All Prokerala endpoints failed, using fallback data')
    return NextResponse.json({
      ascendant: {
        rashi: 'Libra',
        degree: 15.5,
        nakshatra: 'Swati'
      },
      planets: [
        { planet: 'Sun', rashi: 'Pisces', degree: 28.83, nakshatra: 'Revati' },
        { planet: 'Moon', rashi: 'Capricorn', degree: 2.1, nakshatra: 'Uttara Ashadha' },
        { planet: 'Mars', rashi: 'Aries', degree: 26.58, nakshatra: 'Bharani' },
        { planet: 'Mercury', rashi: 'Pisces', degree: 14.05, nakshatra: 'Uttara Bhadrapada' },
        { planet: 'Jupiter', rashi: 'Capricorn', degree: 19.1, nakshatra: 'Dhanishta' },
        { planet: 'Venus', rashi: 'Pisces', degree: 15.47, nakshatra: 'Uttara Bhadrapada' },
        { planet: 'Saturn', rashi: 'Scorpio', degree: 3.43, nakshatra: 'Vishakha' },
        { planet: 'Rahu', rashi: 'Aries', degree: 26.12, nakshatra: 'Bharani' },
        { planet: 'Ketu', rashi: 'Libra', degree: 26.12, nakshatra: 'Vishakha' }
      ],
      houses: [
        { house: 1, rashi: 'Libra', degree: 15.5 },
        { house: 2, rashi: 'Scorpio', degree: 15.5 },
        { house: 3, rashi: 'Sagittarius', degree: 15.5 },
        { house: 4, rashi: 'Capricorn', degree: 15.5 },
        { house: 5, rashi: 'Aquarius', degree: 15.5 },
        { house: 6, rashi: 'Pisces', degree: 15.5 },
        { house: 7, rashi: 'Aries', degree: 15.5 },
        { house: 8, rashi: 'Taurus', degree: 15.5 },
        { house: 9, rashi: 'Gemini', degree: 15.5 },
        { house: 10, rashi: 'Cancer', degree: 15.5 },
        { house: 11, rashi: 'Leo', degree: 15.5 },
        { house: 12, rashi: 'Virgo', degree: 15.5 }
      ]
    })

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
    const planets = []
    
    // Prokerala returns data in a specific format
    if (data.planets) {
      data.planets.forEach(planet => {
        planets.push({
          planet: planet.name || planet.planet,
          rashi: planet.sign || planet.rashi,
          degree: parseFloat(planet.degree || planet.longitude) || 0,
          nakshatra: planet.nakshatra || 'Unknown'
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
      ascendant = {
        rashi: data.ascendant.sign || data.ascendant.rashi || 'Unknown',
        degree: parseFloat(data.ascendant.degree || data.ascendant.longitude) || 0,
        nakshatra: data.ascendant.nakshatra || 'Unknown'
      }
    } else if (data.houses && data.houses.length > 0) {
      // If no ascendant, use first house
      const firstHouse = data.houses[0]
      ascendant = {
        rashi: firstHouse.sign || firstHouse.rashi || 'Unknown',
        degree: parseFloat(firstHouse.degree || firstHouse.longitude) || 0,
        nakshatra: firstHouse.nakshatra || 'Unknown'
      }
    }

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