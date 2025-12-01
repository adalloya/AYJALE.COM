-- Force fix for contact_unlocks foreign keys

-- Drop existing constraints if they exist to ensure a clean slate
ALTER TABLE public.contact_unlocks
DROP CONSTRAINT IF EXISTS contact_unlocks_company_id_fkey;

ALTER TABLE public.contact_unlocks
DROP CONSTRAINT IF EXISTS contact_unlocks_candidate_id_fkey;

-- Re-add the constraints explicitly
ALTER TABLE public.contact_unlocks
ADD CONSTRAINT contact_unlocks_company_id_fkey
FOREIGN KEY (company_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.contact_unlocks
ADD CONSTRAINT contact_unlocks_candidate_id_fkey
FOREIGN KEY (candidate_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Verify the table structure (optional, just for confirmation)
COMMENT ON TABLE public.contact_unlocks IS 'Table with fixed foreign keys';
