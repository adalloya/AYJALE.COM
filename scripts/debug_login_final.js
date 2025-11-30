
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLogin() {
    console.log('Testing login for adalloya@gmail.com...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'adalloya@gmail.com',
        password: 'Bahipeso1'
    });

    if (error) {
        console.error('LOGIN FAILED');
        console.error('Status:', error.status);
        console.error('Message:', error.message); // This is the key part
    } else {
        console.log('LOGIN SUCCESSFUL');
        console.log('User ID:', data.user.id);
        console.log('Role (metadata):', data.user.user_metadata.role);

        // Also fetch profile to check DB role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) console.error('Profile fetch error:', profileError.message);
        else console.log('Profile Role (DB):', profile.role);
    }
}

debugLogin();
