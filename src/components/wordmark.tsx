import { cn } from '@/lib/utils';

/**
 * Typographic stand-in for the Caiden-Keller wordmark.
 *
 * The real logo is a PNG on the marketing site. Drop an SVG at
 * public/wordmark.svg and swap this out — the red hyphen mirrors the single
 * spot of colour in the actual mark.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('text-[17px] font-semibold tracking-tight text-ink', className)}
      aria-label='Caiden-Keller Homes'
    >
      Caiden<span className='text-primary'>-</span>Keller
      <span className='ml-1.5 font-normal text-muted-foreground'>Homes</span>
    </span>
  );
}
