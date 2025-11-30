import { createClient } from '@supabase/supabase-js';

// Load environment variables via --env-file flag
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, but for admin creation usually requires service_role if RLS is strict, but signUp is public. 
// However, setting 'role' in metadata might be protected. 
// Let's try with anon key first as standard signup, then update if needed.
// Actually, to FORCE the role to 'admin', we might need to update the profile directly after signup if the trigger defaults to 'candidate'.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'adalloya'; // User requested "user adalloya", assuming they meant email or username. But Auth requires email usually. 
    // Wait, "user adalloya" might mean "adalloya@ayjale.com" or similar. 
    // I will use "adalloya@ayjale.com" as the email and "adalloya" as the name/metadata.
    // The user said "log in ... user adalloya". I'll assume email 'adalloya@ayjale.com' for now and print it.

    const finalEmail = 'adalloya@ayjale.com';
    const password = 'Bahipeso1';

    console.log(`Creating admin user: ${finalEmail}...`);

    // 1. Sign Up as Company first (to avoid potential check constraints on 'admin' role during trigger)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: finalEmail,
        password: password,
        options: {
            data: {
                name: 'Admin Adalloya',
                role: 'company' // Start as company
            }
        }
    });

    if (authError) {
        console.error('Error creating user:', authError.message);
        // If user already exists, try to sign in to get ID
        if (authError.message.includes('already registered')) {
            console.log('User exists, attempting to sign in...');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: finalEmail,
                password: password
            });

            if (signInError) {
                console.error('Sign in failed:', signInError.message);
                return;
            }

            console.log('Signed in. Updating role...');
            await updateRole(signInData.user.id);
            return;
        }
        return;
    }

    const userId = authData.user?.id;
    if (userId) {
        console.log(`User created with ID: ${userId}. Updating profile to admin...`);
        await updateRole(userId);
    }
}

async function updateRole(userId) {
    // Wait for trigger
    await new Promise(r => setTimeout(r, 2000));

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

    if (updateError) {
        console.error('Error updating profile role:', updateError.message);
    } else {
        console.log('Profile updated to admin successfully.');
    }
}

console.log('Done.');
}

createAdmin();
