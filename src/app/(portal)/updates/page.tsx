import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PhotoCard } from '@/features/portal/photo-card';
import { getMyProject, getUpdates, photoUrls } from '@/features/portal/queries';
import { formatRelativeDay } from '@/lib/format';

export const metadata: Metadata = { title: 'Progress' };

export default async function UpdatesPage() {
  const project = await getMyProject();
  if (!project) return <EmptyState title='Your build is being set up' />;

  const updates = await getUpdates(project.id);
  const urls = await photoUrls(updates);

  return (
    <div>
      <h1 className='text-[28px] leading-[1.4] font-bold text-ink'>Progress</h1>
      <p className='mt-2 max-w-[60ch] text-base leading-relaxed text-body'>
        Every update we&rsquo;ve posted on {project.name}, newest first.
      </p>

      {updates.length === 0 ? (
        <EmptyState title='No updates yet' className='mt-10'>
          Once work begins on site, photos and notes will appear here.
        </EmptyState>
      ) : (
        <div className='mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {updates.map((update, i) => (
            <PhotoCard
              key={update.id}
              href={`/updates/${update.id}`}
              src={urls.get(update.update_photos[0]?.storage_path ?? '') ?? null}
              alt={update.title}
              title={update.title}
              priority={i < 3}
              meta={[
                formatRelativeDay(update.published_at),
                update.project_stages?.name,
                update.update_photos.length > 1 ? `${update.update_photos.length} photos` : null
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
