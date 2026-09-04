import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * Only for operations the user genuinely cannot perform as themselves —
 * inviting a homeowner, for instance. Never expose this to the browser, and
 * never use it as a shortcut around a policy that should exist.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
