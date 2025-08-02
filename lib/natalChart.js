// Natal Chart Calculations for Vedic Astrology
// Calculates birth chart (Kundali) from birth date, time, and location

import { getJulianDay, getAyanamsa } from './astronomy.js'

// Planetary positions calculation functions
function getPlanetPosition(jd, planet) {
  const t = (jd - 2451545.0) / 36525
  
  // Planetary orbital elements (simplified)
  const elements = {
    sun: { L0: 280.46645, L1: 36000.76983, M0: 357.52910, M1: 35999.05030 },
    moon: { L0: 218.3164477, L1: 481267.88123421, M0: 134.9633964, M1: 477198.8675055 },
    mars: { L0: 355.433275, L1: 19141.6964746, M0: 19.373064, M1: 19140.3026849 },
    mercury: { L0: 252.250906, L1: 149472.6746358, M0: 168.656222, M1: 149472.5158659 },
    jupiter: { L0: 34.351519, L1: 3034.9056606, M0: 20.0202, M1: 3034.9056606 },
    venus: { L0: 181.979801, L1: 58517.8153876, M0: 48.330893, M1: 58517.8153876 },
    saturn: { L0: 50.077471, L1: 1222.1137943, M0: 317.020679, M1: 1222.1137943 },
    rahu: { L0: 125.044555, L1: -1934.1362619, M0: 318.15, M1: -1934.1362619 },
    ketu: { L0: 305.044555, L1: -1934.1362619, M0: 138.15, M1: -1934.1362619 }
  }
  
  const elem = elements[planet]
  if (!elem) return null
  
  const L = elem.L0 + elem.L1 * t
  const M = elem.M0 + elem.M1 * t
  
  // Simplified position calculation
  let longitude = L % 360
  if (longitude < 0) longitude += 360
  
  return longitude
}

// Calculate Ascendant (Lagna)
function getAscendant(jd, latitude, longitude) {
  const t = (jd - 2451545.0) / 36525
  
  // Calculate Local Sidereal Time (LST)
  const T0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000
  const lst = (T0 + longitude) % 360
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

// Calculate planetary positions for natal chart
export function calculateNatalChart(birthDate, birthTime, latitude, longitude) {
  // Combine date and time
  const birthDateTime = new Date(birthDate + 'T' + birthTime)
  const jd = getJulianDay(birthDateTime)
  const ayanamsa = getAyanamsa(jd)
  
  // Calculate planetary positions
  const planets = {}
  const planetNames = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']
  
  planetNames.forEach(planet => {
    const longitude = getPlanetPosition(jd, planet)
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
  
  // Calculate Ascendant
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

// Calculate dosha balance from natal chart
export function calculateDoshas(natalChart) {
  const doshas = { vata: 0, pitta: 0, kapha: 0 }
  
  // Dosha associations with elements and planets
  const doshaElements = {
    vata: ['air', 'ether'],
    pitta: ['fire'],
    kapha: ['earth', 'water']
  }
  
  const planetElements = {
    sun: 'fire',
    moon: 'water',
    mars: 'fire',
    mercury: 'earth',
    jupiter: 'ether',
    venus: 'water',
    saturn: 'air',
    rahu: 'air',
    ketu: 'fire'
  }
  
  const rashiElements = {
    'Aries': 'fire', 'Taurus': 'earth', 'Gemini': 'air', 'Cancer': 'water',
    'Leo': 'fire', 'Virgo': 'earth', 'Libra': 'air', 'Scorpio': 'water',
    'Sagittarius': 'fire', 'Capricorn': 'earth', 'Aquarius': 'air', 'Pisces': 'water'
  }
  
  // Calculate dosha from planets
  Object.entries(natalChart.planets).forEach(([planet, data]) => {
    const element = planetElements[planet]
    if (element) {
      Object.entries(doshaElements).forEach(([dosha, elements]) => {
        if (elements.includes(element)) {
          doshas[dosha] += 1
        }
      })
    }
  })
  
  // Calculate dosha from Ascendant
  const ascendantElement = rashiElements[natalChart.ascendant.rashi]
  Object.entries(doshaElements).forEach(([dosha, elements]) => {
    if (elements.includes(ascendantElement)) {
      doshas[dosha] += 2 // Ascendant has more weight
    }
  })
  
  // Normalize doshas
  const total = Object.values(doshas).reduce((sum, val) => sum + val, 0)
  Object.keys(doshas).forEach(dosha => {
    doshas[dosha] = Math.round((doshas[dosha] / total) * 100)
  })
  
  return doshas
}

// Format natal chart for AI analysis
export function formatNatalChartForAI(natalChart, doshas) {
  return {
    birthDateTime: natalChart.birthDateTime.toISOString(),
    ayanamsa: natalChart.ayanamsa,
    ascendant: {
      rashi: natalChart.ascendant.rashi,
      degree: natalChart.ascendant.degreeInRashi,
      nakshatra: natalChart.ascendant.nakshatra
    },
    planets: Object.entries(natalChart.planets).map(([planet, data]) => ({
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
      rashi: data.rashi,
      degree: data.degreeInRashi,
      nakshatra: data.nakshatra
    })),
    houses: natalChart.houses.map(house => ({
      house: house.house,
      rashi: house.rashi,
      degree: house.degreeInRashi
    })),
    doshas: doshas
  }
} 