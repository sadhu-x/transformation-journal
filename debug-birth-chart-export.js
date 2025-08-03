// Debug script for birth chart export functionality
// Run this in the browser console to test the export process

// Test function to debug birth chart export
async function debugBirthChartExport() {
  console.log('=== Debugging Birth Chart Export ===')
  
  try {
    // 1. Check if user is authenticated
    console.log('1. Checking authentication...')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ No authenticated user')
      return
    }
    console.log('✅ User authenticated:', user.id)
    
    // 2. Get user profile
    console.log('2. Getting user profile...')
    const userProfile = await getUserProfile()
    if (!userProfile) {
      console.log('❌ No user profile found')
      return
    }
    console.log('✅ User profile:', userProfile)
    
    // 3. Check birth data
    console.log('3. Checking birth data...')
    const birthData = {
      birthDate: userProfile.birth_date,
      birthTime: userProfile.birth_time,
      birthLatitude: userProfile.birth_latitude,
      birthLongitude: userProfile.birth_longitude
    }
    console.log('Birth data:', birthData)
    
    if (!birthData.birthDate || !birthData.birthTime || !birthData.birthLatitude || !birthData.birthLongitude) {
      console.log('❌ Incomplete birth data')
      return
    }
    console.log('✅ Birth data complete')
    
    // 4. Check stored birth chart data
    console.log('4. Checking stored birth chart data...')
    const storedData = await getBirthChartData(
      birthData.birthDate,
      birthData.birthTime,
      birthData.birthLatitude,
      birthData.birthLongitude
    )
    
    if (storedData) {
      console.log('✅ Found stored birth chart data:')
      console.log('- Ascendant:', storedData.ascendant_rashi, storedData.ascendant_degree, storedData.ascendant_nakshatra)
      console.log('- Planets count:', storedData.planets?.length || 0)
      console.log('- Houses count:', storedData.houses?.length || 0)
      console.log('- Has raw response:', !!storedData.raw_api_response)
      
      // Show first few planets
      if (storedData.planets && storedData.planets.length > 0) {
        console.log('- Sample planets:')
        storedData.planets.slice(0, 3).forEach(p => {
          console.log(`  * ${p.planet}: ${p.rashi} ${p.degree}° - ${p.nakshatra}`)
        })
      }
    } else {
      console.log('❌ No stored birth chart data found')
    }
    
    // 5. Test API call
    console.log('5. Testing API call...')
    const apiResult = await getNatalChartAPI(
      birthData.birthDate,
      birthData.birthTime,
      birthData.birthLatitude,
      birthData.birthLongitude
    )
    
    if (apiResult) {
      console.log('✅ API call successful:')
      console.log('- Ascendant:', apiResult.ascendant?.rashi, apiResult.ascendant?.degree, apiResult.ascendant?.nakshatra)
      console.log('- Planets count:', apiResult.planets?.length || 0)
      console.log('- Houses count:', apiResult.houses?.length || 0)
    } else {
      console.log('❌ API call failed')
    }
    
    // 6. Test fetch and store
    console.log('6. Testing fetch and store...')
    const fetchResult = await fetchAndStoreBirthChart(
      birthData.birthDate,
      birthData.birthTime,
      birthData.birthLatitude,
      birthData.birthLongitude
    )
    
    console.log('Fetch result:', fetchResult)
    
    // 7. Test export data generation
    console.log('7. Testing export data generation...')
    const exportData = await exportData()
    
    if (exportData && exportData.natalChart) {
      console.log('✅ Export data generated:')
      console.log('- Natal chart data:', exportData.natalChart)
      console.log('- Instructions length:', exportData.instructions?.length || 0)
    } else {
      console.log('❌ Export data generation failed')
    }
    
    console.log('=== Debug Complete ===')
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

// Test function to validate birth chart data format
function validateBirthChartFormat(chartData) {
  console.log('=== Validating Birth Chart Format ===')
  
  if (!chartData) {
    console.log('❌ No chart data provided')
    return false
  }
  
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  }
  
  // Check ascendant
  if (!chartData.ascendant) {
    validation.errors.push('Missing ascendant data')
    validation.isValid = false
  } else {
    console.log('✅ Ascendant:', chartData.ascendant)
  }
  
  // Check planets
  if (!chartData.planets || !Array.isArray(chartData.planets)) {
    validation.errors.push('Missing or invalid planets data')
    validation.isValid = false
  } else {
    console.log('✅ Planets count:', chartData.planets.length)
    chartData.planets.forEach((p, i) => {
      if (!p.planet || !p.rashi) {
        validation.warnings.push(`Planet ${i} missing required fields`)
      }
    })
  }
  
  // Check houses
  if (!chartData.houses || !Array.isArray(chartData.houses)) {
    validation.warnings.push('Missing or invalid houses data')
  } else {
    console.log('✅ Houses count:', chartData.houses.length)
  }
  
  // Check doshas
  if (chartData.doshas) {
    console.log('✅ Doshas:', chartData.doshas)
  } else {
    validation.warnings.push('No dosha data')
  }
  
  console.log('Validation result:', validation)
  return validation.isValid
}

// Export functions for use in browser console
window.debugBirthChartExport = debugBirthChartExport
window.validateBirthChartFormat = validateBirthChartFormat

console.log('Debug functions loaded:')
console.log('- debugBirthChartExport() - Test the entire export process')
console.log('- validateBirthChartFormat(chartData) - Validate birth chart data format') 