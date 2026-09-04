'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

type Photo = { id: string; url: string; caption: string | null };

/**
 * Grid plus a lightbox. Deliberately not a carousel library — arrow keys,
 * Escape, and a big close target cover what homeowners actually do, and it keeps
 * a dependency out of the bundle.
 */
export function PhotoGallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    // Stop the page scrolling behind the lightbox.
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, step]);

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <div className='mt-10 grid gap-4 sm:grid-cols-2'>
        {photos.map((photo, i) => (
          <figure key={photo.id}>
            <button
              type='button'
              onClick={() => setOpenIndex(i)}
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
              className='relative block aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-surface-strong transition-shadow hover:shadow-float'
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? `${title} — photo ${i + 1}`}
                fill
                sizes='(max-width: 744px) 100vw, 50vw'
                className='object-cover'
              />
            </button>
            {photo.caption && (
              <figcaption className='px-1 pt-2 text-sm text-muted-foreground'>
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {active && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label={`${title} — photo ${(openIndex ?? 0) + 1} of ${photos.length}`}
          className='fixed inset-0 z-50 flex flex-col bg-black/50'
        >
          <button
            type='button'
            aria-label='Close photo viewer'
            tabIndex={-1}
            onClick={close}
            className='absolute inset-0 cursor-default'
          />

          <div className='relative flex justify-end p-4'>
            <button
              type='button'
              onClick={close}
              className='flex size-12 items-center justify-center rounded-full bg-white text-xl text-ink'
              aria-label='Close'
            >
              &times;
            </button>
          </div>

          <div className='pointer-events-none relative flex-1 px-4 pb-4'>
            <Image
              src={active.url}
              alt={active.caption ?? title}
              fill
              sizes='100vw'
              className='object-contain'
            />
          </div>

          {photos.length > 1 && (
            <div className='relative flex items-center justify-center gap-4 pb-8'>
              <button
                type='button'
                onClick={() => step(-1)}
                className='flex h-12 min-w-24 items-center justify-center rounded-full bg-white px-5 text-base font-medium text-ink'
              >
                Previous
              </button>
              <span className='text-base font-medium text-white'>
                {(openIndex ?? 0) + 1} / {photos.length}
              </span>
              <button
                type='button'
                onClick={() => step(1)}
                className='flex h-12 min-w-24 items-center justify-center rounded-full bg-white px-5 text-base font-medium text-ink'
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
