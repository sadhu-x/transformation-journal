# Prokerala API Setup Guide

Since you chose Prokerala, here's how to set it up for professional Vedic astrology calculations.

## 🎯 **Why Prokerala?**

- **Swiss Ephemeris based** - Gold standard for astronomical accuracy
- **100 free requests per day** - Plenty for personal use
- **Complete Vedic calculations** - Planetary positions, nakshatras, houses
- **Reliable and fast** - Professional API service

## 📝 **Setup Steps**

### 1. **Get Your Free API Key**
1. Visit: https://prokerala.com/astrology/api/
2. Click "Get Started" or "Sign Up"
3. Create a free account with your email
4. Go to your dashboard
5. Copy your API key

### 2. **Add API Key to Your App**
1. Create or edit `.env.local` file in your project root
2. Add this line:
   ```
   PROKERALA_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key

### 3. **Restart Your App**
- Stop your development server (`Ctrl+C`)
- Start it again (`npm run dev`)
- The app will now use Prokerala API

## 🧪 **Test the Setup**

1. **Go to Profile Settings** → Birth Data tab
2. **Fill in your birth data** (date, time, location)
3. **Click "Test API Calculation"** button
4. **Check the console** for API response
5. **Compare results** with your known chart

## 📊 **What You'll Get**

Prokerala provides:
- **Planetary Positions**: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- **Nakshatras**: Lunar mansions for each planet
- **Ascendant**: Your rising sign and degree
- **Houses**: All 12 houses with signs and degrees
- **Ayanamsa**: Lahiri (most commonly used in Vedic astrology)

## 🔧 **Troubleshooting**

### **API Key Issues**
- Make sure the key is correct
- Check that `.env.local` is in the project root
- Restart the development server after adding the key

### **Rate Limits**
- 100 requests per day (free tier)
- If you hit the limit, the app will fall back to your known chart data
- Consider upgrading to paid plan if you need more requests

### **Data Accuracy**
- Prokerala uses Swiss Ephemeris (most accurate)
- Should match your known chart very closely
- If there are discrepancies, check your birth time accuracy

## 🎉 **Success Indicators**

When Prokerala is working correctly, you'll see:
- Console message: "Successfully got data from Prokerala"
- Accurate planetary positions matching your known chart
- Complete nakshatra information
- Professional-grade calculations

## 🚀 **Next Steps**

1. **Test the API** with your birth data
2. **Generate AI prompts** with accurate natal chart data
3. **Use for daily cosmic context** in your journal entries
4. **Enjoy professional Vedic astrology accuracy** without any cost!

The Prokerala API will give you the most accurate Vedic astrology calculations available! 🌟 