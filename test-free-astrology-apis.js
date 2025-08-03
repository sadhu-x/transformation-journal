// Test script for free astrology APIs
// Run with: node test-free-astrology-apis.js

const https = require('https');

// Test data
const birthData = {
  day: 15,
  month: 1,
  year: 1990,
  hour: 6,
  min: 30,
  lat: 23.1765,
  lon: 75.7885,
  tzone: 5.5
};

// Function to make HTTPS requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test different APIs
async function testAPIs() {
  console.log('=== Testing Free Astrology APIs ===\n');
  
  // Test 1: Vedic Astro API
  console.log('1. Testing Vedic Astro API...');
  try {
    const result1 = await makeRequest('https://api.vedicastroapi.com/v3-json/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(birthData)
    });
    console.log('Status:', result1.status);
    console.log('Response:', JSON.stringify(result1.data, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log('Error:', error.message);
  }
  console.log('\n---\n');
  
  // Test 2: Astrology API
  console.log('2. Testing Astrology API...');
  try {
    const result2 = await makeRequest('https://json.astrologyapi.com/v1/basic_horo_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(birthData)
    });
    console.log('Status:', result2.status);
    console.log('Response:', JSON.stringify(result2.data, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log('Error:', error.message);
  }
  console.log('\n---\n');
  
  // Test 3: Try a different endpoint
  console.log('3. Testing Vedic Astro API - different endpoint...');
  try {
    const result3 = await makeRequest('https://api.vedicastroapi.com/v3-json/horoscope', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(birthData)
    });
    console.log('Status:', result3.status);
    console.log('Response:', JSON.stringify(result3.data, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log('Error:', error.message);
  }
  console.log('\n---\n');
  
  // Test 4: Try a simple GET request
  console.log('4. Testing simple GET request...');
  try {
    const result4 = await makeRequest('https://api.vedicastroapi.com/v3-json/planets');
    console.log('Status:', result4.status);
    console.log('Response:', JSON.stringify(result4.data, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log('Error:', error.message);
  }
  console.log('\n---\n');
  
  // Test 5: Try a different free API
  console.log('5. Testing alternative free API...');
  try {
    const result5 = await makeRequest('https://horoscope-api.herokuapp.com/horoscope/today/aries');
    console.log('Status:', result5.status);
    console.log('Response:', JSON.stringify(result5.data, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log('Error:', error.message);
  }
  console.log('\n=== Testing Complete ===');
}

// Run the tests
testAPIs().catch(console.error); 