// Accurate Natal Chart Calculations for Vedic Astrology
// Uses more precise astronomical algorithms for planetary positions

import { getJulianDay, getAyanamsa } from './astronomy.js'

// More accurate planetary position calculations
function getAccuratePlanetPosition(jd, planet) {
  const t = (jd - 2451545.0) / 36525
  
  // More accurate orbital elements and calculations
  const planetData = {
    sun: {
      L0: 280.46645 + 36000.76983 * t + 0.0003032 * t * t,
      M: 357.52910 + 35999.05030 * t - 0.0001559 * t * t - 0.00000048 * t * t * t,
      C: (1.914600 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * Math.PI / 180) +
         (0.019993 - 0.000101 * t) * Math.sin(2 * M * Math.PI / 180) +
         0.000290 * Math.sin(3 * M * Math.PI / 180)
    },
    moon: {
      // More accurate moon calculation using multiple terms
      L: 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + t * t * t / 538841 - t * t * t * t / 65194000,
      D: 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t + t * t * t / 545868 - t * t * t * t / 113065000,
      M: 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t + t * t * t / 69699 - t * t * t * t / 14712000,
      M_: 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t + t * t * t / 24490000
    },
    mars: {
      L: 355.433275 + 19141.6964746 * t - 0.0003106 * t * t + t * t * t / 153400,
      M: 19.373064 + 19140.3026849 * t - 0.0002236 * t * t + t * t * t / 24490000
    },
    mercury: {
      L: 252.250906 + 149472.6746358 * t - 0.0005363 * t * t + t * t * t / 24490000,
      M: 168.656222 + 149472.5158659 * t - 0.0003106 * t * t + t * t * t / 24490000
    },
    jupiter: {
      L: 34.351519 + 3034.9056606 * t - 0.0000850 * t * t + t * t * t / 24490000,
      M: 20.0202 + 3034.9056606 * t - 0.0000850 * t * t + t * t * t / 24490000
    },
    venus: {
      L: 181.979801 + 58517.8153876 * t + 0.0003106 * t * t + t * t * t / 24490000,
      M: 48.330893 + 58517.8153876 * t + 0.0003106 * t * t + t * t * t / 24490000
    },
    saturn: {
      L: 50.077471 + 1222.1137943 * t + 0.0002104 * t * t + t * t * t / 24490000,
      M: 317.020679 + 1222.1137943 * t + 0.0002104 * t * t + t * t * t / 24490000
    }
  }
  
  const data = planetData[planet]
  if (!data) return null
  
  let longitude = 0
  
  if (planet === 'sun') {
    longitude = data.L0 + data.C
  } else if (planet === 'moon') {
    // More complex moon calculation with perturbations
    const D = data.D * Math.PI / 180
    const M = data.M * Math.PI / 180
    const M_ = data.M_ * Math.PI / 180
    
    // Main terms for moon longitude
    longitude = data.L + 
      6.288774 * Math.sin(M) +
      1.274018 * Math.sin(2 * D - M) +
      0.658314 * Math.sin(2 * D) +
      0.213618 * Math.sin(2 * M) +
      0.185596 * Math.sin(M_) +
      0.114332 * Math.sin(2 * D - 2 * M) +
      0.058793 * Math.sin(2 * D - M - M_) +
      0.057212 * Math.sin(2 * D - M + M_) +
      0.053320 * Math.sin(2 * D + M) +
      0.045874 * Math.sin(2 * D - M_) +
      0.041024 * Math.sin(M - M_) +
      0.034718 * Math.sin(D) +
      0.030465 * Math.sin(M + M_) +
      0.015326 * Math.sin(2 * D - 2 * M_) +
      0.015268 * Math.sin(M_) +
      0.012678 * Math.sin(2 * D + M - M_) +
      0.010986 * Math.sin(2 * D - M + 2 * M_) +
      0.010674 * Math.sin(2 * D - 2 * M + M_) +
      0.010034 * Math.sin(2 * D + 2 * M) +
      0.008548 * Math.sin(2 * D - M - 2 * M_) +
      0.007994 * Math.sin(2 * D - 2 * M - M_) +
      0.006783 * Math.sin(2 * D + M + M_) +
      0.005162 * Math.sin(M - 2 * M_) +
      0.005000 * Math.sin(M + 2 * M_) +
      0.004049 * Math.sin(2 * D - M - M_) +
      0.003996 * Math.sin(2 * D + M - M_) +
      0.003862 * Math.sin(2 * D - 2 * M + 2 * M_) +
      0.003665 * Math.sin(2 * D - 2 * M - 2 * M_) +
      0.002695 * Math.sin(2 * D - 2 * M + M_) +
      0.002602 * Math.sin(2 * D - M + 2 * M_) +
      0.002396 * Math.sin(2 * D - M - 2 * M_) +
      0.002349 * Math.sin(M + 2 * M_) +
      0.002249 * Math.sin(2 * D - M - M_) +
      0.002125 * Math.sin(2 * D + 2 * M + M_) +
      0.002079 * Math.sin(2 * D + 2 * M - M_) +
      0.002059 * Math.sin(2 * D - 2 * M - M_) +
      0.001773 * Math.sin(2 * D + M - 2 * M_) +
      0.001595 * Math.sin(2 * D + M + 2 * M_) +
      0.001220 * Math.sin(4 * D - M) +
      0.001110 * Math.sin(4 * D - 2 * M) +
      0.000892 * Math.sin(M - 3 * M_) +
      0.000811 * Math.sin(2 * D + M + M_) +
      0.000761 * Math.sin(4 * D - M - M_) +
      0.000717 * Math.sin(M - 2 * M_) +
      0.000704 * Math.sin(2 * D - M - 2 * M_) +
      0.000693 * Math.sin(M + 2 * M_) +
      0.000598 * Math.sin(2 * D - 2 * M + M_) +
      0.000550 * Math.sin(4 * D + M) +
      0.000538 * Math.sin(4 * D - M) +
      0.000521 * Math.sin(4 * D - M) +
      0.000486 * Math.sin(2 * D - 2 * M - M_)
    
    longitude = longitude * 180 / Math.PI
  } else {
    // For other planets, use simpler calculation
    longitude = data.L
  }
  
  // Normalize to 0-360 degrees
  longitude = longitude % 360
  if (longitude < 0) longitude += 360
  
  return longitude
}

