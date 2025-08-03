# Prokerala API Setup Guide

This guide explains how to set up the Prokerala Vedic Astrology API for the Transformation Journal application.

## Overview

Prokerala provides a comprehensive Vedic astrology API that we use for:
- Natal chart calculations
- Planetary positions
- Ascendant (Lagna) calculations
- House positions

## Getting Started

### 1. Create Prokerala Account

1. Visit [Prokerala API](https://api.prokerala.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create Application

1. Log into your Prokerala dashboard
2. Navigate to "Applications" or "API Keys"
3. Click "Create New Application"
4. Fill in the application details:
   - **Name**: `Transformation Journal`
   - **Description**: `Vedic astrology calculations for personal transformation journal`
   - **Website**: Your app's URL (optional)

### 3. Get Credentials

After creating the application, you'll receive:
- **Client ID**: A unique identifier for your application
- **Client Secret**: A secret key for authentication

**Important**: Keep these credentials secure and never share them publicly.

## Authentication Flow

Prokerala uses OAuth 2.0 client credentials flow:

1. **Get Access Token**: Use your client ID and secret to obtain an access token
2. **Use Access Token**: Include the token in API requests as a Bearer token
3. **Token Expiry**: Access tokens are valid for 1 hour

### Example Authentication Request

```bash
curl -X POST https://api.prokerala.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

### Example API Request

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://api.prokerala.com/v2/astrology/birth-details?ayanamsa=1&coordinates=23.1765,75.7885&datetime=2025-01-15T06:30:00%2B00:00"
```

## Environment Variables

Add these to your environment variables:

```env
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here
```

## API Endpoints We Use

### 1. Birth Details
- **Endpoint**: `/v2/astrology/birth-details`
- **Method**: GET
- **Purpose**: Get nakshatra and birth details

### 2. Planetary Positions
- **Endpoint**: `/v2/astrology/planetary-positions`
- **Method**: GET
- **Purpose**: Get planetary positions at birth time

## Request Parameters

### Required Parameters
- `ayanamsa`: Ayanamsa system (1 = Lahiri, 3 = Raman, 5 = KP)
- `coordinates`: Latitude,longitude (e.g., "23.1765,75.7885")
- `datetime`: Birth date and time in ISO 8601 format (URL encoded)

### Example Query String
```
ayanamsa=1&coordinates=23.1765,75.7885&datetime=2025-01-15T06:30:00%2B00:00
```

**Important**: The datetime parameter must be URL encoded. The "+" character becomes "%2B".

## Response Format

The API returns detailed astrological data including:
- Planetary positions and signs
- Ascendant (Lagna) information
- House positions
- Nakshatra details

## Rate Limits

- **Free Tier**: 100 requests per day
- **Paid Plans**: Higher limits available
- **Rate Limiting**: Requests are throttled if limits exceeded

## Error Handling

Common error responses:
- `401`: Invalid credentials
- `429`: Rate limit exceeded
- `503`: Service unavailable

## Testing

### Test Your Setup

1. Use the "Calculate Natal Chart" button in the app
2. Check browser console for authentication logs
3. Verify successful API responses

### Debug Information

The app logs detailed information:
- Authentication status
- API request details
- Response data structure
- Error messages

## Troubleshooting

### Common Issues

1. **"Invalid credentials"**:
   - Verify client ID and secret are correct
   - Check that credentials haven't expired
   - Ensure proper formatting

2. **"Rate limit exceeded"**:
   - Check your daily request count
   - Wait for rate limit reset
   - Consider upgrading to paid plan

3. **"Service unavailable"**:
   - Check Prokerala service status
   - Verify API endpoints are correct
   - Try again later

4. **"Invalid datetime format"**:
   - Ensure datetime is in ISO 8601 format
   - URL encode the datetime parameter
   - Check timezone handling

### Getting Help

- **Documentation**: [Prokerala API Docs](https://api.prokerala.com/docs)
- **Support**: Contact Prokerala support for API issues
- **Community**: Check their community forums

## Security Best Practices

1. **Never expose credentials** in client-side code
2. **Use environment variables** for all sensitive data
3. **Rotate credentials** regularly
4. **Monitor API usage** to stay within limits
5. **Implement proper error handling** for failed requests

## Integration Notes

The Transformation Journal app:
- Handles authentication automatically
- Caches access tokens for efficiency
- Provides fallback error handling
- Logs detailed debugging information
- Stores birth chart data in Supabase for reuse
- Uses GET requests with query parameters
- Properly URL encodes datetime parameters

Your Prokerala API is now ready to provide accurate Vedic astrology calculations! 🌟 