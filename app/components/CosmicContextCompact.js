'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Info } from 'lucide-react'
import { getVedicData, formatVedicData } from '../../lib/astronomy'

// Nakshatra information
const NAKSHATRA_INFO = {
  'Ashwini': { deity: 'Ashwini Kumaras', element: 'Fire', quality: 'Light & Swift' },
  'Bharani': { deity: 'Yama', element: 'Earth', quality: 'Soft & Mild' },
  'Krittika': { deity: 'Agni', element: 'Fire', quality: 'Sharp & Severe' },
  'Rohini': { deity: 'Brahma', element: 'Earth', quality: 'Fixed & Steady' },
  'Mrigashira': { deity: 'Soma', element: 'Fire', quality: 'Light & Swift' },
  'Ardra': { deity: 'Rudra', element: 'Water', quality: 'Sharp & Severe' },
  'Punarvasu': { deity: 'Aditi', element: 'Air', quality: 'Light & Swift' },
  'Pushya': { deity: 'Brihaspati', element: 'Fire', quality: 'Light & Swift' },
  'Ashlesha': { deity: 'Nagas', element: 'Water', quality: 'Sharp & Severe' },
  'Magha': { deity: 'Pitris', element: 'Fire', quality: 'Fixed & Steady' },
  'Purva Phalguni': { deity: 'Bhaga', element: 'Fire', quality: 'Light & Swift' },
  'Uttara Phalguni': { deity: 'Aryaman', element: 'Fire', quality: 'Fixed & Steady' },
  'Hasta': { deity: 'Savita', element: 'Air', quality: 'Light & Swift' },
  'Chitra': { deity: 'Vishvakarma', element: 'Fire', quality: 'Light & Swift' },
  'Swati': { deity: 'Vayu', element: 'Air', quality: 'Light & Swift' },
  'Vishakha': { deity: 'Indra & Agni', element: 'Fire', quality: 'Fixed & Steady' },
  'Anuradha': { deity: 'Mitra', element: 'Earth', quality: 'Soft & Mild' },
  'Jyeshtha': { deity: 'Indra', element: 'Air', quality: 'Sharp & Severe' },
  'Mula': { deity: 'Nirriti', element: 'Water', quality: 'Sharp & Severe' },
  'Purva Ashadha': { deity: 'Apas', element: 'Water', quality: 'Fixed & Steady' },
  'Uttara Ashadha': { deity: 'Vishvedevas', element: 'Earth', quality: 'Fixed & Steady' },
  'Shravana': { deity: 'Vishnu', element: 'Air', quality: 'Light & Swift' },
  'Dhanishta': { deity: 'Vasus', element: 'Earth', quality: 'Sharp & Severe' },
  'Shatabhisha': { deity: 'Varuna', element: 'Water', quality: 'Sharp & Severe' },
  'Purva Bhadrapada': { deity: 'Aja Ekapada', element: 'Fire', quality: 'Fixed & Steady' },
  'Uttara Bhadrapada': { deity: 'Ahir Budhnya', element: 'Water', quality: 'Fixed & Steady' },
  'Revati': { deity: 'Pushan', element: 'Water', quality: 'Soft & Mild' }
}

// Tithi information
const TITHI_INFO = {
  'Pratipada': { deity: 'Agni', nature: 'Nanda (Joyful)', activities: 'New beginnings, travel' },
  'Dwitiya': { deity: 'Brahma', nature: 'Bhadra (Auspicious)', activities: 'Learning, ceremonies' },
  'Tritiya': { deity: 'Gauri', nature: 'Jaya (Victory)', activities: 'Creative work, arts' },
  'Chaturthi': { deity: 'Ganesha', nature: 'Rikta (Empty)', activities: 'Removing obstacles' },
  'Panchami': { deity: 'Naga', nature: 'Purna (Full)', activities: 'Snake worship, healing' },
  'Shashthi': { deity: 'Kartikeya', nature: 'Nanda (Joyful)', activities: 'Children, protection' },
  'Saptami': { deity: 'Surya', nature: 'Bhadra (Auspicious)', activities: 'Health, vitality' },
  'Ashtami': { deity: 'Shiva', nature: 'Jaya (Victory)', activities: 'Spiritual practices' },
  'Navami': { deity: 'Durga', nature: 'Rikta (Empty)', activities: 'Warrior energy, courage' },
  'Dashami': { deity: 'Yama', nature: 'Purna (Full)', activities: 'Justice, discipline' },
  'Ekadashi': { deity: 'Vishnu', nature: 'Nanda (Joyful)', activities: 'Fasting, purification' },
  'Dwadashi': { deity: 'Vishnu', nature: 'Bhadra (Auspicious)', activities: 'Devotional practices' },
  'Trayodashi': { deity: 'Shiva', nature: 'Jaya (Victory)', activities: 'Meditation, austerity' },
  'Chaturdashi': { deity: 'Shiva', nature: 'Rikta (Empty)', activities: 'Ghost worship, tantra' },
  'Purnima': { deity: 'Chandra', nature: 'Purna (Full)', activities: 'Full moon rituals' },
  'Amavasya': { deity: 'Pitris', nature: 'Rikta (Empty)', activities: 'Ancestor worship' }
}

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
  const [showNakshatraTooltip, setShowNakshatraTooltip] = useState(false)
  const [showTithiTooltip, setShowTithiTooltip] = useState(false)

  useEffect(() => {
    const loadData = () => {
      const vedic = getVedicData(new Date())
      setVedicData(vedic)
    }
    
    loadData()
  }, [])

  if (!vedicData) return null

  const formattedVedic = formatVedicData(vedicData)
  const nakshatraInfo = NAKSHATRA_INFO[formattedVedic.nakshatra] || {}
  const tithiInfo = TITHI_INFO[formattedVedic.tithi] || {}

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
      <div className="relative flex items-center gap-1 group">
        <span className="text-purple-300">★</span>
        <span className="hidden md:inline">{formattedVedic.nakshatra}</span>
        <Info 
          className="h-3 w-3 text-purple-300 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" 
          onMouseEnter={() => setShowNakshatraTooltip(true)}
          onMouseLeave={() => setShowNakshatraTooltip(false)}
        />
        
        {/* Nakshatra Tooltip */}
        {showNakshatraTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
            <div className="font-semibold mb-1">{formattedVedic.nakshatra}</div>
            <div>Deity: {nakshatraInfo.deity}</div>
            <div>Element: {nakshatraInfo.element}</div>
            <div>Quality: {nakshatraInfo.quality}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
      
      {/* Tithi */}
      <div className="relative flex items-center gap-1 group">
        <span className="text-indigo-300">☽</span>
        <span className="hidden lg:inline">{formattedVedic.tithi}</span>
        <Info 
          className="h-3 w-3 text-indigo-300 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" 
          onMouseEnter={() => setShowTithiTooltip(true)}
          onMouseLeave={() => setShowTithiTooltip(false)}
        />
        
        {/* Tithi Tooltip */}
        {showTithiTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
            <div className="font-semibold mb-1">{formattedVedic.tithi}</div>
            <div>Deity: {tithiInfo.deity}</div>
            <div>Nature: {tithiInfo.nature}</div>
            <div>Activities: {tithiInfo.activities}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    </div>
  )
} 