'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getVedicData, formatVedicData } from '../../lib/astronomy'

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