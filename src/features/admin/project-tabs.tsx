'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'updates', label: 'Updates', href: '' },
  { key: 'documents', label: 'Documents', href: '/documents' },
  { key: 'people', label: 'People', href: '/people' }
] as const;

export function ProjectTabs({
  projectId,
  active
}: {
  projectId: string;
  active: (typeof TABS)[number]['key'];
}) {
  return (
    <nav aria-label='Build sections' className='mt-6 border-b border-hairline'>
      <ul className='-mb-px flex gap-1'>
        {TABS.map((tab) => (
          <li key={tab.key}>
            <Link
              href={`/admin/projects/${projectId}${tab.href}`}
              aria-current={active === tab.key ? 'page' : undefined}
              className={cn(
                'flex h-10 items-center border-b-2 px-3 text-sm font-medium transition-colors',
                active === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-ink'
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
