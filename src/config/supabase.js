import { createClient } from '@supabase/supabase-js';
import { createDisabledSupabase } from './disabledSupabase.js';
import { hasSupabaseConfig, isDemoMode, supabaseConfig } from './runtimeMode.js';

export const supabase = isDemoMode
  ? createDisabledSupabase('Demo Mode is isolated from Supabase')
  : hasSupabaseConfig
    ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : createDisabledSupabase('Supabase environment variables are not configured');
