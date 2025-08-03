// Server-side API route to handle API Astro calls
// This provides comprehensive Vedic astrology data without requiring Prokerala credentials

import { NextResponse } from 'next/server'

const API_ASTRO_URL = 'https://json.apiastro.com/planets/extended'
const API_ASTRO_KEY = 'LrpCU2u2099RgZvAo4aRZ1C2sppPbbqF6rl1FkX5'

// Zodiac sign mapping
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

// Nakshatra calculation based on lunar longitude
function calculateNakshatra(lunarLongitude) {
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ]
  
  // Each nakshatra spans 13°20' (13.333... degrees)
  const nakshatraIndex = Math.floor(lunarLongitude / 13.333333333333334)
  return nakshatras[nakshatraIndex % 27] || 'Unknown'
}

// Get house lord based on rashi
function getHouseLord(rashi) {
  const lords = {
    'Aries': 'Mars',
    'Taurus': 'Venus',
    'Gemini': 'Mercury',
    'Cancer': 'Moon',
    'Leo': 'Sun',
    'Virgo': 'Mercury',
    'Libra': 'Venus',
    'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn',
    'Aquarius': 'Saturn',
    'Pisces': 'Jupiter'
  }
  return lords[rashi] || 'Unknown'
}

export async function POST(request) {
  try {
    const { birthDate, birthTime, latitude, longitude } = await request.json()

    console.log('=== API Astro Request ===')
    console.log('Birth data:', { birthDate, birthTime, latitude, longitude })

    if (!birthDate || !birthTime || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required birth data' },
        { status: 400 }
      )
    }

    // Parse birth date and time
    const date = new Date(`${birthDate}T${birthTime}`)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    
    // Calculate timezone (simplified - you might want to make this more accurate)
    const timezone = 5.5 // Default to IST, you can make this dynamic
    
    const requestData = {
      year,
      month,
      date: day,
      hours,
      minutes,
      seconds: 0,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone,
      settings: {
        observation_point: "topocentric",
        ayanamsha: "lahiri",
        language: "en"
      }
    }
    
    console.log('API Astro request data:', requestData)
    
    // Call API Astro
    const response = await fetch(API_ASTRO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_ASTRO_KEY
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      console.error('❌ API Astro request failed:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch astrology data from API Astro' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('📊 API Astro response:', data)
    
    if (data.statusCode !== 200) {
      console.error('❌ API Astro returned error status:', data)
      return NextResponse.json(
        { error: 'API Astro returned an error' },
        { status: 503 }
      )
    }
    
    // Format the data
    const formattedData = formatApiAstroData(data)
    
    if (formattedData) {
      console.log('✅ API Astro data formatted successfully')
      return NextResponse.json(formattedData)
    } else {
      console.error('❌ Failed to format API Astro data')
      return NextResponse.json(
        { error: 'Failed to process astrology data' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API Astro error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch astrology data' },
      { status: 500 }
    )
  }
}

function formatApiAstroData(apiData) {
  try {
    console.log('Formatting API Astro extended data:', apiData)
    
    if (!apiData || !apiData.output || typeof apiData.output !== 'object') {
      console.error('Invalid API Astro extended data structure')
      return null
    }
    
    // Extended API returns data directly in output object
    const planetaryData = apiData.output
    
    const planets = []
    let ascendant = null
    
    // Process each planet
    Object.keys(planetaryData).forEach(key => {
      const planetData = planetaryData[key]
      
      if (planetData && typeof planetData === 'object' && planetData.current_sign !== undefined) {
        const planet = {
          planet: key,
          rashi: planetData.zodiac_sign_name || ZODIAC_SIGNS[planetData.current_sign - 1] || 'Unknown',
          degree: parseFloat(planetData.normDegree) || 0,
          fullDegree: parseFloat(planetData.fullDegree) || 0,
          isRetro: planetData.isRetro === 'true',
          sign: planetData.current_sign,
          house: planetData.house_number || null,
          nakshatra: planetData.nakshatra_name || 'Unknown',
          nakshatra_pada: planetData.nakshatra_pada || null,
          nakshatra_lord: planetData.nakshatra_vimsottari_lord || 'Unknown',
          sign_lord: planetData.zodiac_sign_lord || 'Unknown',
          degrees: planetData.degrees || 0,
          minutes: planetData.minutes || 0,
          seconds: planetData.seconds || 0
        }
        
        // Special handling for Ascendant
        if (key === 'Ascendant') {
          ascendant = {
            rashi: planet.rashi,
            degree: planet.degree,
            fullDegree: planet.fullDegree,
            nakshatra: planet.nakshatra,
            nakshatra_pada: planet.nakshatra_pada,
            nakshatra_lord: planet.nakshatra_lord,
            sign_lord: planet.sign_lord,
            longitude: planetData.fullDegree,
            longitude_dms: `${planetData.degrees}° ${planetData.minutes}' ${Math.floor(planetData.seconds)}"`,
            sign_degree_dms: `${planetData.degrees}° ${planetData.minutes}' ${Math.floor(planetData.seconds)}"`
          }
        } else {
          planets.push(planet)
        }
      }
    })
    
    // Generate houses based on ascendant
    const houses = []
    if (ascendant) {
      for (let i = 1; i <= 12; i++) {
        const houseLongitude = (ascendant.fullDegree + (i - 1) * 30) % 360
        const houseSignIndex = Math.floor(houseLongitude / 30)
        houses.push({
          house: i,
          rashi: ZODIAC_SIGNS[houseSignIndex],
          degree: houseLongitude % 30,
          lord: getHouseLord(ZODIAC_SIGNS[houseSignIndex])
        })
      }
    }
    
    // Add ayanamsa info
    const ayanamsa = apiData.output[0]?.['13']?.value || 23.71
    
    const result = {
      ascendant,
      planets,
      houses,
      ayanamsa,
      raw_response: apiData
    }
    
    console.log('Formatted API Astro data:', result)
    return result
    
  } catch (error) {
    console.error('Error formatting API Astro data:', error)
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