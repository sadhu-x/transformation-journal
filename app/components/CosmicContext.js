'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getVedicData, formatVedicData } from '../../lib/astronomy'

export default function CosmicContext({ date = new Date() }) {
  const [vedicData, setVedicData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)
      
      // Load Vedic data (local calculation)
      const vedic = getVedicData(date)
      setVedicData(vedic)
      setLoading(false)
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

  return (
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
  )
} 