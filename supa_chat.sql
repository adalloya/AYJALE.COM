-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  application_id bigint references public.applications(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies
-- 1. Users can view messages for their own applications (as candidate)
create policy "Users can view messages for their own applications"
on public.messages for select
using (
  exists (
    select 1 from public.applications
    where public.applications.id = messages.application_id
    and public.applications.candidate_id = auth.uid()
  )
);

-- 2. Companies can view messages for applications to their jobs
create policy "Companies can view messages for their job applications"
on public.messages for select
using (
  exists (
    select 1 from public.applications
    join public.jobs on public.applications.job_id = public.jobs.id
    where public.applications.id = messages.application_id
    and public.jobs.company_id = auth.uid()
  )
);

-- 3. Users can insert messages if they are the candidate or the company owner
create policy "Users can insert messages for their applications"
on public.messages for insert
with check (
  (
    -- Is candidate
    exists (
      select 1 from public.applications
      where public.applications.id = messages.application_id
      and public.applications.candidate_id = auth.uid()
    )
  )
  OR
  (
    -- Is company
    exists (
      select 1 from public.applications
      join public.jobs on public.applications.job_id = public.jobs.id
      where public.applications.id = messages.application_id
      and public.jobs.company_id = auth.uid()
    )
  )
);
