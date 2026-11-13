import { createClient } from '@supabase/supabase-js';
import { env, hasSupabaseConfig } from './env.js';

let supabaseClient = null;
let supabaseAdminClient = null;

if (hasSupabaseConfig) {
  const url = env.SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  supabaseAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('✅ Supabase clients initialized successfully');
} else {
  console.warn('⚠️ SUPABASE credentials not configured in environment. Using in-memory fallback for development.');
}

export const supabase = supabaseClient;
export const supabaseAdmin = supabaseAdminClient;
