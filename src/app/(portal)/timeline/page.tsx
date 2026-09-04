import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { StageBadge } from '@/components/status-badge';
import { getMyProject, getStages } from '@/features/portal/queries';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Timeline' };

export default async function TimelinePage() {
  const project = await getMyProject();
  if (!project) return <EmptyState title='Your build is being set up' />;

  const stages = await getStages(project.id);
  const done = stages.filter((s) => s.status === 'complete').length;

  return (
    <div>
      <h1 className='text-[28px] leading-[1.4] font-bold text-ink'>Timeline</h1>
      <p className='mt-2 max-w-[60ch] text-base leading-relaxed text-body'>
        The stages of your build, and where things stand today. Dates shift with weather and
        inspections — we&rsquo;ll always tell you here when they do.
      </p>

      <p className='mt-6 text-base font-semibold text-ink'>
        {done} of {stages.length} stages complete
      </p>

      {/* DESIGN.md: stacked list items, never a table. The gold rail is the
          homeowner-area decorative accent. */}
      <ol className='mt-10 space-y-0'>
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          return (
            <li key={stage.id} className='relative flex gap-5 pb-8'>
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-6 left-[11px] h-full w-0.5',
                    stage.status === 'complete' ? 'bg-gold' : 'bg-hairline'
                  )}
                />
              )}

              <span
                aria-hidden
                className={cn(
                  'relative z-10 mt-1 size-6 shrink-0 rounded-full border-2 bg-background',
                  stage.status === 'complete' && 'border-status-complete bg-status-complete',
                  stage.status === 'in_progress' &&
                    'border-status-progress bg-status-progress-tint',
                  stage.status === 'not_started' && 'border-hairline'
                )}
              />

              <div className='min-w-0 flex-1 pt-0.5'>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                  <h2 className='text-base leading-[1.25] font-semibold text-ink'>{stage.name}</h2>
                  <StageBadge status={stage.status} />
                </div>

                {stage.description && (
                  <p className='mt-1.5 max-w-[60ch] text-base leading-relaxed text-body'>
                    {stage.description}
                  </p>
                )}

                {(stage.started_on || stage.completed_on) && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {stage.completed_on
                      ? `Completed ${formatDate(stage.completed_on)}`
                      : `Started ${formatDate(stage.started_on)}`}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {stages.length === 0 && (
        <EmptyState title='Your timeline is being prepared' className='mt-10'>
          The stages of your build will be listed here shortly.
        </EmptyState>
      )}
    </div>
  );
}
