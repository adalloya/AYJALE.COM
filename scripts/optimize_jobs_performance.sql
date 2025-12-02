-- Add indexes to speed up job queries and prevent timeouts

-- Index for filtering by active status and expiration date (most common query)
CREATE INDEX IF NOT EXISTS idx_jobs_active_expires ON jobs(active, expires_at);

-- Index for sorting by creation date (used in almost all lists)
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Index for company_id to speed up joins with profiles
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);

-- Index for salary filtering
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min_max ON jobs(salary_min, salary_max);

-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index for location filtering
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING gin(location gin_trgm_ops);

-- Index for title/description search
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(title gin_trgm_ops, description gin_trgm_ops);
