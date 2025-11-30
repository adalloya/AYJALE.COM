
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin2() {
    const email = 'admin2@ayjale.com';
    const password = 'Bahipeso1';

    console.log(`Creating ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: 'Admin 2',
                role: 'company' // Start as company
            }
        }
    });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('User created:', data.user?.id);

    // Try to login immediately to verify
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (loginError) {
        console.error('Immediate login failed:', loginError.message);
    } else {
        console.log('Immediate login successful!');

        // Upgrade to admin
        await new Promise(r => setTimeout(r, 2000));
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.user.id);

        if (updateError) console.error('Update role failed:', updateError.message);
        else console.log('Upgraded to admin.');
    }
}

createAdmin2();
