-- Create a function to increment view count safely
-- This bypasses RLS for this specific operation
create or replace function increment_job_view(job_id int)
returns void
language plpgsql
security definer
as $$
begin
  update jobs
  set view_count = view_count + 1
  where id = job_id;
end;
$$;

-- Grant execute permission to everyone (public) and authenticated users
grant execute on function increment_job_view(int) to anon, authenticated, service_role;
