import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. Most Supabase documentation
 * still refers to the old name — the contents are the same.
 *
 * This file is NOT optional. Server Components cannot write cookies, so this is
 * the only place the auth token gets refreshed. Remove it and sessions expire
 * silently: homeowners appear signed out at random with no error.
 */

/** Paths reachable while signed out. Everything else redirects to /sign-in. */
const PUBLIC_PATHS = ['/sign-in', '/auth/callback', '/auth/confirm', '/auth/error'];

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        }
      }
    }
  );

  // Do not put anything between createServerClient and getUser(). getUser()
  // revalidates the token with Supabase; getSession() only reads the cookie and
  // must not be trusted on the server.
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    // Send them back where they were headed once they land.
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/sign-in') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Must return this exact response object so refreshed cookies survive.
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)$).*)'
  ]
};
