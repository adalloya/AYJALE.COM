
-- Add comments column if it doesn't exist
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS comments TEXT;
