-- Fix missing columns in 'profiles' table detected during company profile update

-- 1. Add 'city' column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Add 'phone_number' column (Frontend sends 'phone_number', schema has 'phone')
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 3. Sync 'phone' with 'phone_number' just in case (optional)
UPDATE public.profiles 
SET phone_number = phone 
WHERE phone_number IS NULL AND phone IS NOT NULL;
