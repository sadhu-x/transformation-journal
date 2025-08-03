-- Fix duplicate user profiles script
-- Run this in your Supabase SQL editor if you encounter duplicate profile errors

-- First, let's see if there are any duplicate user profiles
SELECT user_id, COUNT(*) as profile_count
FROM user_profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- If duplicates exist, keep only the most recent profile for each user
-- (This will delete older duplicates and keep the one with the latest updated_at)

DELETE FROM user_profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_profiles
  ORDER BY user_id, updated_at DESC, created_at DESC
);

-- Verify the fix worked
SELECT user_id, COUNT(*) as profile_count
FROM user_profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- If the above query returns no results, the fix was successful
-- If it still shows duplicates, you may need to manually review and delete them

-- Optional: Check the current state of user_profiles
SELECT 
  user_id,
  primary_goals,
  birth_date,
  birth_time,
  created_at,
  updated_at
FROM user_profiles
ORDER BY updated_at DESC
LIMIT 10; 