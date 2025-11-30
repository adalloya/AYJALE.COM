
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectApplications() {
    console.log('Fetching latest application...');
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching applications:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No applications found.');
        return;
    }

    console.log('Application Data Structure:', data[0]);
    console.log('Has created_at?', 'created_at' in data[0]);
    console.log('Value of created_at:', data[0].created_at);
}

inspectApplications();
