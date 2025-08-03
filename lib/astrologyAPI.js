// Client-side astrology API functions
// These functions call our server-side API route to avoid CORS and keep API keys secure

const API_BASE_URL = '/api/astrology'

export async function getNatalChartAPI(birthDate, birthTime, latitude, longitude) {
  try {
    console.log('🔄 Fetching birth chart data from API...')
    
    const response = await fetch('/api/astrology', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate,
        birthTime,
        latitude,
        longitude
      })
    })

    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    console.log('📊 API returned chart data:', data)
    
    // Debug logging for raw data
    if (data.raw_data) {
      console.log('🔍 Raw API response:', data.raw_data)
      console.log('🔍 Debug info:', data.debug_info)
      console.log('🔍 Response keys:', data.debug_info?.response_keys)
      console.log('🔍 Has data property:', data.debug_info?.has_data_property)
      console.log('🔍 Data keys:', data.debug_info?.data_keys)
    }
    
    // Check if we have valid birth chart data
    if (data.ascendant && data.planets && data.planets.length > 0) {
      console.log('✅ API returned valid data')
      return data
    } else {
      console.warn('⚠️ API returned empty or invalid data structure')
      console.log('Response structure:', Object.keys(data))
      return null
    }
  } catch (error) {
    console.error('❌ Error fetching natal chart:', error)
    return null
  }
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