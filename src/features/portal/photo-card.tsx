import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The homeowner area's primary unit. DESIGN.md: photo clipped to rounded.md in
 * a fixed aspect box so the grid never jumps while images load, then meta
 * beneath. Float shadow on hover only because the whole card is a link.
 */
export function PhotoCard({
  href,
  src,
  alt,
  title,
  meta,
  priority,
  className
}: {
  href: string;
  src: string | null;
  alt: string;
  title: string;
  meta?: string | null;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-[14px] transition-shadow hover:shadow-float focus-visible:shadow-float',
        className
      )}
    >
      <div className='relative aspect-[4/3] overflow-hidden rounded-[14px] bg-surface-strong'>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes='(max-width: 744px) 100vw, (max-width: 1128px) 50vw, 33vw'
            className='object-cover'
          />
        ) : (
          <div className='flex h-full items-center justify-center text-sm text-muted-soft'>
            No photo yet
          </div>
        )}
      </div>
      <div className='px-1 pt-3'>
        <h3 className='text-base leading-[1.25] font-semibold text-ink'>{title}</h3>
        {meta && <p className='mt-1 text-sm text-muted-foreground'>{meta}</p>}
      </div>
    </Link>
  );
}
