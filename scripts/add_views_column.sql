-- Add views column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
