# Birth Chart Storage Feature

This document explains the new birth chart storage feature that allows the app to store and reuse natal chart data, reducing API calls and improving performance.

## Overview

The birth chart storage feature automatically stores calculated natal chart data in Supabase, so that subsequent requests for the same birth data can be served from the database instead of making new API calls.

## Features

### 1. **Automatic Storage**
- When birth chart data is fetched from the astrology API, it's automatically stored in the `birth_chart_data` table
- Data is stored with a unique constraint based on user ID and birth parameters
- Includes ascendant, planetary positions, and house data

### 2. **Smart Retrieval**
- The app first checks for existing birth chart data before making API calls
- If stored data exists, it's used immediately
- If no stored data exists, a new API call is made and the result is stored

### 3. **Status Indicators**
- **Idle**: No birth chart data has been calculated yet
- **Loading**: Currently calculating natal chart from API
- **Success**: Natal chart calculated and stored successfully
- **Cached**: Using previously stored natal chart data
- **Error**: Failed to calculate or store natal chart data

### 4. **User Interface**
- Clean status indicators in the Birth Data tab
- Shows when the chart was last calculated
- Allows manual recalculation if needed
- Visual feedback for all states

## Database Schema

### `birth_chart_data` Table

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
  planets JSONB, -- Store planetary positions as JSON
  houses JSONB, -- Store house positions as JSON
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, birth_date, birth_time, birth_latitude, birth_longitude)
);
```

## API Functions

### `getBirthChartData(birthDate, birthTime, birthLatitude, birthLongitude)`
Retrieves stored birth chart data for the given parameters.

### `saveBirthChartData(birthDate, birthTime, birthLatitude, birthLongitude, chartData)`
Saves birth chart data to the database.

### `fetchAndStoreBirthChart(birthDate, birthTime, birthLatitude, birthLongitude)`
Main function that:
1. Checks for existing data
2. Fetches from API if needed
3. Stores the result
4. Returns success/error status

## Setup Instructions

### 1. Create the Database Table
Run the SQL from `SUPABASE_BIRTH_CHART_SETUP.sql` in your Supabase SQL editor:

```sql
-- Copy and paste the contents of SUPABASE_BIRTH_CHART_SETUP.sql
```

### 2. Update Environment Variables
Ensure your Supabase environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy the Changes
The feature is automatically available once the database table is created and the code is deployed.

## Usage

### For Users
1. Navigate to Profile Settings → Birth Data tab
2. Fill in your birth information (date, time, location)
3. Click "Calculate Natal Chart"
4. The app will fetch and store your natal chart data
5. Future requests will use the stored data automatically

### For Developers
The birth chart data is automatically used in:
- AI prompt generation
- Vedic astrology analysis
- Cosmic context calculations

## Benefits

1. **Performance**: Eliminates redundant API calls
2. **Cost Savings**: Reduces API usage costs
3. **Reliability**: Works even if external APIs are temporarily unavailable
4. **User Experience**: Faster response times for subsequent requests
5. **Data Consistency**: Ensures consistent natal chart data across the app

## Error Handling

- Graceful fallback to API calls if database is unavailable
- Clear error messages for users
- Automatic retry mechanisms
- Logging for debugging

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Birth chart data is tied to user accounts
- No sensitive data is exposed to other users

## Monitoring

Check the browser console for:
- Birth chart calculation status
- Database operation logs
- API call logs
- Error messages

## Troubleshooting

### Common Issues

1. **"Failed to calculate natal chart"**
   - Check if birth data is complete
   - Verify API keys are set correctly
   - Check network connectivity

2. **"Database error"**
   - Ensure Supabase table is created
   - Check RLS policies
   - Verify user authentication

3. **"Status not updating"**
   - Refresh the page
   - Check browser console for errors
   - Verify component state management

### Debug Steps

1. Open browser developer tools
2. Check the Console tab for error messages
3. Verify birth data is correctly formatted
4. Test API connectivity
5. Check Supabase dashboard for table structure 