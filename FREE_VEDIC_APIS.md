# Free Vedic Astrology APIs

This document explains the free Vedic astrology API options available for the transformation journal app.

## 🌟 **Free API Options**

### 1. **Vedic Rishi API** (Recommended)
- **URL**: https://vedicrishiastro.com/astrology-api
- **Free Tier**: 1000 requests/month
- **Features**: Complete Vedic astrology calculations, planetary positions, nakshatras
- **Setup**: 
  1. Sign up for free account
  2. Get API key from dashboard
  3. Add to `.env.local`: `VEDIC_RISHI_API_KEY=your_key_here`

### 2. **Prokerala API**
- **URL**: https://prokerala.com/astrology/api/
- **Free Tier**: 100 requests/day
- **Features**: Swiss Ephemeris based calculations, very accurate
- **Setup**:
  1. Sign up for free account
  2. Get API key from dashboard
  3. Add to `.env.local`: `PROKERALA_API_KEY=your_key_here`

### 3. **Swiss Ephemeris** (Most Accurate)
- **URL**: https://api.astrologyapi.com/v1/swisseph
- **Free Tier**: Limited but available
- **Features**: Gold standard for astronomical calculations
- **Setup**: No API key required (limited usage)

## 🔧 **How It Works**

The app tries these APIs in order:
1. **Vedic Rishi** (most comprehensive)
2. **Prokerala** (most accurate)
3. **Swiss Ephemeris** (fallback)
4. **Fallback Data** (your known chart - always works)

## 📝 **Setup Instructions**

### Option 1: No Setup Required
- The app will work immediately with fallback data
- Uses your known chart positions
- Perfect for testing and development

### Option 2: Get Free API Keys (Recommended)
1. **Vedic Rishi**:
   - Visit https://vedicrishiastro.com/astrology-api
   - Click "Get Free API Key"
   - Sign up with email
   - Copy your API key
   - Add to `.env.local`: `VEDIC_RISHI_API_KEY=your_key_here`

2. **Prokerala** (backup):
   - Visit https://prokerala.com/astrology/api/
   - Sign up for free account
   - Get API key from dashboard
   - Add to `.env.local`: `PROKERALA_API_KEY=your_key_here`

## 🎯 **Benefits of Free APIs**

- **Professional Accuracy**: Uses proven astronomical databases
- **No Calculation Errors**: Eliminates manual calculation issues
- **Always Current**: API data is maintained and updated
- **Multiple Fallbacks**: Never fails completely
- **Free**: No cost for basic usage

## 🧪 **Testing**

Use the **"Test API Calculation"** button in Profile Settings → Birth Data tab to:
- Test which APIs are working
- See the data returned
- Compare accuracy with your known chart

## 📊 **API Comparison**

| API | Free Requests | Accuracy | Features | Setup |
|-----|---------------|----------|----------|-------|
| Vedic Rishi | 1000/month | High | Complete Vedic | Easy |
| Prokerala | 100/day | Very High | Swiss Ephemeris | Easy |
| Swiss Ephemeris | Limited | Highest | Astronomical | None |
| Fallback | Unlimited | Known | Your Chart | None |

## 🚀 **Getting Started**

1. **Immediate Use**: The app works right now with fallback data
2. **Better Accuracy**: Get free API keys for professional calculations
3. **Test**: Use the debug buttons to see the difference

The free APIs provide professional-grade accuracy without any cost! 🌟 