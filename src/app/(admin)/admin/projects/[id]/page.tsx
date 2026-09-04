import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { DraftBadge, ProjectBadge, StageBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';
import { ProjectTabs } from '@/features/admin/project-tabs';
import { getProject, getProjectStages, getProjectUpdates } from '@/features/admin/queries';
import { deleteUpdate, publishUpdate, setStageStatus } from '@/features/admin/actions';
import { daysSince, formatDateShort } from '@/lib/format';

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const project = await getProject((await params).id);
  return { title: project?.name ?? 'Build' };
}

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const [stages, updates] = await Promise.all([getProjectStages(id), getProjectUpdates(id)]);
  const lastPublished = updates.find((u) => u.published_at)?.published_at ?? null;
  const days = daysSince(lastPublished);

  return (
    <div>
      <Link
        href='/admin'
        className='text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
      >
        &larr; Builds
      </Link>

      <div className='mt-3 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <div className='flex flex-wrap items-center gap-3'>
            <h1 className='text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
              {project.name}
            </h1>
            <ProjectBadge status={project.status} />
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {[
              project.address,
              project.community &&
                `${project.community}${project.lot ? ` · Lot ${project.lot}` : ''}`
            ]
              .filter(Boolean)
              .join(' · ') || 'No address set'}
          </p>
        </div>

        <Link
          href={`/admin/projects/${id}/updates/new`}
          className={buttonVariants({ size: 'admin' })}
        >
          Post an update
        </Link>
      </div>

      {(days === null || days >= 14) && (
        <p className='mt-5 rounded-[8px] bg-status-progress-tint px-4 py-3 text-sm font-medium text-status-progress'>
          {days === null
            ? 'The homeowners have not seen an update yet.'
            : `It has been ${days} days since the homeowners heard from us.`}
        </p>
      )}

      <ProjectTabs projectId={id} active='updates' />

      <div className='mt-8 grid gap-10 lg:grid-cols-[1fr_320px]'>
        <section>
          <h2 className='text-base font-semibold text-ink'>Updates</h2>

          {updates.length === 0 ? (
            <EmptyState
              title='No updates yet'
              className='mt-4'
              action={
                <Link
                  href={`/admin/projects/${id}/updates/new`}
                  className={buttonVariants({ size: 'admin' })}
                >
                  Post the first update
                </Link>
              }
            >
              Photos and a short note are all it takes.
            </EmptyState>
          ) : (
            <ul className='mt-4 divide-y divide-hairline-soft border-t border-hairline'>
              {updates.map((update) => (
                <li key={update.id} className='flex flex-wrap items-center gap-x-4 gap-y-2 py-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='truncate text-sm font-medium text-ink'>{update.title}</span>
                      {!update.published_at && <DraftBadge />}
                    </div>
                    <p className='mt-0.5 text-[13px] text-muted-foreground'>
                      {update.published_at
                        ? `Published ${formatDateShort(update.published_at)}`
                        : `Saved ${formatDateShort(update.created_at)}`}
                    </p>
                  </div>

                  <div className='flex items-center gap-2'>
                    {!update.published_at && (
                      <form action={publishUpdate}>
                        <input type='hidden' name='id' value={update.id} />
                        <input type='hidden' name='project_id' value={id} />
                        <Button
                          type='submit'
                          size='sm'
                          variant='outline'
                          aria-label={`Publish update: ${update.title}`}
                        >
                          Publish
                        </Button>
                      </form>
                    )}
                    <form action={deleteUpdate}>
                      <input type='hidden' name='id' value={update.id} />
                      <input type='hidden' name='project_id' value={id} />
                      <Button
                        type='submit'
                        size='sm'
                        variant='destructive'
                        aria-label={`Delete update: ${update.title}`}
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className='text-base font-semibold text-ink'>Stages</h2>
          <ul className='mt-4 space-y-1'>
            {stages.map((stage) => (
              <li
                key={stage.id}
                className='flex items-center justify-between gap-3 rounded-[8px] px-2 py-2 hover:bg-surface-soft'
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm text-ink'>{stage.name}</p>
                  <StageBadge status={stage.status} className='mt-1' />
                </div>

                <form action={setStageStatus} className='shrink-0'>
                  <input type='hidden' name='id' value={stage.id} />
                  <input type='hidden' name='project_id' value={id} />
                  <select
                    name='status'
                    defaultValue={stage.status}
                    className='h-9 rounded-[8px] border border-input bg-background px-2 text-sm'
                    aria-label={`Status for ${stage.name}`}
                  >
                    <option value='not_started'>Not started</option>
                    <option value='in_progress'>In progress</option>
                    <option value='complete'>Complete</option>
                  </select>
                  <Button type='submit' size='sm' variant='ghost' className='ml-1'>
                    Save
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
