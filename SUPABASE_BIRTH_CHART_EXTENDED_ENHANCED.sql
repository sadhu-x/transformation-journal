-- Enhanced birth_chart_data table with extended API Astro fields
-- Run this after the initial SUPABASE_BIRTH_CHART_SETUP.sql and SUPABASE_BIRTH_CHART_ENHANCED.sql

-- Add new columns for extended API Astro data
ALTER TABLE birth_chart_data
ADD COLUMN IF NOT EXISTS ascendant_nakshatra_pada INTEGER,
ADD COLUMN IF NOT EXISTS ascendant_nakshatra_lord TEXT,
ADD COLUMN IF NOT EXISTS ascendant_sign_lord TEXT;

-- Add comments for new columns
COMMENT ON COLUMN birth_chart_data.ascendant_nakshatra_pada IS 'Nakshatra pada (1-4) for ascendant';
COMMENT ON COLUMN birth_chart_data.ascendant_nakshatra_lord IS 'Vimsottari lord of ascendant nakshatra';
COMMENT ON COLUMN birth_chart_data.ascendant_sign_lord IS 'Lord of the zodiac sign where ascendant is placed';

-- Update existing records to have default values for new columns
UPDATE birth_chart_data
SET
  ascendant_nakshatra_pada = 1,
  ascendant_nakshatra_lord = 'Unknown',
  ascendant_sign_lord = 'Unknown'
WHERE ascendant_nakshatra_pada IS NULL;

-- Create indexes for potential future queries
CREATE INDEX IF NOT EXISTS idx_birth_chart_data_nakshatra_pada ON birth_chart_data(ascendant_nakshatra_pada);
CREATE INDEX IF NOT EXISTS idx_birth_chart_data_nakshatra_lord ON birth_chart_data(ascendant_nakshatra_lord);
CREATE INDEX IF NOT EXISTS idx_birth_chart_data_sign_lord ON birth_chart_data(ascendant_sign_lord);

-- Verify the table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'birth_chart_data'
ORDER BY ordinal_position; 