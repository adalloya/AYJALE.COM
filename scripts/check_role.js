import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserRole() {
    const email = 'adalloya@gmail.com';
    console.log(`Checking role for ${email}...`);

    // 1. Get User ID from Auth (we can't list users easily with anon key usually, but let's try profiles)
    // Actually, we can just query profiles by email if RLS allows or if we have service role.
    // Since I don't have service role key in env vars usually (only anon), I might be limited.
    // BUT, I can try to login as that user and check "me".

    // Alternative: Query profiles table directly. If RLS allows reading public profiles (which it usually does for basic info), we might see it.
    // If RLS is strict, I might not see it.

    // Let's try to query profiles first.
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('Error querying profiles:', error);
    } else {
        console.log('Profiles found:', profiles);
    }
}

checkUserRole();
