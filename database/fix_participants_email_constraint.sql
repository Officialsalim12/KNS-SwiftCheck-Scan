-- Remove email uniqueness constraint to allow same email for multiple participants
-- This allows multiple participants in the same event to share the same email address
-- (e.g., placeholder emails like "none@gmail.com" for different people)

-- Step 1: Drop the existing unique constraint on email (if it exists globally)
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_email_key;

-- Step 2: Drop the unique constraint on (event_id, email) if it exists
DROP INDEX IF EXISTS participants_event_email_unique;

-- Note: After running this, multiple participants can have the same email in the same event
-- The system will identify participants by their ID number instead

-- Note: If the above doesn't work, you may need to find the exact constraint name first:
-- SELECT constraint_name 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'participants' 
-- AND constraint_type = 'UNIQUE'
-- AND constraint_name LIKE '%email%';

