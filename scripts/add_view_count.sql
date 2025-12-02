-- Add view_count column to jobs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'view_count') THEN
        ALTER TABLE jobs ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create or replace the increment_job_view function
CREATE OR REPLACE FUNCTION increment_job_view(job_id INT)
RETURNS VOID AS $$
BEGIN
  UPDATE jobs
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;
