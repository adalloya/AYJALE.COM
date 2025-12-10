-- Fix missing columns detected during local testing

-- 1. Fix 'jobs' table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS salary TEXT, -- Legacy field, can be computed or stored
ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'mensual';

-- Sync 'active' with 'is_active' if needed, or just use 'active' going forward.
UPDATE public.jobs SET active = is_active WHERE active IS NULL;

-- 2. Fix 'profiles' table for 'logo' mismatch
-- DataContext asks for 'logo', but migration created 'logo_url'.
-- We can add 'logo' as an alias or just a second column.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Sync logo with logo_url
UPDATE public.profiles SET logo = logo_url WHERE logo IS NULL;

-- 3. Fix 'salary' in jobs (optional, populating text for display)
UPDATE public.jobs 
SET salary = '$' || salary_min || ' - $' || salary_max 
WHERE salary IS NULL AND(salary_min IS NOT NULL OR salary_max IS NOT NULL);
