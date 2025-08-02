'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getVedicData, formatVedicData } from '../../lib/astronomy'

// Moon phase component
function MoonPhase({ phase }) {
  const getPhaseIcon = (phase) => {
    switch (phase.toLowerCase()) {
      case 'new moon':
        return '🌑'
      case 'waxing crescent':
        return '🌒'
      case 'first quarter':
        return '🌓'
      case 'waxing gibbous':
        return '🌔'
      case 'full moon':
        return '🌕'
      case 'waning gibbous':
        return '🌖'
      case 'last quarter':
        return '🌗'
      case 'waning crescent':
        return '🌘'
      default:
        return '🌙'
    }
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-lg">{getPhaseIcon(phase)}</span>
      <span className="hidden xl:inline text-xs">{phase}</span>
    </div>
  )
}

export default function CosmicContextCompact() {
  const [vedicData, setVedicData] = useState(null)

  useEffect(() => {
    const loadData = () => {
      const vedic = getVedicData(new Date())
      setVedicData(vedic)
    }
    
    loadData()
  }, [])

  if (!vedicData) return null

  const formattedVedic = formatVedicData(vedicData)

  return (
    <div className="flex items-center gap-4 text-white/90 text-xs">
      {/* Sun */}
      <div className="flex items-center gap-1">
        <Sun className="h-3 w-3 text-yellow-300" />
        <span className="hidden sm:inline">{formattedVedic.sun.split(' ')[0]}</span>
      </div>
      
      {/* Moon */}
      <div className="flex items-center gap-1">
        <Moon className="h-3 w-3 text-blue-300" />
        <span className="hidden sm:inline">{formattedVedic.moon.split(' ')[0]}</span>
      </div>
      
      {/* Moon Phase */}
      <MoonPhase phase={formattedVedic.phase} />
      
      {/* Nakshatra */}
      <div className="flex items-center gap-1">
        <span className="text-purple-300">★</span>
        <span className="hidden md:inline">{formattedVedic.nakshatra}</span>
      </div>
      
      {/* Tithi */}
      <div className="flex items-center gap-1">
        <span className="text-indigo-300">☽</span>
        <span className="hidden lg:inline">{formattedVedic.tithi}</span>
      </div>
    </div>
  )
} 