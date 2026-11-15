import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const isSupabaseConfigured = !!(
  env.SUPABASE_URL &&
  env.SUPABASE_URL.startsWith('http') &&
  !env.SUPABASE_URL.includes('placeholder') &&
  !env.SUPABASE_URL.includes('your-project') &&
  env.SUPABASE_SERVICE_ROLE_KEY &&
  !env.SUPABASE_SERVICE_ROLE_KEY.includes('your-')
);

const supabaseUrl = isSupabaseConfigured
  ? env.SUPABASE_URL
  : 'https://placeholder.supabase.co';

const supabaseKey = isSupabaseConfigured
  ? env.SUPABASE_SERVICE_ROLE_KEY
  : 'placeholder-service-role-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: (...args) => {
      if (!isSupabaseConfigured) {
        return Promise.reject(new Error('Supabase is not configured yet (using local in-memory store)'));
      }
      return fetch(...args);
    },
  },
});
