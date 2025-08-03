// Simple and Reliable Natal Chart Calculations for Vedic Astrology
// Uses proven astronomical algorithms with better error handling

// Constants for Vedic calculations
const AYANAMSA_2000 = 23.85 // Ayanamsa at year 2000 (Lahiri)
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
// Using Lahiri ayanamsa which is most commonly used in Vedic astrology
function getAyanamsa(jd) {
  const t = (jd - 2451545.0) / 36525
  // Lahiri ayanamsa formula
  return 23.85 + 0.000117 * t * t - 0.000000002 * t * t * t
}

// Calculate Sun's position
function getSunPosition(jd) {
  const t = (jd - 2451545.0) / 36525
  
  const L0 = 280.46645 + 36000.76983 * t + 0.0003032 * t * t
  const M = 357.52910 + 35999.05030 * t - 0.0001559 * t * t - 0.00000048 * t * t * t
  const C = (1.914600 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * Math.PI / 180) +
            (0.019993 - 0.000101 * t) * Math.sin(2 * M * Math.PI / 180) +
            0.000290 * Math.sin(3 * M * Math.PI / 180)
  
  const sunLongitude = L0 + C
  return sunLongitude
}

// Calculate Moon's position (simplified but accurate)
function getMoonPosition(jd) {
  const t = (jd - 2451545.0) / 36525
  
  // Simplified but accurate moon calculation
  const L = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + t * t * t / 538841 - t * t * t * t / 65194000
  const D = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t + t * t * t / 545868 - t * t * t * t / 113065000
  const M = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t + t * t * t / 69699 - t * t * t * t / 14712000
  const M_ = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t + t * t * t / 24490000
  
  // Main perturbation terms for moon
  const D_rad = D * Math.PI / 180
  const M_rad = M * Math.PI / 180
  const M__rad = M_ * Math.PI / 180
  
  const perturbations = 
    6.288774 * Math.sin(M_rad) +
    1.274018 * Math.sin(2 * D_rad - M_rad) +
    0.658314 * Math.sin(2 * D_rad) +
    0.213618 * Math.sin(2 * M_rad) +
    0.185596 * Math.sin(M__rad) +
    0.114332 * Math.sin(2 * D_rad - 2 * M_rad) +
    0.058793 * Math.sin(2 * D_rad - M_rad - M__rad) +
    0.057212 * Math.sin(2 * D_rad - M_rad + M__rad) +
    0.053320 * Math.sin(2 * D_rad + M_rad) +
    0.045874 * Math.sin(2 * D_rad - M__rad) +
    0.041024 * Math.sin(M_rad - M__rad) +
    0.034718 * Math.sin(D_rad) +
    0.030465 * Math.sin(M_rad + M__rad)
  
  let moonLongitude = L + perturbations
  
  // Normalize to 0-360 degrees
  moonLongitude = moonLongitude % 360
  if (moonLongitude < 0) moonLongitude += 360
  
  return moonLongitude
}

// Calculate other planets (simplified)
function getPlanetPosition(jd, planet) {
  const t = (jd - 2451545.0) / 36525
  
  const planetData = {
    mars: 355.433275 + 19141.6964746 * t - 0.0003106 * t * t + t * t * t / 153400,
    mercury: 252.250906 + 149472.6746358 * t - 0.0005363 * t * t + t * t * t / 24490000,
    jupiter: 34.351519 + 3034.9056606 * t - 0.0000850 * t * t + t * t * t / 24490000,
    venus: 181.979801 + 58517.8153876 * t + 0.0003106 * t * t + t * t * t / 24490000,
    saturn: 50.077471 + 1222.1137943 * t + 0.0002104 * t * t + t * t * t / 24490000
  }
  
  return planetData[planet] || 0
}

// Calculate Rahu and Ketu
function getLunarNodes(jd) {
  const t = (jd - 2451545.0) / 36525
  const rahu = 125.044555 - 1934.1362619 * t + 0.0020762 * t * t + t * t * t / 467410 - t * t * t * t / 60616000
  const ketu = (rahu + 180) % 360
  return { rahu, ketu }
}

// Calculate Ascendant
function getAscendant(jd, latitude, longitude) {
  const t = (jd - 2451545.0) / 36525
  
  // Calculate Local Sidereal Time
  const T0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000
  let lst = (T0 + longitude) % 360
  if (lst < 0) lst += 360
  
  // Calculate Ascendant
  const obliquity = 23.439 - 0.0000004 * t
  const tanA = (Math.sin(lst * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180) + 
                Math.tan(latitude * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180)) / 
               Math.cos(lst * Math.PI / 180)
  
  let ascendant = Math.atan(tanA) * 180 / Math.PI
  if (lst > 180) ascendant += 180
  if (ascendant < 0) ascendant += 360
  
  return ascendant
}

// Helper functions
function getRashiFromLongitude(longitude) {
  // Normalize longitude to 0-360
  let normalizedLongitude = longitude % 360
  if (normalizedLongitude < 0) normalizedLongitude += 360
  
  const rashiIndex = Math.floor(normalizedLongitude / 30)
  return RASHIS[rashiIndex]
}

function getNakshatraFromLongitude(longitude) {
  // Normalize longitude to 0-360
  let normalizedLongitude = longitude % 360
  if (normalizedLongitude < 0) normalizedLongitude += 360
  
  const nakshatraIndex = Math.floor(normalizedLongitude / NAKSHATRA_DEGREES)
  return NAKSHATRAS[nakshatraIndex]
}

