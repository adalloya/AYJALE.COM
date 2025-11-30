
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdmin2() {
    console.log('Testing login for admin2@ayjale.com...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin2@ayjale.com',
        password: 'Bahipeso1'
    });

    if (error) {
        console.error('LOGIN FAILED for admin2:', error.message);
    } else {
        console.log('LOGIN SUCCESSFUL for admin2');
        console.log('User ID:', data.user.id);

        // Check if it has admin role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        console.log('Role:', profile?.role);
    }
}

testAdmin2();
