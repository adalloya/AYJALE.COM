-- Fix contact_unlocks foreign key relationships

-- Ensure the table exists (it likely does, but good to be safe)
CREATE TABLE IF NOT EXISTS public.contact_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, candidate_id)
);

-- Explicitly add constraints if they might be missing or named weirdly
-- We use DO blocks to avoid errors if they already exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_unlocks_company_id_fkey') THEN
        ALTER TABLE public.contact_unlocks
        ADD CONSTRAINT contact_unlocks_company_id_fkey
        FOREIGN KEY (company_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_unlocks_candidate_id_fkey') THEN
        ALTER TABLE public.contact_unlocks
        ADD CONSTRAINT contact_unlocks_candidate_id_fkey
        FOREIGN KEY (candidate_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Company can insert their own unlocks
CREATE POLICY "Companies can unlock contacts" ON public.contact_unlocks
    FOR INSERT
    WITH CHECK (auth.uid() = company_id);

-- Company can view people they unlocked
CREATE POLICY "Companies can view their unlocks" ON public.contact_unlocks
    FOR SELECT
    USING (auth.uid() = company_id);

-- Candidates can view who unlocked them
CREATE POLICY "Candidates can view who unlocked them" ON public.contact_unlocks
    FOR SELECT
    USING (auth.uid() = candidate_id);
