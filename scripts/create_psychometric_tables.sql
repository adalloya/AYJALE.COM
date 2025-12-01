-- Create psych_items table
CREATE TABLE IF NOT EXISTS public.psych_items (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    trait TEXT NOT NULL,
    keyed TEXT DEFAULT 'plus',
    difficulty FLOAT DEFAULT 0.0,
    discrimination FLOAT DEFAULT 1.0,
    is_validity_check BOOLEAN DEFAULT FALSE,
    validity_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create test_sessions table
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id SERIAL PRIMARY KEY,
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'in_progress',
    current_theta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create item_responses table
CREATE TABLE IF NOT EXISTS public.item_responses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES public.psych_items(id),
    response_value INTEGER,
    response_time_ms INTEGER,
    mouse_trajectory_entropy FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create candidate_profiles table
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
    id SERIAL PRIMARY KEY,
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES public.test_sessions(id),
    scores JSONB NOT NULL,
    validity_flags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.psych_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Policies

-- psych_items: Everyone can read (for taking the test)
CREATE POLICY "Everyone can read psych_items" ON public.psych_items
    FOR SELECT USING (true);

-- test_sessions: Users can create and read their own sessions
CREATE POLICY "Users can create their own test sessions" ON public.test_sessions
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can read their own test sessions" ON public.test_sessions
    FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Users can update their own test sessions" ON public.test_sessions
    FOR UPDATE USING (auth.uid() = candidate_id);

-- item_responses: Users can insert responses for their own sessions
CREATE POLICY "Users can insert their own responses" ON public.item_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.test_sessions
            WHERE id = item_responses.session_id
            AND candidate_id = auth.uid()
        )
    );

CREATE POLICY "Users can read their own responses" ON public.item_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_sessions
            WHERE id = item_responses.session_id
            AND candidate_id = auth.uid()
        )
    );

-- candidate_profiles: Users can read their own profile
CREATE POLICY "Users can read their own profile" ON public.candidate_profiles
    FOR SELECT USING (auth.uid() = candidate_id);

-- Insert some seed data for psych_items (Mock IPIP items)
INSERT INTO public.psych_items (text, trait, keyed, difficulty, discrimination) VALUES
('Suelo tomar la iniciativa en situaciones grupales.', 'Extraversion', 'plus', -0.5, 1.2),
('Me siento cómodo siendo el centro de atención.', 'Extraversion', 'plus', 0.2, 1.5),
('Presto atención a los detalles más pequeños.', 'Conscientiousness', 'plus', -0.2, 1.0),
('Me estreso con facilidad ante cambios repentinos.', 'Neuroticism', 'plus', 0.5, 1.1),
('Tengo una imaginación muy viva.', 'Openness', 'plus', -0.1, 1.3),
('Me intereso por los problemas de los demás.', 'Agreeableness', 'plus', -0.8, 0.9);
