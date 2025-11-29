-- Enable RLS on tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (usually handled by trigger, but good to have)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public read access to profiles (needed for companies to see candidate profiles)
-- You might want to restrict this to only 'company' role later
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);


-- APPLICATIONS POLICIES
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Candidates can create applications" ON applications;
DROP POLICY IF EXISTS "Candidates can view own applications" ON applications;
DROP POLICY IF EXISTS "Companies can view applications for their jobs" ON applications;

-- Allow candidates to insert applications
CREATE POLICY "Candidates can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Allow candidates to view their own applications
CREATE POLICY "Candidates can view own applications" ON applications
    FOR SELECT USING (auth.uid() = candidate_id);

-- Allow companies to view applications for their jobs
CREATE POLICY "Companies can view applications for their jobs" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = applications.job_id
            AND jobs.company_id = auth.uid()
        )
    );
