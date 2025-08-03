// Test script for birth chart data validation
// Run this in the browser console to test your birth chart data

// Sample data from your API response
const sampleBirthChartData = {
  "status": "ok",
  "data": {
    "divisional_positions": [
      {
        "house": {
          "id": 0,
          "name": "Tanu",
          "number": 1
        },
        "rasi": {
          "id": 3,
          "name": "Karka",
          "lord": {
            "id": 1,
            "name": "Moon",
            "vedic_name": "Chandra"
          }
        },
        "planet_positions": [
          {
            "planet": {
              "id": 100,
              "name": "Ascendant",
              "vedic_name": "Lagna"
            },
            "nakshatra": {
              "id": 7,
              "name": "Pushya",
              "lord": {
                "id": 6,
                "name": "Saturn",
                "vedic_name": "Shani"
              }
            },
            "house": {
              "id": 0,
              "name": "Tanu",
              "number": 1
            },
            "rasi": {
              "id": 3,
              "name": "Karka",
              "lord": {
                "id": 1,
                "name": "Moon",
                "vedic_name": "Chandra"
              }
            },
            "division": {
              "id": 0,
              "number": 1,
              "name": "1st House"
            },
            "sign_degree": 6.161997291149575,
            "sign_degree_dms": "6° 9' 43\"",
            "longitude": 96.16199729114958,
            "longitude_dms": "96° 9' 43\""
          }
        ]
      },
      {
        "house": {
          "id": 1,
          "name": "Dhan",
          "number": 2
        },
        "rasi": {
          "id": 4,
          "name": "Simha",
          "lord": {
            "id": 0,
            "name": "Sun",
            "vedic_name": "Ravi"
          }
        },
        "planet_positions": []
      },
      {
        "house": {
          "id": 2,
          "name": "Sahaj",
          "number": 3
        },
        "rasi": {
          "id": 5,
          "name": "Kanya",
          "lord": {
            "id": 2,
            "name": "Mercury",
            "vedic_name": "Budha"
          }
        },
        "planet_positions": [
          {
            "planet": {
              "id": 102,
              "name": "Ketu",
              "vedic_name": "Ketu"
            },
            "nakshatra": {
              "id": 13,
              "name": "Chitra",
              "lord": {
                "id": 4,
                "name": "Mars",
                "vedic_name": "Kuja"
              }
            },
            "house": {
              "id": 2,
              "name": "Sahaj",
              "number": 3
            },
            "rasi": {
              "id": 5,
              "name": "Kanya",
              "lord": {
                "id": 2,
                "name": "Mercury",
                "vedic_name": "Budha"
              }
            },
            "division": {
              "id": 0,
              "number": 1,
              "name": "1st House"
            },
            "sign_degree": 27.23518555498822,
            "sign_degree_dms": "27° 14' 6\"",
            "longitude": 177.23518555498822,
            "longitude_dms": "177° 14' 6\""
          }
        ]
      }
    ]
  }
};

// Test the formatting function
function testFormatProkeralaData(data) {
  console.log('=== Testing Prokerala Data Formatting ===');
  
  try {
    // Simulate the formatProkeralaData function logic
    let actualData = data;
    if (data.data) {
      actualData = data.data;
    }
    
    const planets = [];
    let ascendant = {
      rashi: 'Unknown',
      degree: 0,
      nakshatra: 'Unknown'
    };
    
    // Process divisional_positions
    if (actualData.divisional_positions && Array.isArray(actualData.divisional_positions)) {
      console.log('Processing divisional_positions format');
      
      actualData.divisional_positions.forEach((houseData, houseIndex) => {
        console.log(`Processing house ${houseIndex + 1}:`, houseData);
        
        if (houseData.planet_positions && Array.isArray(houseData.planet_positions)) {
          houseData.planet_positions.forEach((planetData) => {
            console.log('Processing planet:', planetData.planet);
            
            const planet = {
              planet: planetData.planet.name || planetData.planet.vedic_name || 'Unknown',
              rashi: planetData.rasi.name || 'Unknown',
              degree: parseFloat(planetData.sign_degree) || 0,
              nakshatra: planetData.nakshatra.name || 'Unknown',
              house: houseData.house.number || houseIndex + 1,
              longitude: parseFloat(planetData.longitude) || 0,
              longitude_dms: planetData.longitude_dms || '0° 0\' 0"',
              sign_degree_dms: planetData.sign_degree_dms || '0° 0\' 0"'
            };
            
            planets.push(planet);
            console.log('Added planet:', planet);
          });
        }
      });
    }
    
    // Find ascendant
    if (actualData.divisional_positions && actualData.divisional_positions.length > 0) {
      const firstHouse = actualData.divisional_positions[0];
      if (firstHouse.planet_positions && firstHouse.planet_positions.length > 0) {
        const ascendantPlanet = firstHouse.planet_positions.find(p => 
          p.planet.name === 'Ascendant' || p.planet.vedic_name === 'Lagna'
        );
        if (ascendantPlanet) {
          console.log('Found ascendant in divisional_positions:', ascendantPlanet);
          ascendant = {
            rashi: ascendantPlanet.rasi.name || 'Unknown',
            degree: parseFloat(ascendantPlanet.sign_degree) || 0,
            nakshatra: ascendantPlanet.nakshatra.name || 'Unknown',
            longitude: parseFloat(ascendantPlanet.longitude) || 0,
            longitude_dms: ascendantPlanet.longitude_dms || '0° 0\' 0"',
            sign_degree_dms: ascendantPlanet.sign_degree_dms || '0° 0\' 0"'
          };
        }
      }
    }
    
    // Generate houses
    const houses = actualData.divisional_positions ? 
      actualData.divisional_positions.map((houseData, index) => ({
        house: index + 1,
        rashi: houseData.rasi.name || 'Unknown',
        degree: 0,
        lord: houseData.rasi.lord?.name || houseData.rasi.lord?.vedic_name || 'Unknown'
      })) : [];
    
    const result = {
      ascendant,
      planets,
      houses,
      raw_response: data
    };
    
    console.log('=== Formatting Result ===');
    console.log('Ascendant:', result.ascendant);
    console.log('Planets count:', result.planets.length);
    console.log('Planets:', result.planets);
    console.log('Houses count:', result.houses.length);
    console.log('Houses:', result.houses);
    
    return result;
    
  } catch (error) {
    console.error('Error in test formatting:', error);
    return null;
  }
}

// Run the test
const formattedData = testFormatProkeralaData(sampleBirthChartData);

// Validate the result
if (formattedData) {
  console.log('=== Validation ===');
  console.log('✅ Formatting successful');
  console.log('✅ Ascendant found:', formattedData.ascendant.rashi !== 'Unknown');
  console.log('✅ Planets found:', formattedData.planets.length);
  console.log('✅ Houses found:', formattedData.houses.length);
  
  // Check for specific planets
  const planetNames = formattedData.planets.map(p => p.planet);
  console.log('Planets found:', planetNames);
  
  // Check ascendant details
  console.log('Ascendant details:', {
    rashi: formattedData.ascendant.rashi,
    degree: formattedData.ascendant.degree,
    nakshatra: formattedData.ascendant.nakshatra,
    longitude: formattedData.ascendant.longitude,
    longitude_dms: formattedData.ascendant.longitude_dms
  });
} else {
  console.log('❌ Formatting failed');
}

// Export for use in browser console
window.testBirthChartData = testFormatProkeralaData;
window.sampleBirthChartData = sampleBirthChartData; 