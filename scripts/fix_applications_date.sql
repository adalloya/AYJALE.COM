
-- Add created_at column if it doesn't exist
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing rows that have null created_at
UPDATE applications 
SET created_at = NOW() 
WHERE created_at IS NULL;
