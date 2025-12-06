-- Remove unique constraint on username column in events table
-- This allows the same username to be used for multiple events
-- The same individual can now create multiple events with the same username

-- First, find the constraint name (run this to see what constraints exist)
-- SELECT constraint_name 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'events' 
-- AND constraint_type = 'UNIQUE'
-- AND constraint_name LIKE '%username%';

-- Drop the unique constraint
-- Try common constraint names:
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_username_key;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_username_unique;
ALTER TABLE events DROP CONSTRAINT IF EXISTS unique_username;

-- If the above doesn't work, you may need to find the exact constraint name first:
-- Run this query to find all unique constraints on the events table:
-- 
-- SELECT 
--   tc.constraint_name, 
--   tc.table_name, 
--   kcu.column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- WHERE tc.constraint_type = 'UNIQUE'
--   AND tc.table_name = 'events'
--   AND kcu.column_name = 'username';
--
-- Then use the constraint_name from the results in:
-- ALTER TABLE events DROP CONSTRAINT <constraint_name>;

