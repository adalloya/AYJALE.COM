-- Drop previous policies to avoid conflicts
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can view all applications" on applications;
drop policy if exists "Admins can view all jobs" on jobs;
drop policy if exists "Admins can update all jobs" on jobs;

-- Enable RLS (just in case)
alter table profiles enable row level security;
alter table applications enable row level security;
alter table jobs enable row level security;

-- Allow admin (by UUID) to view all profiles
create policy "Admins can view all profiles"
on profiles for select
using (
  auth.uid() = 'f42222ef-4cf0-44f8-83a5-edb62898a63a'
);

-- Allow admin to view all applications
create policy "Admins can view all applications"
on applications for select
using (
  auth.uid() = 'f42222ef-4cf0-44f8-83a5-edb62898a63a'
);

-- Allow admin to view all jobs
create policy "Admins can view all jobs"
on jobs for select
using (
  auth.uid() = 'f42222ef-4cf0-44f8-83a5-edb62898a63a'
);

-- Allow admin to update all jobs
create policy "Admins can update all jobs"
on jobs for update
using (
  auth.uid() = 'f42222ef-4cf0-44f8-83a5-edb62898a63a'
);
