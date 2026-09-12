'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from '@/components/wordmark';
import { signOut } from '@/features/auth/actions';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin', label: 'Builds', exact: true },
  { href: '/admin/people', label: 'People' }
];

/**
 * Admin chrome. DESIGN.md: compact density, sidebar nav, primary-tint active
 * state. Collapses to a horizontal bar below 744px rather than a hamburger —
 * there are only two destinations.
 */
export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className='border-b border-hairline md:w-60 md:shrink-0 md:border-r md:border-b-0'>
      <div className='flex items-center justify-between gap-4 px-5 py-4 md:block md:py-6'>
        <Link href='/admin'>
          <Wordmark />
        </Link>
        <Link
          href='/admin/account'
          className='text-sm text-muted-foreground hover:text-ink md:hidden'
        >
          {name}
        </Link>
      </div>

      <nav aria-label='Admin' className='px-3 pb-3 md:pb-0'>
        <ul className='flex gap-1 md:flex-col'>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href, link.exact) ? 'page' : undefined}
                className={cn(
                  'flex h-9 items-center rounded-[8px] px-3 text-sm font-medium transition-colors',
                  isActive(link.href, link.exact)
                    ? 'bg-primary-tint text-primary'
                    : 'text-body hover:bg-surface-soft'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* The account page holds sign-out, and on desktop this block was the only
          thing naming it — as plain text. Nothing linked there, so there was no
          way to sign out at all without clearing cookies. */}
      <div className='hidden px-5 pt-6 md:block'>
        <p className='text-sm text-muted-foreground'>Signed in as</p>
        <Link
          href='/admin/account'
          className='mt-0.5 block truncate text-sm font-medium text-ink underline-offset-4 hover:underline'
        >
          {name}
        </Link>
        <form action={signOut}>
          <button
            type='submit'
            className='mt-2 flex h-9 items-center text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
