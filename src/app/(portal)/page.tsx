import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { PhotoCard } from '@/features/portal/photo-card';
import {
  currentStage,
  getMyProject,
  getStages,
  getUpdates,
  nextStage,
  photoUrls
} from '@/features/portal/queries';
import { PHOTO_BUCKET, signedUrl } from '@/lib/storage';
import { formatDate, formatRelativeDay } from '@/lib/format';

export default async function MyBuildPage() {
  const project = await getMyProject();

  if (!project) {
    return (
      <EmptyState title='Your build is being set up'>
        We&rsquo;re getting everything ready. Your project manager will be in touch as soon as
        there&rsquo;s something to show you here.
      </EmptyState>
    );
  }

  const [stages, updates] = await Promise.all([getStages(project.id), getUpdates(project.id, 4)]);
  const stage = currentStage(stages);
  const upNext = nextStage(stages);
  const latest = updates[0];

  // The hero is the newest photo posted, falling back to the project cover.
  const heroPath = latest?.update_photos[0]?.storage_path ?? project.cover_photo_path;
  const [heroUrl, urls] = await Promise.all([
    heroPath ? signedUrl(PHOTO_BUCKET, heroPath) : null,
    photoUrls(updates.slice(1))
  ]);

  const done = stages.filter((s) => s.status === 'complete').length;

  return (
    <div className='space-y-16'>
      <section>
        <div className='relative aspect-[16/9] overflow-hidden rounded-[14px] bg-surface-strong md:aspect-[21/9]'>
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={`Latest progress on ${project.name}`}
              fill
              priority
              sizes='(max-width: 1128px) 100vw, 1080px'
              className='object-cover'
            />
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-muted-soft'>
              The first photos of your build will appear here
            </div>
          )}
        </div>

        <div className='mt-8'>
          <p className='text-sm font-medium text-muted-foreground'>{project.name}</p>
          {/* DESIGN.md: the current stage is this system's one loud
              typographic moment — it is what every homeowner opens to read. */}
          <h1 className='mt-2 text-[28px] leading-[1.4] font-bold text-ink'>
            {stage ? stage.name : 'Getting started'}
          </h1>
          {stage?.description && (
            <p className='mt-3 max-w-[60ch] text-base leading-relaxed text-body'>
              {stage.description}
            </p>
          )}

          <div className='mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t-2 border-gold pt-6'>
            <div>
              <p className='text-sm text-muted-foreground'>Progress</p>
              <p className='mt-0.5 text-base font-semibold text-ink'>
                {done} of {stages.length} stages complete
              </p>
            </div>
            {upNext && (
              <div>
                <p className='text-sm text-muted-foreground'>Up next</p>
                <p className='mt-0.5 text-base font-semibold text-ink'>{upNext.name}</p>
              </div>
            )}
            {project.target_occupancy && (
              <div>
                <p className='text-sm text-muted-foreground'>Target occupancy</p>
                <p className='mt-0.5 text-base font-semibold text-ink'>
                  {formatDate(project.target_occupancy)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {latest && (
        <section>
          <h2 className='text-[21px] leading-[1.4] font-bold text-ink'>Latest update</h2>
          <article className='mt-4'>
            <p className='text-sm text-muted-foreground'>
              {formatRelativeDay(latest.published_at)}
            </p>
            <h3 className='mt-1 text-base font-semibold text-ink'>{latest.title}</h3>
            {latest.body && (
              <p className='mt-2 max-w-[65ch] text-base leading-relaxed whitespace-pre-line text-body'>
                {latest.body}
              </p>
            )}
            <Link
              href={`/updates/${latest.id}`}
              className='mt-4 inline-flex min-h-11 items-center text-base font-medium text-primary underline-offset-4 hover:underline'
            >
              See all {latest.update_photos.length || ''} photos
            </Link>
          </article>
        </section>
      )}

      {updates.length > 1 && (
        <section>
          <div className='flex items-baseline justify-between gap-4'>
            <h2 className='text-[21px] leading-[1.4] font-bold text-ink'>Earlier progress</h2>
            <Link
              href='/updates'
              className='text-base font-medium text-primary underline-offset-4 hover:underline'
            >
              View all
            </Link>
          </div>
          <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {updates.slice(1).map((update) => (
              <PhotoCard
                key={update.id}
                href={`/updates/${update.id}`}
                src={urls.get(update.update_photos[0]?.storage_path ?? '') ?? null}
                alt={update.title}
                title={update.title}
                meta={formatRelativeDay(update.published_at)}
              />
            ))}
          </div>
        </section>
      )}

      {!latest && (
        <EmptyState title='No updates yet'>
          As soon as work starts on site, photos and notes from your project manager will show up
          here.
        </EmptyState>
      )}

      <section className='border-t border-hairline pt-10'>
        <h2 className='text-[20px] leading-[1.18] font-semibold tracking-[-0.18px] text-ink'>
          Have a question?
        </h2>
        <p className='mt-2 max-w-[55ch] text-base leading-relaxed text-body'>
          Your project manager is the fastest way to get an answer — call or email them just as you
          would normally.
        </p>
        <Link
          href='/documents'
          className={buttonVariants({ variant: 'outline', size: 'cta', className: 'mt-6' })}
        >
          View your documents
        </Link>
      </section>
    </div>
  );
}
