-- Check active connections count
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Check if we are waiting on locks
SELECT 
  pid, 
  usename, 
  pg_blocking_pids(pid) as blocked_by, 
  query as blocked_query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
