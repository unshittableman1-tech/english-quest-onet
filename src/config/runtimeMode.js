function readDemoQuery() {
  if (typeof window === 'undefined') return false;
  const value = new URLSearchParams(window.location.search).get('demo');
  return value === '1' || value === 'true';
}

const isDemoBuild = import.meta.env?.VITE_DEMO_MODE === 'true';

export const isDemoMode = isDemoBuild || readDemoQuery();

const LOCAL_STAGING_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_STAGING_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

function resolveSupabaseConfig() {
  if (isDemoBuild) {
    return { url: '', anonKey: '' };
  }
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '';
  const envAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '';
  // When running locally in browser on localhost or 127.0.0.1, route to local staging unless remote is requested
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const search = window.location.search || '';
    // Local development uses local staging, as selected for this workspace.
    // An explicit ?supabase=remote remains available; production env selection is unchanged.
    const useRemote = (import.meta.env?.VITE_USE_REMOTE_SUPABASE === 'true') || new URLSearchParams(search).get('supabase') === 'remote';
    if ((host === 'localhost' || host === '127.0.0.1' || host === '::1') && !useRemote) {
      return { url: LOCAL_STAGING_SUPABASE_URL, anonKey: LOCAL_STAGING_ANON_KEY };
    }
  } else if (!envUrl) {
    // In Node test environment, default to local staging
    return { url: LOCAL_STAGING_SUPABASE_URL, anonKey: LOCAL_STAGING_ANON_KEY };
  }
  return {
    url: envUrl,
    anonKey: envAnonKey,
  };
}

export const supabaseConfig = Object.freeze(resolveSupabaseConfig());

export const hasSupabaseConfig = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

