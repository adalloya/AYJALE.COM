import { createClient } from '@supabase/supabase-js'

// EMERGENCY HOTFIX: Hardcoding credentials because Vercel Env Vars are not updating
const supabaseUrl = 'https://tmflytdmznczikakjhok.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZmx5dGRtem5jemlrYWtqaG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTA0MjIsImV4cCI6MjA4MDg4NjQyMn0.su7XSKcWEvZsyiPswsgpe7rxVYZe5cQAiXMbuAPNq10'

console.log('%c [DEBUG] Supabase Config Check (Hardcoded):', 'color: #00ff00; font-weight: bold');
console.log('URL:', supabaseUrl);

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables! Check your .env file.');
    // Create a dummy client that warns on usage, preventing immediate crash
    supabase = {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Missing Supabase Keys') }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        from: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Missing Supabase Keys') }),
        })
    };
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
