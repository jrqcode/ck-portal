import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/** Exchanges the OAuth/PKCE code from a magic link for a session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext(next)}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}

/** Only allow same-origin relative paths, so ?next= can't be used as an open redirect. */
function safeNext(next: string) {
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
