-- Add table_number column to participants table for Party and Marriage events
-- This column stores the table number where a participant will sit

ALTER TABLE participants
ADD COLUMN IF NOT EXISTS table_number INTEGER;

-- Add a comment to document the column
COMMENT ON COLUMN participants.table_number IS 'Table number for seating assignment (used for Party and Marriage events)';

