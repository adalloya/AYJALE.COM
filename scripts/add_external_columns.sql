-- Add columns for external jobs
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS external_url text,
ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS source text;
