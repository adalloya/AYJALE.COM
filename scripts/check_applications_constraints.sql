
-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applications';

-- Check constraints (unique, foreign keys)
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'applications'::regclass;
