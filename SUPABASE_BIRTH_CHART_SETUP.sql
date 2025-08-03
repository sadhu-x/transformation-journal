-- Create birth_chart_data table for storing natal chart information
CREATE TABLE IF NOT EXISTS birth_chart_data (
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

-- Create indexes for birth_chart_data
CREATE INDEX IF NOT EXISTS idx_birth_chart_data_user_id ON birth_chart_data(user_id);
CREATE INDEX IF NOT EXISTS idx_birth_chart_data_calculated_at ON birth_chart_data(calculated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE birth_chart_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for birth_chart_data
CREATE POLICY "Users can view their own birth chart data" ON birth_chart_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own birth chart data" ON birth_chart_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own birth chart data" ON birth_chart_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own birth chart data" ON birth_chart_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_birth_chart_data_updated_at ON birth_chart_data;
CREATE TRIGGER update_birth_chart_data_updated_at
  BEFORE UPDATE ON birth_chart_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE birth_chart_data IS 'Stores calculated natal chart data for users to avoid repeated API calls';
COMMENT ON COLUMN birth_chart_data.planets IS 'JSON array of planetary positions with rashi, degree, and nakshatra information';
COMMENT ON COLUMN birth_chart_data.houses IS 'JSON array of house positions with rashi and degree information';
COMMENT ON COLUMN birth_chart_data.calculated_at IS 'Timestamp when the natal chart was calculated'; 