-- Create evaluation_tests table
CREATE TABLE IF NOT EXISTS evaluation_tests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'psychometric', 'cognitive', 'language'
    description TEXT,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE evaluation_tests ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read tests
CREATE POLICY "Public read access" ON evaluation_tests FOR SELECT USING (true);

-- Create candidate_results table
CREATE TABLE IF NOT EXISTS candidate_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES auth.users(id) NOT NULL,
    test_id INTEGER REFERENCES evaluation_tests(id) NOT NULL,
    status TEXT DEFAULT 'started', -- 'started', 'completed'
    score INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE candidate_results ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write their own results
CREATE POLICY "Users can see own results" ON candidate_results
    FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Users can insert own results" ON candidate_results
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update own results" ON candidate_results
    FOR UPDATE USING (auth.uid() = candidate_id);

-- Seed initial data (if empty)
INSERT INTO evaluation_tests (title, type, description, time_limit_minutes)
SELECT 'Perfil Conductual (Big 5)', 'psychometric', 'Descubre tus fortalezas laborales y estilo de trabajo.', 15
WHERE NOT EXISTS (SELECT 1 FROM evaluation_tests WHERE type = 'psychometric');

INSERT INTO evaluation_tests (title, type, description, time_limit_minutes)
SELECT 'Habilidades Cognitivas', 'cognitive', 'Evalúa tu razonamiento lógico y resolución de problemas.', 20
WHERE NOT EXISTS (SELECT 1 FROM evaluation_tests WHERE type = 'cognitive');

INSERT INTO evaluation_tests (title, type, description, time_limit_minutes)
SELECT 'Evaluación de Idiomas', 'language', 'Certifica tu nivel de inglés para negocios.', 15
WHERE NOT EXISTS (SELECT 1 FROM evaluation_tests WHERE type = 'language');
