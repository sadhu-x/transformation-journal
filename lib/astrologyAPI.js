// Client-side astrology API functions
// These functions call our server-side API route to avoid CORS and keep API keys secure

const API_BASE_URL = '/api/astrology'

export async function getNatalChartAPI(birthDate, birthTime, latitude, longitude) {
  try {
    // Format date and time for API
    const dateTime = new Date(`${birthDate}T${birthTime}`)
    const day = dateTime.getDate()
    const month = dateTime.getMonth() + 1
    const year = dateTime.getFullYear()
    const hour = dateTime.getHours()
    const minute = dateTime.getMinutes()
    
    console.log('Calling Prokerala API for natal chart with data:', {
      birthDate,
      birthTime,
      latitude,
      longitude,
      formattedDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      formattedTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    })
    
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
      
      // Check if the response contains valid data
      if (data && (data.planets || data.ascendant)) {
        console.log('✅ API returned valid data')
        return data
      } else {
        console.warn('⚠️ API returned empty or invalid data structure')
        console.log('Response structure:', Object.keys(data || {}))
      }
    } else {
      console.warn('❌ Prokerala API failed:', response.status, response.statusText)
    }

  } catch (error) {
    console.error('Error fetching natal chart from Prokerala API:', error)
  }
  
  // No fallback data - return null to indicate failure
  console.log('❌ API call failed - no fallback data provided')
  return null
}

// Debug function to help troubleshoot birth chart calculations
export function debugBirthData(birthDate, birthTime, latitude, longitude) {
  const dateTime = new Date(`${birthDate}T${birthTime}`)
  const day = dateTime.getDate()
  const month = dateTime.getMonth() + 1
  const year = dateTime.getFullYear()
  const hour = dateTime.getHours()
  const minute = dateTime.getMinutes()
  
  console.log('=== Birth Data Debug ===')
  console.log('Input data:', { birthDate, birthTime, latitude, longitude })
  console.log('Parsed date:', dateTime)
  console.log('Formatted for API:', {
    date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    coordinates: `${latitude},${longitude}`
  })
  console.log('=======================')
} 