# Birth Chart Data Format Documentation

This document explains the enhanced birth chart data format that supports detailed divisional positions from the Prokerala API.

## Overview

The birth chart data system now supports the comprehensive `divisional_positions` format from Prokerala API, which provides detailed information about:
- Planetary positions in houses
- Ascendant (Lagna) details
- House lords and characteristics
- Nakshatra information
- Precise degree measurements

## Data Structure

### Raw API Response Format

The Prokerala API returns data in this structure:

```json
{
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
      }
    ]
  }
}
```

### Formatted Data Structure

After processing, the data is formatted into this structure:

```json
{
  "ascendant": {
    "rashi": "Karka",
    "degree": 6.16,
    "nakshatra": "Pushya",
    "longitude": 96.16,
    "longitude_dms": "96° 9' 43\"",
    "sign_degree_dms": "6° 9' 43\""
  },
  "planets": [
    {
      "planet": "Ascendant",
      "rashi": "Karka",
      "degree": 6.16,
      "nakshatra": "Pushya",
      "house": 1,
      "longitude": 96.16,
      "longitude_dms": "96° 9' 43\"",
      "sign_degree_dms": "6° 9' 43\""
    },
    {
      "planet": "Ketu",
      "rashi": "Kanya",
      "degree": 27.24,
      "nakshatra": "Chitra",
      "house": 3,
      "longitude": 177.24,
      "longitude_dms": "177° 14' 6\"",
      "sign_degree_dms": "27° 14' 6\""
    }
  ],
  "houses": [
    {
      "house": 1,
      "rashi": "Karka",
      "degree": 0,
      "lord": "Moon"
    },
    {
      "house": 2,
      "rashi": "Simha",
      "degree": 0,
      "lord": "Sun"
    }
  ],
  "raw_response": { /* Original API response */ }
}
```

## Database Schema

### Enhanced `birth_chart_data` Table

```sql
CREATE TABLE birth_chart_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_latitude DECIMAL(10, 6) NOT NULL,
  birth_longitude DECIMAL(10, 6) NOT NULL,
  ascendant_rashi TEXT,
  ascendant_degree DECIMAL(5, 2),
  ascendant_nakshatra TEXT,
  ascendant_longitude DECIMAL(10, 6),           -- NEW
  ascendant_longitude_dms TEXT,                 -- NEW
  ascendant_sign_degree_dms TEXT,               -- NEW
  planets JSONB, -- Enhanced planetary data
  houses JSONB, -- Enhanced house data
  raw_api_response JSONB,                       -- NEW
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, birth_date, birth_time, birth_latitude, birth_longitude)
);
```

## Key Features

### 1. **Enhanced Planetary Data**
- **Precise Degrees**: Both decimal and DMS (degrees, minutes, seconds) format
- **House Positions**: Which house each planet occupies
- **Nakshatra Details**: Lunar mansion with lord information
- **Longitude Data**: Absolute celestial longitude

### 2. **Detailed Ascendant Information**
- **Rashi**: Zodiac sign of the ascendant
- **Degree**: Degree within the sign
- **Nakshatra**: Lunar mansion of the ascendant
- **Longitude**: Absolute celestial longitude
- **DMS Format**: Human-readable degree format

### 3. **House Information**
- **House Numbers**: 1-12 houses
- **Rashi**: Zodiac sign of each house
- **Lord**: Planetary lord of each house
- **Characteristics**: House names and meanings

### 4. **Raw Data Storage**
- **API Response**: Original API response stored for debugging
- **Data Validation**: Easy to verify data integrity
- **Future Enhancements**: Access to full API data for new features

## Usage Examples

### 1. **Fetching Birth Chart Data**

```javascript
import { getBirthChartData } from './lib/dataService.js'

const birthChart = await getBirthChartData(
  '1990-01-15',
  '06:30',
  '23.1765',
  '75.7885'
)

if (birthChart) {
  console.log('Ascendant:', birthChart.ascendant_rashi)
  console.log('Planets:', birthChart.planets.length)
  console.log('Houses:', birthChart.houses.length)
}
```

### 2. **Calculating and Storing Birth Chart**

```javascript
import { fetchAndStoreBirthChart } from './lib/dataService.js'

const result = await fetchAndStoreBirthChart(
  '1990-01-15',
  '06:30',
  '23.1765',
  '75.7885'
)

if (result.success) {
  console.log('Birth chart stored successfully')
  console.log('Cached:', result.cached)
  console.log('Data:', result.data)
}
```

### 3. **Validating Birth Chart Data**

```javascript
import { validateBirthChartData } from './lib/dataService.js'

const validation = validateBirthChartData(birthChartData)

if (validation.isValid) {
  console.log('✅ Birth chart data is valid')
  console.log('Planets found:', validation.summary.planets.count)
  console.log('Houses found:', validation.summary.houses.count)
} else {
  console.log('❌ Validation errors:', validation.errors)
}
```

### 4. **Debugging Birth Chart Data**

```javascript
import { debugBirthChartData } from './lib/dataService.js'

// Check all birth chart data for current user
await debugBirthChartData()
```

## Testing

### 1. **Test Script**

Use the `test-birth-chart.js` file to validate data formatting:

```javascript
// In browser console
const testData = testFormatProkeralaData(sampleBirthChartData)
console.log('Test result:', testData)
```

### 2. **Validation Functions**

```javascript
// Validate specific birth chart data
const validation = validateBirthChartData(chartData)
console.log('Validation:', validation)
```

## API Integration

### 1. **Prokerala API Endpoints**

The system supports multiple Prokerala endpoints:
- `/divisional-position` (primary)
- `/kundli` (fallback)

### 2. **Data Processing**

The `formatProkeralaData` function handles:
- Multiple response formats
- Fallback mechanisms
- Error handling
- Data validation

### 3. **Storage Strategy**

- **Caching**: Avoids repeated API calls
- **Upsert**: Updates existing records
- **Validation**: Ensures data integrity
- **Debugging**: Stores raw API responses

## Error Handling

### 1. **Common Issues**

- **Missing API Credentials**: Check environment variables
- **Invalid Birth Data**: Validate date/time/coordinates
- **API Rate Limits**: Implement retry logic
- **Network Issues**: Graceful fallbacks

### 2. **Debugging Steps**

1. Check browser console for error messages
2. Verify API credentials are set
3. Validate birth data format
4. Test API connectivity
5. Check database schema

## Future Enhancements

### 1. **Additional Divisional Charts**
- Navamsa (9th division)
- Dasamsa (10th division)
- Other varga charts

### 2. **Advanced Calculations**
- Planetary aspects
- Dasha calculations
- Transit analysis

### 3. **Enhanced Storage**
- Multiple chart types
- Historical calculations
- Comparison features

## Security Considerations

### 1. **Data Privacy**
- Row Level Security (RLS) enabled
- User-specific data isolation
- Secure API key storage

### 2. **Access Control**
- Authentication required
- User ownership validation
- Audit trail capabilities

## Performance Optimization

### 1. **Caching Strategy**
- Database caching for repeated requests
- API response caching
- User session caching

### 2. **Data Compression**
- Efficient JSON storage
- Minimal redundant data
- Optimized queries

## Monitoring and Maintenance

### 1. **Health Checks**
- API connectivity monitoring
- Database performance tracking
- Error rate monitoring

### 2. **Data Maintenance**
- Regular validation runs
- Cleanup of invalid data
- Performance optimization

This enhanced birth chart data system provides comprehensive Vedic astrology information while maintaining performance, security, and reliability. 