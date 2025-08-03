-- Migration to rename fields from tradingMindset to discipline and spiritualState to surrender
-- Run this in your Supabase SQL editor

-- First, add the new columns
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS discipline INTEGER DEFAULT 3;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS surrender INTEGER DEFAULT 3;

-- Copy data from old columns to new columns
UPDATE journal_entries 
SET discipline = tradingMindset 
WHERE tradingMindset IS NOT NULL;

UPDATE journal_entries 
SET surrender = spiritualState 
WHERE spiritualState IS NOT NULL;

-- Drop the old columns
ALTER TABLE journal_entries DROP COLUMN IF EXISTS tradingMindset;
ALTER TABLE journal_entries DROP COLUMN IF EXISTS spiritualState;

-- Add constraints to ensure values are between 0 and 6
ALTER TABLE journal_entries ADD CONSTRAINT discipline_range CHECK (discipline >= 0 AND discipline <= 6);
ALTER TABLE journal_entries ADD CONSTRAINT surrender_range CHECK (surrender >= 0 AND surrender <= 6);

-- Update any RLS policies if they reference the old column names
-- (You may need to recreate policies that reference these columns)

-- Verify the migration
SELECT 
  COUNT(*) as total_entries,
  COUNT(discipline) as entries_with_discipline,
  COUNT(surrender) as entries_with_surrender,
  AVG(discipline) as avg_discipline,
  AVG(surrender) as avg_surrender
FROM journal_entries; 