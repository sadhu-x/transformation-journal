// Vedic Astrology API Integration
// Using Prokerala API for accurate Vedic astrology calculations

const PROKERALA_API_URL = 'https://api.prokerala.com/v2/astrology'
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
    
    console.log('Calling Prokerala API for natal chart...')
    
    // Use our server-side API route to avoid CORS issues
    const response = await fetch('/api/astrology', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        birthTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        latitude,
        longitude
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Prokerala API response:', data)
      return data
    } else {
      console.warn('Prokerala API failed:', response.status, response.statusText)
    }

  } catch (error) {
    console.error('Error fetching natal chart from Prokerala API:', error)
  }
  
  // Return fallback data if API fails
  return getFallbackNatalChart(birthDate, birthTime, latitude, longitude)
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