# Vercel Environment Variables Setup

This guide explains how to set up environment variables in Vercel for the Transformation Journal application.

## Required Environment Variables

### 1. Supabase Configuration
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://your-project-id.supabase.co`
- **Description**: Your Supabase project URL

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `your_supabase_anon_key_here`
- **Description**: Your Supabase anonymous/public key

### 2. Prokerala Astrology API
- **Name**: `PROKERALA_CLIENT_ID`
- **Value**: `your_prokerala_client_id_here`
- **Description**: Your Prokerala API client ID (obtained from https://api.prokerala.com/)

- **Name**: `PROKERALA_CLIENT_SECRET`
- **Value**: `your_prokerala_client_secret_here`
- **Description**: Your Prokerala API client secret (obtained from https://api.prokerala.com/)

## Setting Up Environment Variables in Vercel

### Method 1: Using Vercel CLI

1. Install Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add PROKERALA_CLIENT_ID
   vercel env add PROKERALA_CLIENT_SECRET
   ```

4. Deploy to apply changes:
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `PROKERALA_CLIENT_ID` - Your Prokerala client ID
   - `PROKERALA_CLIENT_SECRET` - Your Prokerala client secret

4. Set the environment for each variable:
   - **Production**: ✅
   - **Preview**: ✅ (optional)
   - **Development**: ✅ (optional)

5. Click **Save** and redeploy your application

## Local Development Setup

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Prokerala API Configuration
PROKERALA_CLIENT_ID=your_prokerala_client_id_here
PROKERALA_CLIENT_SECRET=your_prokerala_client_secret_here
```

## Verification Steps

1. **Check Vercel Dashboard**:
   - Go to your project settings
   - Verify all environment variables are listed
   - Ensure they're enabled for the correct environments

2. **Test API Integration**:
   - Try calculating a birth chart in the app
   - Check browser console for any authentication errors
   - Verify Supabase connection works

3. **Check Deployment Logs**:
   - Monitor Vercel deployment logs for any environment variable errors
   - Look for successful API authentication messages

## Troubleshooting

### Common Issues

1. **"Environment variable not found"**:
   - Ensure variable names match exactly (case-sensitive)
   - Check that variables are enabled for the correct environment
   - Redeploy after adding new variables

2. **"Authentication failed"**:
   - Verify Prokerala credentials are correct
   - Check that client ID and secret are properly formatted
   - Ensure credentials haven't expired

3. **"Supabase connection failed"**:
   - Verify Supabase URL and key are correct
   - Check that your Supabase project is active
   - Ensure RLS policies are properly configured

### Getting Prokerala Credentials

1. Visit https://api.prokerala.com/
2. Sign up for a free account
3. Navigate to your dashboard
4. Create a new application
5. Copy the `client_id` and `client_secret`
6. Add them to your Vercel environment variables

## Security Notes

- Never commit `.env.local` files to version control
- Use different credentials for development and production
- Regularly rotate your API keys and secrets
- Monitor API usage to stay within free tier limits 