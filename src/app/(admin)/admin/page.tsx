import Link from 'next/link';
import type { Metadata } from 'next';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { ProjectBadge } from '@/components/status-badge';
import { getProjectRows } from '@/features/admin/queries';
import { daysSince, formatDateShort } from '@/lib/format';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Builds' };

/** Amber past a fortnight: a portal that goes quiet is the main failure mode. */
const STALE_DAYS = 14;

export default async function AdminProjectsPage() {
  const projects = await getProjectRows();

  return (
    <div>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
            Builds
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Sorted by how long it&rsquo;s been since the homeowner heard from us.
          </p>
        </div>
        <Link href='/admin/projects/new' className={buttonVariants({ size: 'admin' })}>
          New build
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title='No builds yet'
          className='mt-8'
          action={
            <Link href='/admin/projects/new' className={buttonVariants({ size: 'admin' })}>
              Create the first build
            </Link>
          }
        >
          Create a build, then invite the homeowners to follow along.
        </EmptyState>
      ) : (
        // DESIGN.md: the table scrolls inside its own container; the page never
        // scrolls sideways.
        <div className='mt-8 overflow-x-auto'>
          <table className='w-full min-w-[720px] border-collapse text-sm'>
            <thead>
              <tr className='border-b border-hairline bg-surface-strong text-left'>
                <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                  Build
                </th>
                <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                  Homeowners
                </th>
                <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                  Stage
                </th>
                <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                  Status
                </th>
                <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                  Last update
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const days = daysSince(project.last_update_at);
                const stale = days === null || days >= STALE_DAYS;

                return (
                  <tr
                    key={project.id}
                    className='border-b border-hairline-soft transition-colors hover:bg-surface-soft'
                  >
                    <td className='px-3 py-0'>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className='flex h-11 items-center font-medium text-ink hover:text-primary'
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className='px-3 py-2.5 text-body'>
                      {project.homeowners.join(', ') || (
                        <span className='text-muted-soft'>None invited</span>
                      )}
                    </td>
                    <td className='px-3 py-2.5 text-body'>
                      {project.current_stage ?? <span className='text-muted-soft'>—</span>}
                    </td>
                    <td className='px-3 py-2.5'>
                      <ProjectBadge status={project.status} />
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2.5',
                        stale ? 'font-medium text-status-progress' : 'text-body'
                      )}
                    >
                      {days === null
                        ? 'Never'
                        : days === 0
                          ? 'Today'
                          : `${days} day${days === 1 ? '' : 's'} ago`}
                      {project.last_update_at && (
                        <span className='block text-[13px] text-muted-foreground'>
                          {formatDateShort(project.last_update_at)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
