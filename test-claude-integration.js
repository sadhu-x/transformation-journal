// Claude API Integration Test Script
// Copy and paste this into your browser console

async function testClaudeIntegration() {
  console.log('🤖 Testing Claude API Integration...')
  
  try {
    // Test 1: Check Claude API status
    console.log('\n1. Checking Claude API status...')
    const statusResponse = await fetch('/api/claude')
    const status = await statusResponse.json()
    console.log('Status:', status)
    
    // Test 2: Test Claude API connection
    console.log('\n2. Testing Claude API connection...')
    const testResponse = await fetch('/api/claude?action=test')
    const testResult = await testResponse.json()
    console.log('Connection test:', testResult)
    
    // Test 3: Test manual analysis
    console.log('\n3. Testing manual analysis...')
    const analysisResponse = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: "I'm feeling grateful today for the beautiful weather and the support of my friends. I want to focus on maintaining this positive energy throughout the week and continue my meditation practice.",
        entryId: 'test-entry'
      })
    })
    
    const analysisResult = await analysisResponse.json()
    console.log('Analysis result:', analysisResult)
    
    // Summary
    console.log('\n📊 Test Summary:')
    console.log('✅ Status check:', statusResponse.ok ? 'PASSED' : 'FAILED')
    console.log('✅ Connection test:', testResponse.ok ? 'PASSED' : 'FAILED')
    console.log('✅ Analysis test:', analysisResponse.ok ? 'PASSED' : 'FAILED')
    
    if (statusResponse.ok && testResponse.ok && analysisResponse.ok) {
      console.log('\n🎉 All tests passed! Claude API integration is working correctly.')
    } else {
      console.log('\n❌ Some tests failed. Check the error messages above.')
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testClaudeIntegration()
