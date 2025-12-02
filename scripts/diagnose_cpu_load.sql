-- View what is eating the CPU right now
SELECT 
  pid, 
  now() - query_start as duration, 
  state, 
  query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY duration DESC;
