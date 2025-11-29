import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lewrbktctepsiiqcrbtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld3Jia3RjdGVwc2lpcWNyYnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDMxNDIsImV4cCI6MjA3OTk3OTE0Mn0.s2yCBRkR4l6M-2J5-9UsQhGwk6WFVqIJWWDYgnTa9UM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyJobExpiration() {
    console.log("1. Fetching all jobs (public view)...");
    // Simulate public fetch (active=true, not expired)
    const { data: publicJobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('active', true)
        .gt('expires_at', new Date().toISOString());

    console.log(`Public jobs count: ${publicJobs.length}`);

    // Pick a job to expire manually
    if (publicJobs.length > 0) {
        const jobToExpire = publicJobs[0];
        console.log(`2. Expiring job ${jobToExpire.id} manually...`);

        // We need to be the owner to update, but RLS prevents this script from updating unless we auth.
        // For verification, we can just check if the query logic works by creating a new job that IS expired.
    }

    // Create an expired job
    const email = `expirer_${Date.now()}@test.com`;
    const password = 'password123';

    // Create user
    const { data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'company', name: 'Expirer' } }
    });

    // Login to get session
    const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
    const session = loginData.session;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${session.access_token}` } }
    });

    // Post expired job
    console.log("3. Posting an expired job...");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: expiredJob } = await supabaseAuth
        .from('jobs')
        .insert([{
            title: 'Expired Job',
            description: 'Should not be seen',
            company_id: authData.user.id,
            expires_at: yesterday.toISOString(),
            active: true
        }])
        .select()
        .single();

    console.log("Expired job created:", expiredJob.id);

    // Post inactive job
    console.log("4. Posting an inactive job...");
    const { data: inactiveJob } = await supabaseAuth
        .from('jobs')
        .insert([{
            title: 'Inactive Job',
            description: 'Should not be seen',
            company_id: authData.user.id,
            active: false
        }])
        .select()
        .single();

    console.log("Inactive job created:", inactiveJob.id);

    // Verify public fetch again
    console.log("5. Verifying public fetch filters...");
    const { data: publicJobsFinal } = await supabase
        .from('jobs')
        .select('*')
        .eq('active', true)
        .gt('expires_at', new Date().toISOString());

    const expiredVisible = publicJobsFinal.find(j => j.id === expiredJob.id);
    const inactiveVisible = publicJobsFinal.find(j => j.id === inactiveJob.id);

    if (!expiredVisible && !inactiveVisible) {
        console.log("SUCCESS: Expired and Inactive jobs are hidden from public view.");
    } else {
        console.log("FAILURE: Jobs are visible!", { expiredVisible, inactiveVisible });
    }
}

verifyJobExpiration();
