# Supabase Setup Guide for TEKNE

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `tekne-journal`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
6. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (either starts with `eyJ` for legacy projects or `sb-` for newer projects)

### 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note**: The anon key can be either:
- Legacy format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJ`)
- New format: `sb-1234567890abcdef...` (starts with `sb-`)

### 4. Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  activity TEXT,
  gratitude TEXT,
  pain TEXT,
  insight TEXT,
  trading_mindset INTEGER DEFAULT 3,
  spiritual_state INTEGER DEFAULT 3,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for journal_entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_timestamp ON journal_entries(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journal_entries
CREATE POLICY "Users can view their own entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create non_negotiables table
CREATE TABLE IF NOT EXISTS non_negotiables (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for non_negotiables
CREATE INDEX IF NOT EXISTS idx_non_negotiables_user_id ON non_negotiables(user_id);
CREATE INDEX IF NOT EXISTS idx_non_negotiables_created_at ON non_negotiables(created_at);
CREATE INDEX IF NOT EXISTS idx_non_negotiables_completed ON non_negotiables(completed);

-- Enable Row Level Security for non_negotiables
ALTER TABLE non_negotiables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for non_negotiables
CREATE POLICY "Users can view their own non-negotiables" ON non_negotiables
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own non-negotiables" ON non_negotiables
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own non-negotiables" ON non_negotiables
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own non-negotiables" ON non_negotiables
  FOR DELETE USING (auth.uid() = user_id);

-- Create user_profiles table for birth data and profile information
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  primary_goals TEXT,
  key_practices TEXT,
  current_focus TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_location TEXT,
  birth_latitude DECIMAL(10, 6),
  birth_longitude DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile information including birth data for Vedic astrology analysis';
COMMENT ON COLUMN user_profiles.birth_date IS 'User birth date for natal chart calculations';
COMMENT ON COLUMN user_profiles.birth_time IS 'User birth time for precise natal chart calculations';
COMMENT ON COLUMN user_profiles.birth_location IS 'Human-readable birth location (e.g., "New York, NY, USA")';
COMMENT ON COLUMN user_profiles.birth_latitude IS 'Birth location latitude for astrological calculations';
COMMENT ON COLUMN user_profiles.birth_longitude IS 'Birth location longitude for astrological calculations';

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-images', 'journal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Allow public access to journal images" ON storage.objects
  FOR SELECT USING (bucket_id = 'journal-images');

CREATE POLICY "Allow authenticated uploads to journal images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'journal-images');

CREATE POLICY "Allow authenticated deletes from journal images" ON storage.objects
  FOR DELETE USING (bucket_id = 'journal-images');
```

### 5. Test Your Setup

1. Start your development server: `npm run dev`
2. Open the app and try creating a journal entry
3. Check your Supabase dashboard to see the data

## 🔧 Features Enabled

With Supabase, you now have:

- ✅ **Persistent Storage**: Data survives browser clears
- ✅ **Image Storage**: Images stored in Supabase Storage
- ✅ **User Profiles**: Birth data and profile information for Vedic astrology
- ✅ **Real-time Sync**: (Can be enabled later)
- ✅ **Backup & Restore**: Export/import functionality
- ✅ **Cross-device Access**: Access from any device
- ✅ **No Size Limits**: No localStorage restrictions

## 🛠️ Advanced Configuration

### Enable Real-time (Optional)

Add this to your SQL:

```sql
-- Enable real-time for journal_entries
ALTER PUBLICATION supabase_realtime ADD TABLE journal_entries;
```

### Add User Authentication (Optional)

1. Go to **Authentication** → **Settings**
2. Configure your preferred auth providers
3. Update the app to include user authentication

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check your `.env.local` file exists
   - Verify the variable names are correct
   - Restart your development server

2. **"Table doesn't exist"**
   - Run the SQL commands in Supabase SQL Editor
   - Check the table name matches exactly

3. **"Storage bucket not found"**
   - Create the storage bucket manually in Supabase dashboard
   - Or run the storage SQL commands

4. **"Permission denied"**
   - Check RLS policies are set correctly
   - Verify the anon key has proper permissions

5. **"User profile not found"**
   - The trigger should automatically create profiles for new users
   - For existing users, you may need to manually create a profile record

## 📞 Support

If you encounter issues:
1. Check the Supabase documentation
2. Verify your environment variables
3. Check the browser console for errors
4. Ensure all SQL commands were executed successfully 

# Supabase Authentication Setup

## Fixing Confirmation Link URLs

If your email confirmation links are pointing to `localhost:3000` instead of your production domain, follow these steps:

### 1. Update Supabase Dashboard Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **URL Configuration**
4. Update the **Site URL** from `http://localhost:3000` to `https://transformation-journal.vercel.app`
5. Save the changes

### 2. Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL for authentication redirects
NEXT_PUBLIC_SITE_URL=https://transformation-journal.vercel.app
```

### 3. Vercel Environment Variables

Make sure to add these environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the same variables as above

### 4. Test the Fix

After updating the settings:
1. Try signing up again
2. Check that the confirmation email contains the correct production URL
3. The link should point to `https://transformation-journal.vercel.app`

## Important Notes

- The Site URL in Supabase must match your production domain exactly
- Environment variables in Vercel should be set for all environments (Production, Preview, Development)
- Changes to Supabase settings may take a few minutes to propagate 