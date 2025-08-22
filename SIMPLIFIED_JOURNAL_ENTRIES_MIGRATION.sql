-- Migration to simplify journal_entries table structure
-- This migration updates the table to use a single 'content' field instead of multiple separate fields
-- Run this in your Supabase SQL editor

-- Step 1: Add the new 'content' column
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS content TEXT;

-- Step 2: Migrate existing data to the new structure
-- Combine all existing text fields into the content field
UPDATE journal_entries 
SET content = CONCAT_WS(
  E'\n\n---\n\n',
  CASE WHEN review_of_activities IS NOT NULL AND review_of_activities != '' 
    THEN CONCAT('## Review of Activities\n', review_of_activities) 
    ELSE NULL 
  END,
  CASE WHEN gratitude IS NOT NULL AND gratitude != '' 
    THEN CONCAT('## Gratitude and Love\n', gratitude) 
    ELSE NULL 
  END,
  CASE WHEN pain IS NOT NULL AND pain != '' 
    THEN CONCAT('## Pain and Challenges\n', pain) 
    ELSE NULL 
  END,
  CASE WHEN insights IS NOT NULL AND insights != '' 
    THEN CONCAT('## Insights and Next Steps\n', insights) 
    ELSE NULL 
  END
)
WHERE content IS NULL;

-- Step 3: Remove the old columns (only after confirming data migration worked)
-- Uncomment these lines after verifying the migration worked correctly
-- ALTER TABLE journal_entries DROP COLUMN IF EXISTS review_of_activities;
-- ALTER TABLE journal_entries DROP COLUMN IF EXISTS gratitude;
-- ALTER TABLE journal_entries DROP COLUMN IF EXISTS pain;
-- ALTER TABLE journal_entries DROP COLUMN IF EXISTS insights;
-- ALTER TABLE journal_entries DROP COLUMN IF EXISTS discipline;
-- ALTER TABLE journal_entries DROP COLUMN IF EXISTS surrender;

-- Step 4: Add any missing columns that might be needed for future features
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS ai_remedies JSONB;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS ai_prompts JSONB;

-- Step 5: Update the table structure to ensure proper constraints
ALTER TABLE journal_entries ALTER COLUMN content SET NOT NULL;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN journal_entries.content IS 'Free-form journal entry content in markdown format';
COMMENT ON COLUMN journal_entries.ai_analysis IS 'AI analysis results from Claude API';
COMMENT ON COLUMN journal_entries.ai_remedies IS 'AI-suggested remedies and actionable items';
COMMENT ON COLUMN journal_entries.ai_prompts IS 'AI-generated reflection prompts';

-- Step 7: Verify the migration
SELECT 
  COUNT(*) as total_entries,
  COUNT(content) as entries_with_content,
  COUNT(CASE WHEN content != '' THEN 1 END) as non_empty_content,
  COUNT(attachments) as entries_with_attachments
FROM journal_entries;

-- Step 8: Show sample of migrated data (first 3 entries)
SELECT 
  id,
  timestamp,
  LEFT(content, 100) || '...' as content_preview,
  attachments IS NOT NULL as has_attachments
FROM journal_entries 
ORDER BY timestamp DESC 
LIMIT 3;
