// Vedic Astrology Astronomical Calculations
// Based on traditional Vedic calculations and modern astronomical algorithms

// Constants for Vedic calculations
const AYANAMSA_2000 = 23.85 // Ayanamsa at year 2000
const NAKSHATRA_DEGREES = 13.333333 // Each nakshatra is 13°20' (13.333333 degrees)

// Vedic Zodiac Signs (Rashis)
const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

// Nakshatras (Lunar Mansions)
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

// Tithis (Lunar Days)
const TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
]

// Calculate Julian Day Number
function getJulianDay(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if (month <= 2) {
    year -= 1
    month += 12
  }
  
  const a = Math.floor(year / 100)
  const b = 2 - a + Math.floor(a / 4)
  
  return Math.floor(365.25 * (year + 4716)) + 
         Math.floor(30.6001 * (month + 1)) + 
         day + b - 1524.5
}

// Calculate Ayanamsa (Precession of Equinoxes)
function getAyanamsa(jd) {
  const t = (jd - 2451545.0) / 36525
  return AYANAMSA_2000 + (0.000117 * t * t) - (0.000000002 * t * t * t)
}

// Calculate Sun's position
function getSunPosition(date) {
  const jd = getJulianDay(date)
  const t = (jd - 2451545.0) / 36525
  
  // Simplified sun position calculation
  const L0 = 280.46645 + 36000.76983 * t + 0.0003032 * t * t
  const M = 357.52910 + 35999.05030 * t - 0.0001559 * t * t - 0.00000048 * t * t * t
  const C = (1.914600 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * Math.PI / 180) +
            (0.019993 - 0.000101 * t) * Math.sin(2 * M * Math.PI / 180) +
            0.000290 * Math.sin(3 * M * Math.PI / 180)
  
  const sunLongitude = L0 + C
  const ayanamsa = getAyanamsa(jd)
  const nirayanaLongitude = (sunLongitude - ayanamsa + 360) % 360
  
  const rashiIndex = Math.floor(nirayanaLongitude / 30)
  const degreeInRashi = nirayanaLongitude % 30
  const nakshatraIndex = Math.floor(nirayanaLongitude / NAKSHATRA_DEGREES)
  
  return {
    longitude: nirayanaLongitude,
    rashi: RASHIS[rashiIndex],
    degreeInRashi: degreeInRashi,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    nakshatraIndex: nakshatraIndex
  }
}

// Calculate Moon's position (simplified)
function getMoonPosition(date) {
  const jd = getJulianDay(date)
  const t = (jd - 2451545.0) / 36525
  
  // Simplified moon position calculation
  const L = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + t * t * t / 538841 - t * t * t * t / 65194000
  const moonLongitude = L % 360
  
  const ayanamsa = getAyanamsa(jd)
  const nirayanaLongitude = (moonLongitude - ayanamsa + 360) % 360
  
  const rashiIndex = Math.floor(nirayanaLongitude / 30)
  const degreeInRashi = nirayanaLongitude % 30
  const nakshatraIndex = Math.floor(nirayanaLongitude / NAKSHATRA_DEGREES)
  
  return {
    longitude: nirayanaLongitude,
    rashi: RASHIS[rashiIndex],
    degreeInRashi: degreeInRashi,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    nakshatraIndex: nakshatraIndex
  }
}

// Calculate Tithi (Lunar Day)
function getTithi(date) {
  const sun = getSunPosition(date)
  const moon = getMoonPosition(date)
  
  let lunarDay = moon.longitude - sun.longitude
  if (lunarDay < 0) lunarDay += 360
  
  const tithiIndex = Math.floor(lunarDay / 12)
  return {
    name: TITHIS[tithiIndex],
    index: tithiIndex,
    degree: lunarDay % 12
  }
}

// Calculate Lunar Phase
function getLunarPhase(date) {
  const sun = getSunPosition(date)
  const moon = getMoonPosition(date)
  
  let phaseAngle = moon.longitude - sun.longitude
  if (phaseAngle < 0) phaseAngle += 360
  
  const illumination = (1 + Math.cos(phaseAngle * Math.PI / 180)) / 2
  
  let phase
  if (phaseAngle < 45) phase = 'New Moon'
  else if (phaseAngle < 90) phase = 'Waxing Crescent'
  else if (phaseAngle < 135) phase = 'First Quarter'
  else if (phaseAngle < 180) phase = 'Waxing Gibbous'
  else if (phaseAngle < 225) phase = 'Full Moon'
  else if (phaseAngle < 270) phase = 'Waning Gibbous'
  else if (phaseAngle < 315) phase = 'Last Quarter'
  else phase = 'Waning Crescent'
  
  return {
    phase,
    illumination,
    angle: phaseAngle
  }
}

// Calculate Yoga (Sun-Moon combination)
function getYoga(date) {
  const sun = getSunPosition(date)
  const moon = getMoonPosition(date)
  
  const yogaIndex = Math.floor((sun.longitude + moon.longitude) / 13.333333)
  const yogas = [
    'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
    'Sukarman', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
    'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
    'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti'
  ]
  
  return {
    name: yogas[yogaIndex % 27],
    index: yogaIndex % 27
  }
}

// Get comprehensive Vedic data for a date
export function getVedicData(date = new Date()) {
  const sun = getSunPosition(date)
  const moon = getMoonPosition(date)
  const tithi = getTithi(date)
  const lunarPhase = getLunarPhase(date)
  const yoga = getYoga(date)
  
  return {
    date: date.toISOString().split('T')[0],
    sun,
    moon,
    tithi,
    lunarPhase,
    yoga,
    ayanamsa: getAyanamsa(getJulianDay(date))
  }
}

// Get current Vedic data
export function getCurrentVedicData() {
  return getVedicData(new Date())
}

// Format Vedic data for display
export function formatVedicData(vedicData) {
  return {
    sun: `${vedicData.sun.rashi} ${vedicData.sun.degreeInRashi.toFixed(1)}°`,
    moon: `${vedicData.moon.rashi} ${vedicData.moon.degreeInRashi.toFixed(1)}°`,
    nakshatra: vedicData.moon.nakshatra,
    tithi: vedicData.tithi.name,
    phase: vedicData.lunarPhase.phase,
    yoga: vedicData.yoga.name
  }
} 