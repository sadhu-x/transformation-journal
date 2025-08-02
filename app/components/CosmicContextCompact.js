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

// Zodiac sign information
const ZODIAC_INFO = {
  'Aries': { 
    element: 'Fire', 
    quality: 'Cardinal', 
    ruler: 'Mars', 
    nature: 'Dynamic, energetic, pioneering',
    bodyPart: 'Head',
    gemstone: 'Red Coral'
  },
  'Taurus': { 
    element: 'Earth', 
    quality: 'Fixed', 
    ruler: 'Venus', 
    nature: 'Stable, patient, sensual',
    bodyPart: 'Face & Neck',
    gemstone: 'Diamond'
  },
  'Gemini': { 
    element: 'Air', 
    quality: 'Mutable', 
    ruler: 'Mercury', 
    nature: 'Versatile, communicative, curious',
    bodyPart: 'Arms & Shoulders',
    gemstone: 'Emerald'
  },
  'Cancer': { 
    element: 'Water', 
    quality: 'Cardinal', 
    ruler: 'Moon', 
    nature: 'Emotional, nurturing, protective',
    bodyPart: 'Chest',
    gemstone: 'Pearl'
  },
  'Leo': { 
    element: 'Fire', 
    quality: 'Fixed', 
    ruler: 'Sun', 
    nature: 'Confident, generous, dramatic',
    bodyPart: 'Heart',
    gemstone: 'Ruby'
  },
  'Virgo': { 
    element: 'Earth', 
    quality: 'Mutable', 
    ruler: 'Mercury', 
    nature: 'Analytical, practical, perfectionist',
    bodyPart: 'Intestines',
    gemstone: 'Emerald'
  },
  'Libra': { 
    element: 'Air', 
    quality: 'Cardinal', 
    ruler: 'Venus', 
    nature: 'Diplomatic, fair, social',
    bodyPart: 'Kidneys',
    gemstone: 'Diamond'
  },
  'Scorpio': { 
    element: 'Water', 
    quality: 'Fixed', 
    ruler: 'Mars', 
    nature: 'Intense, passionate, mysterious',
    bodyPart: 'Reproductive Organs',
    gemstone: 'Red Coral'
  },
  'Sagittarius': { 
    element: 'Fire', 
    quality: 'Mutable', 
    ruler: 'Jupiter', 
    nature: 'Optimistic, adventurous, philosophical',
    bodyPart: 'Thighs',
    gemstone: 'Yellow Sapphire'
  },
  'Capricorn': { 
    element: 'Earth', 
    quality: 'Cardinal', 
    ruler: 'Saturn', 
    nature: 'Ambitious, disciplined, practical',
    bodyPart: 'Knees',
    gemstone: 'Blue Sapphire'
  },
  'Aquarius': { 
    element: 'Air', 
    quality: 'Fixed', 
    ruler: 'Saturn', 
    nature: 'Innovative, independent, humanitarian',
    bodyPart: 'Ankles',
    gemstone: 'Blue Sapphire'
  },
  'Pisces': { 
    element: 'Water', 
    quality: 'Mutable', 
    ruler: 'Jupiter', 
    nature: 'Compassionate, intuitive, artistic',
    bodyPart: 'Feet',
    gemstone: 'Yellow Sapphire'
  }
}



export default function CosmicContextCompact() {
  const [vedicData, setVedicData] = useState(null)
  const [showSunTooltip, setShowSunTooltip] = useState(false)
  const [showMoonTooltip, setShowMoonTooltip] = useState(false)
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
  const sunRashi = formattedVedic.sun.split(' ')[0]
  const moonRashi = formattedVedic.moon.split(' ')[0]
  const sunInfo = ZODIAC_INFO[sunRashi] || {}
  const moonInfo = ZODIAC_INFO[moonRashi] || {}
  const nakshatraInfo = NAKSHATRA_INFO[formattedVedic.nakshatra] || {}
  const tithiInfo = TITHI_INFO[formattedVedic.tithi] || {}

  return (
    <div className="flex items-center gap-4 text-white/90 text-xs">
      {/* Sun */}
      <div className="relative flex items-center gap-1 group">
        <Sun className="h-3 w-3 text-yellow-300" />
        <span className="hidden sm:inline">{sunRashi}</span>
        <Info 
          className="h-3 w-3 text-yellow-300 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" 
          onMouseEnter={() => setShowSunTooltip(true)}
          onMouseLeave={() => setShowSunTooltip(false)}
        />
        
        {/* Sun Tooltip */}
        {showSunTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
            <div className="font-semibold mb-1">Sun in {sunRashi}</div>
            <div>Element: {sunInfo.element}</div>
            <div>Quality: {sunInfo.quality}</div>
            <div>Ruler: {sunInfo.ruler}</div>
            <div>Nature: {sunInfo.nature}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
      
      {/* Moon */}
      <div className="relative flex items-center gap-1 group">
        <Moon className="h-3 w-3 text-blue-300" />
        <span className="hidden sm:inline">{moonRashi} ({formattedVedic.phase})</span>
        <Info 
          className="h-3 w-3 text-blue-300 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" 
          onMouseEnter={() => setShowMoonTooltip(true)}
          onMouseLeave={() => setShowMoonTooltip(false)}
        />
        
        {/* Moon Tooltip */}
        {showMoonTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
            <div className="font-semibold mb-1">Moon in {moonRashi}</div>
            <div>Phase: {formattedVedic.phase}</div>
            <div>Element: {moonInfo.element}</div>
            <div>Quality: {moonInfo.quality}</div>
            <div>Ruler: {moonInfo.ruler}</div>
            <div>Nature: {moonInfo.nature}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
      
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
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
              <div className="font-semibold mb-1">{formattedVedic.nakshatra}</div>
              <div>Deity: {nakshatraInfo.deity}</div>
              <div>Element: {nakshatraInfo.element}</div>
              <div>Quality: {nakshatraInfo.quality}</div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
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
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
              <div className="font-semibold mb-1">{formattedVedic.tithi}</div>
              <div>Deity: {tithiInfo.deity}</div>
              <div>Nature: {tithiInfo.nature}</div>
              <div>Activities: {tithiInfo.activities}</div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
            </div>
          )}
        </div>
    </div>
  )
} 