-- Enable RLS on profiles if not already enabled
alter table profiles enable row level security;

-- Allow admins to view all profiles
-- Using email check to avoid recursion issues with the profiles table
create policy "Admins can view all profiles"
on profiles for select
using (
  auth.jwt() ->> 'email' = 'adalloya@gmail.com'
);

-- Allow admins to view all applications
create policy "Admins can view all applications"
on applications for select
using (
  auth.jwt() ->> 'email' = 'adalloya@gmail.com'
);

-- Allow admins to view all jobs (if not already public)
create policy "Admins can view all jobs"
on jobs for select
using (
  auth.jwt() ->> 'email' = 'adalloya@gmail.com'
);

-- Allow admins to update jobs (for republishing/toggling)
create policy "Admins can update all jobs"
on jobs for update
using (
  auth.jwt() ->> 'email' = 'adalloya@gmail.com'
);