// Calculate Rahu and Ketu (Lunar Nodes)
function getLunarNodes(jd) {
  const t = (jd - 2451545.0) / 36525
  
  // Rahu (North Node) calculation
  const rahuLongitude = 125.044555 - 1934.1362619 * t + 0.0020762 * t * t + t * t * t / 467410 - t * t * t * t / 60616000
  
  // Ketu (South Node) is 180 degrees opposite to Rahu
  const ketuLongitude = (rahuLongitude + 180) % 360
  
  return {
    rahu: rahuLongitude,
    ketu: ketuLongitude
  }
}

// Calculate Ascendant (Lagna) with better accuracy
function getAccurateAscendant(jd, latitude, longitude) {
  const t = (jd - 2451545.0) / 36525
  
  // Calculate Local Sidereal Time (LST) with better precision
  const T0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000
  let lst = (T0 + longitude) % 360
  if (lst < 0) lst += 360
  
  // Calculate Ascendant with better obliquity
  const obliquity = 23.439 - 0.0000004 * t
  const tanA = (Math.sin(lst * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180) + 
                Math.tan(latitude * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180)) / 
               Math.cos(lst * Math.PI / 180)
  
  let ascendant = Math.atan(tanA) * 180 / Math.PI
  if (lst > 180) ascendant += 180
  if (ascendant < 0) ascendant += 360
  
  return ascendant
}

// Calculate accurate natal chart
export function calculateAccurateNatalChart(birthDate, birthTime, latitude, longitude) {
  // Combine date and time
  const birthDateTime = new Date(birthDate + 'T' + birthTime)
  const jd = getJulianDay(birthDateTime)
  const ayanamsa = getAyanamsa(jd)
  
  // Calculate planetary positions
  const planets = {}
  const planetNames = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
  
  planetNames.forEach(planet => {
    const longitude = getAccuratePlanetPosition(jd, planet)
    if (longitude !== null) {
      const nirayanaLongitude = (longitude - ayanamsa + 360) % 360
      planets[planet] = {
        longitude: nirayanaLongitude,
        rashi: getRashiFromLongitude(nirayanaLongitude),
        degreeInRashi: nirayanaLongitude % 30,
        nakshatra: getNakshatraFromLongitude(nirayanaLongitude)
      }
    }
  })
  
  // Calculate Rahu and Ketu
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
  
  // Calculate Ascendant
  const ascendantLongitude = getAccurateAscendant(jd, latitude, longitude)
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
}

// Helper functions
function getRashiFromLongitude(longitude) {
  const rashis = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ]
  const rashiIndex = Math.floor(longitude / 30)
  return rashis[rashiIndex]
}

function getNakshatraFromLongitude(longitude) {
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ]
  const nakshatraIndex = Math.floor(longitude / 13.333333)
  return nakshatras[nakshatraIndex]
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

// Debug function to check calculations
export function debugPlanetPosition(birthDate, birthTime, planet) {
  const birthDateTime = new Date(birthDate + 'T' + birthTime)
  const jd = getJulianDay(birthDateTime)
  const ayanamsa = getAyanamsa(jd)
  
  const tropicalLongitude = getAccuratePlanetPosition(jd, planet)
  const nirayanaLongitude = (tropicalLongitude - ayanamsa + 360) % 360
  
  return {
    julianDay: jd,
    ayanamsa: ayanamsa,
    tropicalLongitude: tropicalLongitude,
    nirayanaLongitude: nirayanaLongitude,
    rashi: getRashiFromLongitude(nirayanaLongitude),
    degreeInRashi: nirayanaLongitude % 30,
    nakshatra: getNakshatraFromLongitude(nirayanaLongitude)
  }
} 