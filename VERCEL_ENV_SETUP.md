# Vercel Environment Variables Setup

Setting up your Prokerala API key in Vercel for secure, production-ready deployment.

## 🎯 **Why Use Vercel Environment Variables?**

- **Security**: API keys are not exposed in your code
- **Environment-specific**: Different keys for development vs production
- **Easy management**: Update keys without redeploying code
- **Best practice**: Industry standard for API key management

## 📝 **Setup Steps**

### **1. Get Your Prokerala API Key**
1. Visit: https://prokerala.com/astrology/api/
2. Sign up and get your free API key
3. Copy the key (you'll need it for the next step)

### **2. Add Environment Variable in Vercel**

#### **Option A: Vercel Dashboard (Recommended)**
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `transformation-journal` project
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Click **Add New**
6. Fill in:
   - **Name**: `PROKERALA_API_KEY`
   - **Value**: `your_prokerala_api_key_here`
   - **Environment**: Select all environments (Production, Preview, Development)
7. Click **Save**

#### **Option B: Vercel CLI**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add PROKERALA_API_KEY

# Follow the prompts to set the value and environments
```

### **3. Redeploy Your App**
After adding the environment variable:
1. **Automatic**: Vercel will automatically redeploy
2. **Manual**: Or trigger a new deployment from your dashboard
3. **Git push**: Or push new code to trigger deployment

## 🔧 **Environment Variable Names**

The app looks for these environment variables:
- `PROKERALA_API_KEY` - Your Prokerala API key (primary)
- `VEDIC_RISHI_API_KEY` - Vedic Rishi API key (backup)

## 🌍 **Environment-Specific Setup**

You can set different values for different environments:

### **Development (Local)**
- Use `.env.local` file in your project root
- Only for local development
- Never commit this file to Git

### **Production (Vercel)**
- Use Vercel dashboard environment variables
- Available to your deployed app
- Secure and encrypted

### **Preview (Vercel)**
- Same as production
- Used for pull request previews

## 🧪 **Testing the Setup**

### **Local Testing**
1. Create `.env.local` file:
   ```
   PROKERALA_API_KEY=your_key_here
   ```
2. Restart your development server
3. Test with "Test API Calculation" button

### **Production Testing**
1. Deploy to Vercel with environment variable set
2. Test the live app
3. Check Vercel function logs for API calls

## 🔒 **Security Best Practices**

### **Do's:**
- ✅ Use Vercel environment variables for production
- ✅ Use `.env.local` for local development
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use different keys for different environments

### **Don'ts:**
- ❌ Never commit API keys to Git
- ❌ Don't hardcode keys in your code
- ❌ Don't share API keys publicly
- ❌ Don't use the same key for development and production

## 📊 **Verification Steps**

1. **Check Vercel Dashboard**:
   - Go to your project settings
   - Verify `PROKERALA_API_KEY` is listed
   - Check that it's enabled for all environments

2. **Test Local Development**:
   - Restart your dev server
   - Use "Test API Calculation" button
   - Check console for API responses

3. **Test Production**:
   - Deploy to Vercel
   - Test the live app
   - Verify API calls work

## 🚀 **Deployment Workflow**

1. **Development**: Use `.env.local` for local testing
2. **Staging**: Use Vercel preview deployments
3. **Production**: Use Vercel production environment variables

## 🔧 **Troubleshooting**

### **API Key Not Working**
- Check Vercel dashboard for correct variable name
- Verify the key is enabled for the right environment
- Check Vercel function logs for errors

### **Local vs Production Differences**
- Ensure both environments have the API key
- Check that the key is valid and not expired
- Verify rate limits haven't been exceeded

### **Environment Variable Not Found**
- Double-check the variable name spelling
- Ensure it's enabled for the deployment environment
- Redeploy after adding the variable

## 🎉 **Success Indicators**

When everything is working correctly:
- ✅ Local development uses `.env.local`
- ✅ Production uses Vercel environment variables
- ✅ API calls work in both environments
- ✅ No API keys visible in your code
- ✅ Secure and production-ready setup

Your app is now ready for secure, production deployment with professional Vedic astrology calculations! 🌟 