// Supabase client initialization
// All Supabase calls MUST go through the services/ layer — never call this directly from components.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Ensure the secret key is not accidentally passed in the frontend
const safeAnonKey =
  supabaseAnonKey.startsWith('sb_secret_')
    ? 'placeholder-anon-key'
    : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, safeAnonKey);
