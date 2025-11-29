import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lewrbktctepsiiqcrbtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld3Jia3RjdGVwc2lpcWNyYnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDMxNDIsImV4cCI6MjA3OTk3OTE0Mn0.s2yCBRkR4l6M-2J5-9UsQhGwk6WFVqIJWWDYgnTa9UM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createCompanyUser() {
    const email = `admin_${Date.now()}@talentomx.com`;
    const password = 'StrongPassword123!';

    console.log(`Creating user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', data.user.email);
    }
}

createCompanyUser();
