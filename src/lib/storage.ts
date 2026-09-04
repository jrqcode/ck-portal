import 'server-only';

import { createClient } from '@/lib/supabase/server';

export const PHOTO_BUCKET = 'project-photos';
export const DOCUMENT_BUCKET = 'project-documents';

/** One hour is long enough to read a page without leaving links lying around. */
const SIGNED_URL_TTL = 60 * 60;

/**
 * Both buckets are private. Everything reaches the browser as a signed URL —
 * the storage policies still check the caller, so a signed URL is only ever
 * issued for an object the user was already allowed to read.
 */
export async function signedUrl(bucket: string, path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

/** Batched variant — one round trip for a whole photo grid. */
export async function signedUrls(bucket: string, paths: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (paths.length === 0) return result;

  const supabase = await createClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrls(paths, SIGNED_URL_TTL);

  for (const item of data ?? []) {
    if (item.signedUrl && item.path) result.set(item.path, item.signedUrl);
  }
  return result;
}
