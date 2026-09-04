'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type AuthState = { error?: string; sent?: boolean };

function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === 'string' ? next : '/';
  return value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

async function origin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

/** Magic link — the default path. Nothing to remember between visits. */
export async function sendMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!email) return { error: 'Enter your email address.' };

  const supabase = await createClient();
  const next = safeNext(formData.get('next'));

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Invite-only: never create an account from a sign-in attempt.
      shouldCreateUser: false,
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error) {
    // Deliberately vague: don't reveal which addresses have accounts.
    return { error: 'We could not send that link. Check the address and try again.' };
  }

  return { sent: true };
}

/** Password sign-in, for homeowners who chose to set one. */
export async function signInWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: 'That email and password did not match.' };

  redirect(safeNext(formData.get('next')));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/sign-in');
}
