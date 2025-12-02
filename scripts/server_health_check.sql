-- SERVER HEALTH CHECK SCRIPT
-- Run these queries in Supabase SQL Editor to monitor your database health.

-- 1. ACTIVE CONNECTIONS (Should be < 80% of your limit)
SELECT count(*) as active_connections, state 
FROM pg_stat_activity 
GROUP BY state;

-- 2. LONG RUNNING QUERIES (Potential CPU Hogs)
-- If this returns rows with duration > 1 second, you have a problem.
SELECT 
  pid, 
  now() - query_start as duration, 
  usename, 
  state, 
  query 
FROM pg_stat_activity 
WHERE state != 'idle' 
  AND (now() - query_start) > interval '1 second'
ORDER BY duration DESC;

-- 3. CACHE HIT RATIO (Should be > 99%)
-- If low, you need more RAM or better indexes.
SELECT 
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- 4. TABLE SIZES (Check for uncontrolled growth)
SELECT 
  relname as table_name, 
  pg_size_pretty(pg_total_relation_size(relid)) as total_size 
FROM pg_catalog.pg_statio_user_tables 
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;

-- 5. INDEX USAGE (Find unused indexes)
SELECT 
  relname, 
  indexrelname, 
  idx_scan, 
  idx_tup_read, 
  idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan ASC 
LIMIT 10;
