import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';

/**
 * The signed-in user's profile, or null.
 *
 * Cached per request so a layout and its pages don't each re-query. Note that
 * this is for rendering decisions only — RLS is what actually protects data.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return data ?? null;
});

/** Require any signed-in user. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect('/sign-in');
  return profile;
}

/** Require builder staff. Homeowners get sent back to their own build. */
export async function requireStaff(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== 'staff') redirect('/');
  return profile;
}
