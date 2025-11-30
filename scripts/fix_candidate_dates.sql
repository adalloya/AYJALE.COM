-- Add created_at column to profiles if it doesn't exist
alter table profiles add column if not exists created_at timestamptz default now();

-- Attempt to backfill created_at from auth.users
-- This requires permissions to access auth.users, which should be available in the Supabase SQL Editor
do $$
begin
  if exists (select from pg_tables where schemaname = 'auth' and tablename = 'users') then
    update profiles p
    set created_at = u.created_at
    from auth.users u
    where p.id = u.id
    and p.created_at is null; -- Only update if currently null (or default now() was just added and we want real dates)
  end if;
end $$;

-- Force update for rows where created_at is equal to the default now() (approximate check)
-- or just update all matching rows to be safe and accurate
update profiles p
set created_at = u.created_at
from auth.users u
where p.id = u.id;
