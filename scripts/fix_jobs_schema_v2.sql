-- Fix missing columns in 'jobs' table detected during job posting

-- 1. Add 'category' column
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Add 'is_confidential' column
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS is_confidential BOOLEAN DEFAULT FALSE;

-- 3. Add 'currency' column (Frontend sends 'currency', schema had 'salary_currency')
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN';
