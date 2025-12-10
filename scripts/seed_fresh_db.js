
import { createClient } from '@supabase/supabase-js';

// Load environment variables via --env-file flag
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env. Setup .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed process for Fresh DB...');

    // 1. Create Admin
    const adminEmail = 'test.admin@ayjale.com';
    const password = 'password123';

    console.log(`Creating Admin: ${adminEmail}...`);
    const adminUser = await createUser(adminEmail, password, 'Admin User', 'admin');
    if (adminUser) console.log('✅ Admin ID:', adminUser.id);


    // 2. Create Company
    const companyEmail = 'test.company@ayjale.com';
    console.log(`Creating Company: ${companyEmail}...`);
    const companyUser = await createUser(companyEmail, password, 'Acme Corp', 'company');
    let jobId = null;

    if (companyUser) {
        console.log('✅ Company ID:', companyUser.id);

        // Create Job
        console.log('Creating Job Post...');
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .insert({
                company_id: companyUser.id,
                title: 'Senior Frontend Engineer',
                description: 'We are looking for a React expert to help us build the future of hiring.',
                location: 'Mexico City (Remote)',
                type: 'Full-time',
                salary_min: 50000,
                salary_max: 80000,
                requirements: '- React\n- Supabase\n- Tailwind',
                is_active: true
            })
            .select()
            .single();

        if (jobError) {
            console.error('❌ Error creating job:', jobError.message);
        } else {
            console.log('✅ Job created:', job.title, '(ID:', job.id, ')');
            jobId = job.id;
        }
    }

    // 3. Create Candidate
    const candidateEmail = 'test.candidate@ayjale.com';
    console.log(`Creating Candidate: ${candidateEmail}...`);
    const candidateUser = await createUser(candidateEmail, password, 'Juan Perez', 'candidate');

    if (candidateUser) {
        console.log('✅ Candidate ID:', candidateUser.id);

        // Create Application if Job exists
        if (jobId) {
            console.log('Creating Application...');
            const { error: appError } = await supabase
                .from('applications')
                .insert({
                    job_id: jobId,
                    candidate_id: candidateUser.id,
                    status: 'applied',
                    cover_letter: 'I am very interested in this role.'
                });

            if (appError) console.error('❌ Error applying:', appError.message);
            else console.log('✅ Application created successfully.');
        }
    }

    console.log('\nSeed Complete! You can now log in with these accounts.');
    console.log('Password for all:', password);
}

async function createUser(email, password, name, role) {
    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
                role: role // Metadata
            }
        }
    });

    if (authError) {
        console.error(`Error creating ${role}:`, authError.message);
        // If user exists, try to sign in
        if (authError.message.includes('already registered')) {
            const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
            if (loginData?.user) {
                // Update role locally just in case
                await updateProfileRole(loginData.user.id, role);
                return loginData.user;
            }
        }
        return null;
    }

    const userId = authData.user?.id;
    if (!userId) return null;

    // 2. Wait for Trigger (Profile creation) or create/update manually
    // We'll try to update the profile directly to ensure Role is correct
    await new Promise(r => setTimeout(r, 1000)); // Wait a sec for trigger
    await updateProfileRole(userId, role);

    return authData.user;
}

async function updateProfileRole(userId, role) {
    const { error } = await supabase
        .from('profiles')
        .update({ role: role }) // Ensure DB matches
        .eq('id', userId);

    if (error) console.error('Warning: Could not update profile role:', error.message);
}

seed();
