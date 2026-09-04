'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from '@/components/wordmark';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'My Build' },
  { href: '/updates', label: 'Progress' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/documents', label: 'Documents' }
];

/**
 * DESIGN.md: homeowner area uses top nav, not a sidebar. Labels are plain
 * language — "Progress", not "Activity Feed".
 */
export function PortalNav({ name }: { name: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className='sticky top-0 z-40 border-b border-hairline bg-background'>
      <div className='mx-auto flex h-20 max-w-[1080px] items-center justify-between gap-6 px-6'>
        <Link href='/' className='flex items-center'>
          <Wordmark />
        </Link>

        <nav aria-label='Main' className='hidden md:block'>
          <ul className='flex items-center gap-1'>
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center rounded-[8px] px-3.5 text-base font-semibold transition-colors',
                    isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-ink'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href='/account'
          className='flex h-11 items-center rounded-[8px] px-3 text-sm text-muted-foreground hover:text-ink'
        >
          {name}
        </Link>
      </div>

      {/* Below 744px the nav moves under the wordmark rather than into a menu —
          four links do not need a hamburger, and taps stay one level deep. */}
      <nav aria-label='Main' className='border-t border-hairline-soft md:hidden'>
        <ul className='mx-auto flex max-w-[1080px] items-center gap-1 overflow-x-auto px-4'>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'flex h-12 items-center whitespace-nowrap px-3 text-[15px] font-semibold',
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
