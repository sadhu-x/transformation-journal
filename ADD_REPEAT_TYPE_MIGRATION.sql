-- Migration to add repeat_type field to existing non_negotiables table
-- Run this if you have an existing non_negotiables table without the repeat_type field

-- Add the repeat_type column with default value
ALTER TABLE non_negotiables 
ADD COLUMN IF NOT EXISTS repeat_type TEXT DEFAULT 'one_time';

-- Add the check constraint
ALTER TABLE non_negotiables 
DROP CONSTRAINT IF EXISTS non_negotiables_repeat_type_check;

ALTER TABLE non_negotiables 
ADD CONSTRAINT non_negotiables_repeat_type_check 
CHECK (repeat_type IN ('daily', 'one_time'));

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_non_negotiables_repeat_type ON non_negotiables(repeat_type);

-- Update existing records to have 'one_time' as default (if they don't have it already)
UPDATE non_negotiables 
SET repeat_type = 'one_time' 
WHERE repeat_type IS NULL; 