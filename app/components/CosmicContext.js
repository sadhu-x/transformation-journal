'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Cloud, Thermometer, Droplets, Wind, Eye } from 'lucide-react'
import { getVedicData, formatVedicData } from '../../lib/astronomy'
import { getCurrentLocationWeather, formatWeatherData, getWeatherInsights } from '../../lib/weather'

export default function CosmicContext({ date = new Date() }) {
  const [vedicData, setVedicData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      try {
        // Get Vedic data (local calculation)
        const vedic = getVedicData(date)
        setVedicData(vedic)
        
        // Get weather data (API call) with timeout
        const weatherPromise = getCurrentLocationWeather()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Weather timeout')), 10000)
        )
        
        const weather = await Promise.race([weatherPromise, timeoutPromise])
        setWeatherData(weather)
      } catch (error) {
        console.log('Error loading cosmic context data:', error.message)
        // Still set Vedic data even if weather fails
        if (!vedicData) {
          const vedic = getVedicData(date)
          setVedicData(vedic)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [date])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!vedicData) return null

  const formattedVedic = formatVedicData(vedicData)
  const formattedWeather = weatherData ? formatWeatherData(weatherData) : null
  const weatherInsights = weatherData ? getWeatherInsights(weatherData) : []

  return (
    <div className="space-y-4">
      {/* Vedic Astrology Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Cosmic Context
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Sun */}
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Sun</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formattedVedic.sun}
              </div>
            </div>
          </div>
          
          {/* Moon */}
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Moon</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formattedVedic.moon}
              </div>
            </div>
          </div>
          
          {/* Nakshatra */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-xs text-white">★</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Nakshatra</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formattedVedic.nakshatra}
              </div>
            </div>
          </div>
          
          {/* Tithi */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-xs text-white">☽</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tithi</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formattedVedic.tithi}
              </div>
            </div>
          </div>
        </div>
        
        {/* Lunar Phase */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Lunar Phase</span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formattedVedic.phase}
            </div>
          </div>
        </div>
      </div>

      {/* Weather Section */}
      {formattedWeather && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Weather Conditions
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature */}
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Temperature</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formattedWeather.temp}
                </div>
              </div>
            </div>
            
            {/* Humidity */}
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formattedWeather.humidity}
                </div>
              </div>
            </div>
            
            {/* Conditions */}
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Conditions</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {formattedWeather.conditions.toLowerCase()}
                </div>
              </div>
            </div>
            
            {/* Wind */}
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formattedWeather.wind}
                </div>
              </div>
            </div>
          </div>
          
          {/* Weather Insights */}
          {weatherInsights.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Weather Insights
              </div>
              <div className="space-y-1">
                {weatherInsights.map((insight, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-300 italic">
                    • {insight}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 