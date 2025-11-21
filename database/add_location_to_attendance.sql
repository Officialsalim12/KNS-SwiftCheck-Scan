-- Add location column to attendance table
-- This column stores the location where a participant checked in (for events with multiple locations)

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add a comment to document the column
COMMENT ON COLUMN attendance.location IS 'Location where the participant checked in (for events with multiple locations)';