function calculateHouses(ascendantLongitude) {
  const houses = []
  for (let i = 1; i <= 12; i++) {
    const houseLongitude = (ascendantLongitude + (i - 1) * 30) % 360
    houses.push({
      house: i,
      longitude: houseLongitude,
      rashi: getRashiFromLongitude(houseLongitude),
      degreeInRashi: houseLongitude % 30
    })
  }
  return houses
}

// Main natal chart calculation function
export function calculateSimpleNatalChart(birthDate, birthTime, latitude, longitude) {
  try {
    // Combine date and time
    const birthDateTime = new Date(birthDate + 'T' + birthTime)
    const jd = getJulianDay(birthDateTime)
    const ayanamsa = getAyanamsa(jd)
    
    // Calculate planetary positions
    const planets = {}
    
    // Sun
    const sunLongitude = getSunPosition(jd)
    const sunNirayana = (sunLongitude - ayanamsa + 360) % 360
    planets.sun = {
      longitude: sunNirayana,
      rashi: getRashiFromLongitude(sunNirayana),
      degreeInRashi: sunNirayana % 30,
      nakshatra: getNakshatraFromLongitude(sunNirayana)
    }
    
    // Moon
    const moonLongitude = getMoonPosition(jd)
    const moonNirayana = (moonLongitude - ayanamsa + 360) % 360
    planets.moon = {
      longitude: moonNirayana,
      rashi: getRashiFromLongitude(moonNirayana),
      degreeInRashi: moonNirayana % 30,
      nakshatra: getNakshatraFromLongitude(moonNirayana)
    }
    
    // Other planets
    const planetNames = ['mars', 'mercury', 'jupiter', 'venus', 'saturn']
    planetNames.forEach(planet => {
      const longitude = getPlanetPosition(jd, planet)
      const nirayana = (longitude - ayanamsa + 360) % 360
      planets[planet] = {
        longitude: nirayana,
        rashi: getRashiFromLongitude(nirayana),
        degreeInRashi: nirayana % 30,
        nakshatra: getNakshatraFromLongitude(nirayana)
      }
    })
    
    // Rahu and Ketu
    const lunarNodes = getLunarNodes(jd)
    const rahuNirayana = (lunarNodes.rahu - ayanamsa + 360) % 360
    const ketuNirayana = (lunarNodes.ketu - ayanamsa + 360) % 360
    
    planets.rahu = {
      longitude: rahuNirayana,
      rashi: getRashiFromLongitude(rahuNirayana),
      degreeInRashi: rahuNirayana % 30,
      nakshatra: getNakshatraFromLongitude(rahuNirayana)
    }
    
    planets.ketu = {
      longitude: ketuNirayana,
      rashi: getRashiFromLongitude(ketuNirayana),
      degreeInRashi: ketuNirayana % 30,
      nakshatra: getNakshatraFromLongitude(ketuNirayana)
    }
    
    // Ascendant
    const ascendantLongitude = getAscendant(jd, latitude, longitude)
    const nirayanaAscendant = (ascendantLongitude - ayanamsa + 360) % 360
    
    const ascendant = {
      longitude: nirayanaAscendant,
      rashi: getRashiFromLongitude(nirayanaAscendant),
      degreeInRashi: nirayanaAscendant % 30,
      nakshatra: getNakshatraFromLongitude(nirayanaAscendant)
    }
    
    return {
      birthDateTime: birthDateTime,
      julianDay: jd,
      ayanamsa: ayanamsa,
      ascendant: ascendant,
      planets: planets,
      houses: calculateHouses(nirayanaAscendant)
    }
  } catch (error) {
    console.error('Error in calculateSimpleNatalChart:', error)
    throw error
  }
}

// Function to calculate correct ayanamsa based on known chart
export function calculateCorrectAyanamsa(birthDate, birthTime, knownTropicalLongitude, knownNirayanaLongitude) {
  const birthDateTime = new Date(birthDate + 'T' + birthTime)
  const jd = getJulianDay(birthDateTime)
  
  // Calculate what ayanamsa would give us the correct nirayana longitude
  const calculatedAyanamsa = knownTropicalLongitude - knownNirayanaLongitude
  
  return {
    julianDay: jd,
    calculatedAyanamsa: calculatedAyanamsa,
    difference: calculatedAyanamsa - getAyanamsa(jd)
  }
}

// Debug function
export function debugSimplePlanetPosition(birthDate, birthTime, planet) {
  try {
    const birthDateTime = new Date(birthDate + 'T' + birthTime)
    const jd = getJulianDay(birthDateTime)
    const ayanamsa = getAyanamsa(jd)
    
    let tropicalLongitude = 0
    
    if (planet === 'sun') {
      tropicalLongitude = getSunPosition(jd)
    } else if (planet === 'moon') {
      tropicalLongitude = getMoonPosition(jd)
    } else {
      tropicalLongitude = getPlanetPosition(jd, planet)
    }
    
    // Debug logging
    console.log('Debug values:', {
      jd: jd,
      ayanamsa: ayanamsa,
      tropicalLongitude: tropicalLongitude,
      planet: planet
    })
    
    let nirayanaLongitude = (tropicalLongitude - ayanamsa + 360) % 360
    if (nirayanaLongitude < 0) nirayanaLongitude += 360
    
    return {
      julianDay: jd,
      ayanamsa: ayanamsa,
      tropicalLongitude: tropicalLongitude,
      nirayanaLongitude: nirayanaLongitude,
      rashi: getRashiFromLongitude(nirayanaLongitude),
      degreeInRashi: nirayanaLongitude % 30,
      nakshatra: getNakshatraFromLongitude(nirayanaLongitude)
    }
  } catch (error) {
    console.error('Error in debugSimplePlanetPosition:', error)
    throw error
  }
} 