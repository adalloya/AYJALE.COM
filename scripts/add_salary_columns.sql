-- Add salary columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS salary_min NUMERIC,
ADD COLUMN IF NOT EXISTS salary_max NUMERIC,
ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'monthly';

-- Optional: Add check constraint for salary_period
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_salary_period_check;

ALTER TABLE jobs 
ADD CONSTRAINT jobs_salary_period_check 
CHECK (salary_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly'));
