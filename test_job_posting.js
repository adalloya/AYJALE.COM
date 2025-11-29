import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lewrbktctepsiiqcrbtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld3Jia3RjdGVwc2lpcWNyYnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDMxNDIsImV4cCI6MjA3OTk3OTE0Mn0.s2yCBRkR4l6M-2J5-9UsQhGwk6WFVqIJWWDYgnTa9UM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJobPosting() {
    const email = `company_poster_${Date.now()}@talentomx.com`;
    const password = 'StrongPassword123!';

    console.log(`1. Creating user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'company',
                name: 'Job Poster Company'
            }
        }
    });

    if (authError) {
        console.error('Error creating user:', authError);
        return;
    }
    console.log('User created.');

    // Wait a bit for trigger to create profile
    await new Promise(r => setTimeout(r, 3000));

    console.log('2. Checking profile...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
    } else {
        console.log('Profile found:', profile);
    }

    let session = authData.session;

    if (!session) {
        console.log('Session missing after signup. Attempting login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) {
            console.error('Login failed (likely due to email confirmation):', loginError.message);
            return;
        }
        session = loginData.session;
        console.log('Login successful.');
    }

    console.log('3. Posting a job...');
    console.log('User ID:', authData.user.id);

    // Create authenticated client
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
    });

    const { data: jobData, error: jobError } = await supabaseAuth
        .from('jobs')
        .insert([{
            title: 'Vacante Externa de Prueba',
            description: 'Esta es una vacante externa simulada para probar la redirección.',
            company_id: authData.user.id,
            location: 'Remoto (Global)',
            salary: '85000',
            is_confidential: false,
            is_external: true,
            external_url: 'https://google.com',
            source: 'Google Careers'
        }])
        .select();

    if (jobError) {
        console.error('Error posting job:', jobError);
    } else {
        console.log('Job posted successfully:', jobData);
    }
}

testJobPosting();
