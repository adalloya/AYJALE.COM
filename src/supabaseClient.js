import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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
