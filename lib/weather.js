// Weather Service using free APIs
// Uses OpenWeatherMap API (free tier available)

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || null

// Get weather data for a location
export async function getWeatherData(lat = 40.7128, lon = -74.0060) {
  // If no API key, return mock data immediately
  if (!OPENWEATHER_API_KEY) {
    console.log('No weather API key provided, using mock data')
    return {
      temperature: 72,
      humidity: 65,
      pressure: 1013,
      conditions: 'Clear',
      description: 'clear sky',
      windSpeed: 5,
      windDirection: 180,
      visibility: 10000,
      sunrise: new Date(),
      sunset: new Date(),
      timestamp: new Date(),
      isMock: true
    }
  }

  try {
    // Use OpenWeatherMap API (free tier) with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error('Weather API request failed')
    }
    
    const data = await response.json()
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      visibility: data.visibility,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timestamp: new Date()
    }
  } catch (error) {
    console.log('Error fetching weather data, using mock data:', error.message)
    
    // Return mock data if API fails
    return {
      temperature: 72,
      humidity: 65,
      pressure: 1013,
      conditions: 'Clear',
      description: 'clear sky',
      windSpeed: 5,
      windDirection: 180,
      visibility: 10000,
      sunrise: new Date(),
      sunset: new Date(),
      timestamp: new Date(),
      isMock: true
    }
  }
}

// Get weather data for current location
export async function getCurrentLocationWeather() {
  try {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location')
      return await getWeatherData()
    }

    // Get user's location with a shorter timeout
    const position = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Geolocation timeout'))
      }, 5000) // 5 second timeout

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId)
          resolve(pos)
        },
        (error) => {
          clearTimeout(timeoutId)
          reject(error)
        },
        {
          timeout: 5000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes cache
        }
      )
    })
    
    const { latitude, longitude } = position.coords
    return await getWeatherData(latitude, longitude)
  } catch (error) {
    console.log('Using default location due to geolocation error:', error.message)
    // Return weather for default location (New York)
    return await getWeatherData()
  }
}

// Format weather data for display
export function formatWeatherData(weather) {
  return {
    temp: `${weather.temperature}°F`,
    humidity: `${weather.humidity}%`,
    pressure: `${weather.pressure} hPa`,
    conditions: weather.conditions,
    description: weather.description,
    wind: `${weather.windSpeed} mph`,
    visibility: `${Math.round(weather.visibility / 1000)} km`
  }
}

// Get weather insights based on conditions
export function getWeatherInsights(weather) {
  const insights = []
  
  // Temperature insights
  if (weather.temperature < 32) {
    insights.push('Cold weather may affect energy levels')
  } else if (weather.temperature > 85) {
    insights.push('Hot weather may impact focus and energy')
  } else if (weather.temperature >= 65 && weather.temperature <= 75) {
    insights.push('Optimal temperature for productivity')
  }
  
  // Humidity insights
  if (weather.humidity > 80) {
    insights.push('High humidity may affect mood and energy')
  } else if (weather.humidity < 30) {
    insights.push('Low humidity may cause dryness and discomfort')
  }
  
  // Pressure insights
  if (weather.pressure < 1000) {
    insights.push('Low pressure may affect energy and mood')
  } else if (weather.pressure > 1020) {
    insights.push('High pressure typically brings clear, stable energy')
  }
  
  // Condition insights
  switch (weather.conditions.toLowerCase()) {
    case 'rain':
      insights.push('Rainy weather may enhance introspection and creativity')
      break
    case 'snow':
      insights.push('Snow may bring calm, peaceful energy')
      break
    case 'clouds':
      insights.push('Cloudy weather may support inward focus')
      break
    case 'clear':
      insights.push('Clear weather typically brings clarity and energy')
      break
    case 'thunderstorm':
      insights.push('Stormy weather may bring intensity and transformation')
      break
  }
  
  return insights
} 