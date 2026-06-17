import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sanitize URL: strip trailing /rest/v1/ if present, since supabase-js appends it internally
if (supabaseUrl.endsWith('/rest/v1/')) {
    supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
    supabaseUrl = supabaseUrl.slice(0, -8);
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');
