-- Add missing columns to profiles table for company details
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rfc TEXT,
ADD COLUMN IF NOT EXISTS recruiter_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Ensure RLS allows users to update their own profile
-- (This policy usually exists, but good to verify/re-apply if needed)
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
