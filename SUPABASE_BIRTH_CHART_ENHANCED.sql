-- Enhanced birth_chart_data table with additional columns for detailed astrological data
-- Run this after the initial SUPABASE_BIRTH_CHART_SETUP.sql

-- Add new columns for enhanced ascendant data
ALTER TABLE birth_chart_data 
ADD COLUMN IF NOT EXISTS ascendant_longitude DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS ascendant_longitude_dms TEXT,
ADD COLUMN IF NOT EXISTS ascendant_sign_degree_dms TEXT;

-- Add column for storing raw API response for debugging
ALTER TABLE birth_chart_data 
ADD COLUMN IF NOT EXISTS raw_api_response JSONB;

-- Add comments for new columns
COMMENT ON COLUMN birth_chart_data.ascendant_longitude IS 'Ascendant longitude in decimal degrees';
COMMENT ON COLUMN birth_chart_data.ascendant_longitude_dms IS 'Ascendant longitude in degrees, minutes, seconds format';
COMMENT ON COLUMN birth_chart_data.ascendant_sign_degree_dms IS 'Ascendant degree within the sign in DMS format';
COMMENT ON COLUMN birth_chart_data.raw_api_response IS 'Original API response for debugging and data validation';

-- Create index on ascendant_longitude for potential future queries
CREATE INDEX IF NOT EXISTS idx_birth_chart_data_ascendant_longitude ON birth_chart_data(ascendant_longitude);

-- Update existing records to have default values for new columns
UPDATE birth_chart_data 
SET 
  ascendant_longitude = 0,
  ascendant_longitude_dms = '0° 0'' 0"',
  ascendant_sign_degree_dms = '0° 0'' 0"',
  raw_api_response = '{}'::jsonb
WHERE ascendant_longitude IS NULL;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'birth_chart_data' 
ORDER BY ordinal_position; 