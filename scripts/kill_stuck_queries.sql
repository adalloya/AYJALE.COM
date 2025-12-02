-- Emergency script to kill stuck queries and recover DB CPU

-- 1. View active queries (Diagnostic)
SELECT pid, age(clock_timestamp(), query_start), usename, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY query_start ASC;

-- 2. Kill queries running for more than 10 seconds (Safety valve)
-- Uncomment the line below to execute the kill
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND (now() - query_start) > interval '10 seconds';

-- 3. Vacuum Analyze to refresh stats (Helps optimizer)
-- VACUUM ANALYZE jobs;
