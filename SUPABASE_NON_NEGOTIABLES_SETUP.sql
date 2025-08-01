-- Create non_negotiables table
CREATE TABLE IF NOT EXISTS non_negotiables (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_non_negotiables_user_id ON non_negotiables(user_id);
CREATE INDEX IF NOT EXISTS idx_non_negotiables_created_at ON non_negotiables(created_at);
CREATE INDEX IF NOT EXISTS idx_non_negotiables_completed ON non_negotiables(completed);
CREATE INDEX IF NOT EXISTS idx_non_negotiables_date ON non_negotiables(date);

-- Enable Row Level Security
ALTER TABLE non_negotiables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific access
CREATE POLICY "Users can view their own non-negotiables" ON non_negotiables
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own non-negotiables" ON non_negotiables
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own non-negotiables" ON non_negotiables
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own non-negotiables" ON non_negotiables
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_non_negotiables_updated_at 
    BEFORE UPDATE ON non_negotiables 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Enable real-time for non_negotiables (if you want real-time updates)
-- ALTER PUBLICATION supabase_realtime ADD TABLE non_negotiables; 