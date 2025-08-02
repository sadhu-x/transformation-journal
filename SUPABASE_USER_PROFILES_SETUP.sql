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