import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getUpdate } from '@/features/portal/queries';
import { PHOTO_BUCKET, signedUrls } from '@/lib/storage';
import { formatDate } from '@/lib/format';
import { PhotoGallery } from '@/features/portal/photo-gallery';

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const update = await getUpdate((await params).id);
  return { title: update?.title ?? 'Update' };
}

export default async function UpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const update = await getUpdate((await params).id);

  // RLS already filtered drafts and other people's projects, so a miss here is
  // genuinely "not found" rather than "not allowed".
  if (!update) notFound();

  const urls = await signedUrls(
    PHOTO_BUCKET,
    update.update_photos.map((p) => p.storage_path)
  );

  const photos = update.update_photos
    .map((p) => ({ id: p.id, url: urls.get(p.storage_path) ?? null, caption: p.caption }))
    .filter((p): p is { id: string; url: string; caption: string | null } => Boolean(p.url));

  return (
    <article>
      <Link
        href='/updates'
        className='inline-flex min-h-11 items-center text-base text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
      >
        &larr; All progress
      </Link>

      <header className='mt-4'>
        <p className='text-sm text-muted-foreground'>
          {[formatDate(update.published_at), update.project_stages?.name]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <h1 className='mt-2 text-[28px] leading-[1.4] font-bold text-ink'>{update.title}</h1>
        {update.body && (
          <p className='mt-4 max-w-[65ch] text-base leading-relaxed whitespace-pre-line text-body'>
            {update.body}
          </p>
        )}
      </header>

      {photos.length > 0 && <PhotoGallery photos={photos} title={update.title} />}
    </article>
  );
}
