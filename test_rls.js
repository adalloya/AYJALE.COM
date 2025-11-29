import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lewrbktctepsiiqcrbtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld3Jia3RjdGVwc2lpcWNyYnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDMxNDIsImV4cCI6MjA3OTk3OTE0Mn0.s2yCBRkR4l6M-2J5-9UsQhGwk6WFVqIJWWDYgnTa9UM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
    console.log("Testing unauthorized job insertion...");
    const { data, error } = await supabase
        .from('jobs')
        .insert([{
            title: 'Hacker Job',
            description: 'Should fail',
            company_id: '00000000-0000-0000-0000-000000000000' // Random UUID
        }]);

    if (error) {
        console.log('RLS Verification Successful. Error:', error.message);
    } else {
        console.log('RLS Verification FAILED. Inserted data:', data);
    }
}

testRLS();
