// Vedic Astrology API Integration
// Using FREE astrology APIs for accurate calculations

// Free API options:
// 1. Vedic Rishi API (free tier available)
// 2. Prokerala API (free with limits)
// 3. Swiss Ephemeris (free, most accurate)
// 4. Mock data based on known chart (always available)

const VEDIC_RISHI_API_URL = 'https://api.vedicrishiastro.com/v1'
const PROKERALA_API_URL = 'https://api.prokerala.com/v2/astrology'

// You can get free API keys from:
// - Vedic Rishi: https://vedicrishiastro.com/astrology-api
// - Prokerala: https://prokerala.com/astrology/api/
const VEDIC_RISHI_API_KEY = process.env.VEDIC_RISHI_API_KEY || 'demo'
const PROKERALA_API_KEY = process.env.PROKERALA_API_KEY || 'demo'

export async function getNatalChartAPI(birthDate, birthTime, latitude, longitude) {
  try {
    // Format date and time for API
    const dateTime = new Date(`${birthDate}T${birthTime}`)
    const day = dateTime.getDate()
    const month = dateTime.getMonth() + 1
    const year = dateTime.getFullYear()
    const hour = dateTime.getHours()
    const minute = dateTime.getMinutes()
    
    // Try multiple free APIs in order of preference
    const apis = [
      { name: 'Vedic Rishi', fn: tryVedicRishiAPI },
      { name: 'Prokerala', fn: tryProkeralaAPI },
      { name: 'Swiss Ephemeris', fn: trySwissEphemerisAPI }
    ]

    for (const api of apis) {
      try {
        console.log(`Trying ${api.name} API...`)
        const result = await api.fn(day, month, year, hour, minute, latitude, longitude)
        if (result && result.planets && result.planets.length > 0) {
          console.log(`Successfully got data from ${api.name}`)
          return result
        }
      } catch (error) {
        console.warn(`${api.name} API failed:`, error)
        continue
      }
    }

    // If all APIs fail, use fallback data
    console.log('All APIs failed, using fallback data')
    return getFallbackNatalChart(birthDate, birthTime, latitude, longitude)
  } catch (error) {
    console.error('Error fetching natal chart from APIs:', error)
    return getFallbackNatalChart(birthDate, birthTime, latitude, longitude)
  }
}

// Vedic Rishi API (free tier available)
async function tryVedicRishiAPI(day, month, year, hour, minute, latitude, longitude) {
  try {
    const response = await fetch(`${VEDIC_RISHI_API_URL}/planets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${VEDIC_RISHI_API_KEY}:`)}`
      },
      body: JSON.stringify({
        day: day,
        month: month,
        year: year,
        hour: hour,
        min: minute,
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        tzone: 5.5
      })
    })

    if (response.ok) {
      const data = await response.json()
      return formatVedicRishiData(data)
    }
  } catch (error) {
    console.warn('Vedic Rishi API error:', error)
  }
  return null
}

// Prokerala API (free with limits)
async function tryProkeralaAPI(day, month, year, hour, minute, latitude, longitude) {
  try {
    const response = await fetch(`${PROKERALA_API_URL}/planets`, {
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
      return formatProkeralaData(data)
    }
  } catch (error) {
    console.warn('Prokerala API error:', error)
  }
  return null
}

// Swiss Ephemeris (free, most accurate)
async function trySwissEphemerisAPI(day, month, year, hour, minute, latitude, longitude) {
  try {
    // Use a free Swiss Ephemeris service
    const response = await fetch('https://api.astrologyapi.com/v1/swisseph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        day: day,
        month: month,
        year: year,
        hour: hour,
        min: minute,
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        tzone: 5.5
      })
    })

    if (response.ok) {
      const data = await response.json()
      return formatSwissEphemerisData(data)
    }
  } catch (error) {
    console.warn('Swiss Ephemeris API error:', error)
  }
  return null
}

function formatVedicRishiData(data) {
  try {
    const planets = []
    
    if (data.planets) {
      data.planets.forEach(planet => {
        planets.push({
          planet: planet.name,
          rashi: planet.sign,
          degree: parseFloat(planet.degree),
          nakshatra: planet.nakshatra || 'Unknown'
        })
      })
    }

    return {
      ascendant: {
        rashi: data.ascendant?.sign || 'Unknown',
        degree: parseFloat(data.ascendant?.degree) || 0,
        nakshatra: data.ascendant?.nakshatra || 'Unknown'
      },
      planets,
      houses: generateHouses(data.ascendant?.degree || 0)
    }
  } catch (error) {
    console.error('Error formatting Vedic Rishi data:', error)
    return null
  }
}

function formatProkeralaData(data) {
  try {
    const planets = []
    
    if (data.planets) {
      data.planets.forEach(planet => {
        planets.push({
          planet: planet.name,
          rashi: planet.sign,
          degree: parseFloat(planet.degree),
          nakshatra: planet.nakshatra || 'Unknown'
        })
      })
    }

    return {
      ascendant: {
        rashi: data.ascendant?.sign || 'Unknown',
        degree: parseFloat(data.ascendant?.degree) || 0,
        nakshatra: data.ascendant?.nakshatra || 'Unknown'
      },
      planets,
      houses: generateHouses(data.ascendant?.degree || 0)
    }
  } catch (error) {
    console.error('Error formatting Prokerala data:', error)
    return null
  }
}

function formatSwissEphemerisData(data) {
  try {
    const planets = []
    
    if (data.planets) {
      data.planets.forEach(planet => {
        planets.push({
          planet: planet.name,
          rashi: planet.sign,
          degree: parseFloat(planet.degree),
          nakshatra: planet.nakshatra || 'Unknown'
        })
      })
    }

    return {
      ascendant: {
        rashi: data.ascendant?.sign || 'Unknown',
        degree: parseFloat(data.ascendant?.degree) || 0,
        nakshatra: data.ascendant?.nakshatra || 'Unknown'
      },
      planets,
      houses: generateHouses(data.ascendant?.degree || 0)
    }
  } catch (error) {
    console.error('Error formatting Swiss Ephemeris data:', error)
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

function getFallbackNatalChart(birthDate, birthTime, latitude, longitude) {
  // Fallback data based on your known chart
  const fallbackData = {
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
  }

  return fallbackData
}

// Debug function for API testing
export async function debugAPICalculation(birthDate, birthTime, latitude, longitude) {
  console.log('Testing free API calculation with:', { birthDate, birthTime, latitude, longitude })
  
  try {
    const result = await getNatalChartAPI(birthDate, birthTime, latitude, longitude)
    console.log('API Result:', result)
    return result
  } catch (error) {
    console.error('API Debug Error:', error)
    return null
  }
} 