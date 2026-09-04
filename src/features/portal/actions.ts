'use server';

import { createClient } from '@/lib/supabase/server';

export type PasswordState = { error?: string; done?: boolean };

export async function setPassword(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const password = String(formData.get('password') ?? '');
  if (password.length < 8) return { error: 'Use at least 8 characters.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: 'We could not save that password. Please try again.' };
  return { done: true };
}
