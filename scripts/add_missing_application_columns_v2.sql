-- Add missing columns to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT;

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications';
