
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRealAdmin() {
    const email = 'adalloya@gmail.com';
    const password = 'Bahipeso1';

    console.log(`Creating ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: 'Adal Loya',
                role: 'company' // Must be company initially due to DB constraint
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('User created successfully!');
    console.log('ID:', data.user?.id);
    console.log('Role set to: company (Temporary)');
}

createRealAdmin();
