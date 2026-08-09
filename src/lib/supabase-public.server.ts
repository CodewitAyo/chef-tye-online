import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

/**
 * Server-side Supabase client using the PUBLISHABLE key only.
 * RLS applies. Pass a user bearer token to act as that signed-in user,
 * omit it to act as the anonymous role. Never uses the service role key.
 */
export function createPublicServerClient(accessToken?: string | null) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY');

  const supabaseFetch: typeof fetch = (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (isNewSupabaseApiKey(key) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };

  return createClient<Database>(url, key, {
    global: {
      fetch: supabaseFetch,
      ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
