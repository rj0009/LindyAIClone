import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These variables should be populated by the build environment,
// similar to how API_KEY is handled for the Gemini API.
// Do not hardcode them.
const supabaseUrl = (typeof process !== 'undefined' && process.env) ? process.env.SUPABASE_URL : undefined;
const supabaseAnonKey = (typeof process !== 'undefined' && process.env) ? process.env.SUPABASE_ANON_KEY : undefined;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is not set. Database features will be disabled. App will run in local-only mode.");
}

// The client will be null if the env vars are missing.
// App logic must handle this gracefully.
export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;
