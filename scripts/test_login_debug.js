
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Attempting login with adalloya@ayjale.com...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'adalloya@ayjale.com',
        password: 'Bahipeso1'
    });

    if (error) {
        console.error('Login failed:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
    } else {
        console.log('Login successful!');
        console.log('User:', data.user.email);
        console.log('Role:', data.user.user_metadata.role); // Check metadata role
    }
}

testLogin();
