# Setting Up Prokerala API for Enhanced Birth Chart Data

## Overview

To get the enhanced birth chart data with detailed divisional positions, you need to set up Prokerala API credentials. The current error "Prokerala credentials not found" indicates that the API credentials are not configured.

## Step 1: Get Prokerala API Credentials

1. **Visit Prokerala**: Go to [https://prokerala.com](https://prokerala.com)
2. **Sign Up/Login**: Create an account or log in to your existing account
3. **API Access**: Navigate to the API section or developer portal
4. **Create Application**: Create a new application to get API credentials
5. **Get Credentials**: You'll receive:
   - `PROKERALA_CLIENT_ID`
   - `PROKERALA_CLIENT_SECRET`

## Step 2: Configure Environment Variables

### For Local Development (.env.local)

Create or update your `.env.local` file in the project root:

```env
# Prokerala API Credentials
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here

# Existing Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For Production (Vercel)

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to the "Environment Variables" section
4. Add the following variables:
   - `PROKERALA_CLIENT_ID` = your_client_id
   - `PROKERALA_CLIENT_SECRET` = your_client_secret

## Step 3: Update Database Schema

Run the enhanced SQL in your Supabase dashboard:

```sql
-- Copy and paste the contents of SUPABASE_BIRTH_CHART_ENHANCED.sql
```

## Step 4: Test the Setup

### Option 1: Use the Debug Script

1. Open your browser console in the app
2. Copy and paste the contents of `debug-birth-chart-export.js`
3. Run: `debugBirthChartExport()`

### Option 2: Manual Test

1. Go to your app's Profile Settings
2. Fill in your birth data (date, time, location)
3. Click "Calculate Natal Chart"
4. Check the browser console for logs

### Option 3: Test API Directly

In the browser console:

```javascript
// Test with your birth data
const result = await fetchAndStoreBirthChart(
  '1990-01-15',  // Your birth date
  '06:30',       // Your birth time
  '23.1765',     // Your latitude
  '75.7885'      // Your longitude
)
console.log('Result:', result)
```

## Step 5: Verify Enhanced Data

After successful setup, you should see:

### In the Database
- Enhanced birth chart data with precise degrees
- Raw API response stored for debugging
- All planetary positions with house information

### In the Export
- Accurate natal chart analysis
- Proper degrees and nakshatras
- Enhanced house information with lords

## Troubleshooting

### "Prokerala credentials not found"

**Cause**: Environment variables not set or not loaded
**Solution**: 
1. Check `.env.local` file exists
2. Restart the development server
3. Verify variable names are correct

### "API request failed"

**Cause**: Invalid credentials or API limits
**Solution**:
1. Verify credentials are correct
2. Check API usage limits
3. Ensure birth data format is correct

### "No stored birth chart data found"

**Cause**: First time calculation or API failure
**Solution**:
1. Check API credentials
2. Verify birth data is complete
3. Check network connectivity

### "Invalid birth chart data"

**Cause**: API returned unexpected format
**Solution**:
1. Check API response in console
2. Verify birth data format
3. Check API documentation for changes

## Expected Results

With proper setup, you should see:

### Enhanced Natal Chart Data
```
## Natal Chart (Kundali) Analysis
**Ascendant (Lagna)**: Cancer 6.16° - Pushya

**Planetary Positions**:
- Ascendant: Cancer 6.16° - Pushya
- Ketu: Virgo 27.24° - Chitra
- Venus: Libra 25.84° - Vishaka
- Mars: Scorpio 25.45° - Jyeshta
- Sun: Sagittarius 5.26° - Moola
- Mercury: Sagittarius 8.08° - Moola
- Saturn: Aquarius 8.20° - Shatabhisha
- Moon: Pisces 28.77° - Revati
- Rahu: Pisces 27.24° - Revati
- Jupiter: Aries 11.55° - Ashwini

**Dosha Balance**:
- Vata: 33%
- Pitta: 33%
- Kapha: 34%

**Houses**:
- House 1: Cancer 0° (Lord: Moon)
- House 2: Leo 0° (Lord: Sun)
- House 3: Virgo 0° (Lord: Mercury)
- House 4: Libra 0° (Lord: Venus)
- House 5: Scorpio 0° (Lord: Mars)
- House 6: Sagittarius 0° (Lord: Jupiter)
- House 7: Capricorn 0° (Lord: Saturn)
- House 8: Aquarius 0° (Lord: Saturn)
- House 9: Pisces 0° (Lord: Jupiter)
- House 10: Aries 0° (Lord: Mars)
- House 11: Taurus 0° (Lord: Venus)
- House 12: Gemini 0° (Lord: Mercury)
```

## Next Steps

1. **Set up credentials** following the steps above
2. **Test the API** using the debug script
3. **Calculate your birth chart** in the app
4. **Export your data** to see the enhanced natal chart
5. **Use the enhanced data** for better AI analysis

## Support

If you continue to have issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Test with the debug script to identify the specific issue
4. Check Prokerala API documentation for any changes 