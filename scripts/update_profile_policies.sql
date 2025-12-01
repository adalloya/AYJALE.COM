-- Allow candidates to insert/update their own profile
CREATE POLICY "Users can insert their own profile" ON public.candidate_profiles
FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update their own profile" ON public.candidate_profiles
FOR UPDATE USING (auth.uid() = candidate_id);

-- Allow companies to view profiles of candidates who applied to their jobs
CREATE POLICY "Companies can view applicant profiles" ON public.candidate_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications
    JOIN public.jobs ON public.applications.job_id = public.jobs.id
    WHERE public.applications.candidate_id = candidate_profiles.candidate_id
    AND public.jobs.company_id = auth.uid()
  )
);
