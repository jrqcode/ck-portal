import { cn } from '@/lib/utils';

/**
 * Homeowners hit these on day one of a build, before anything has been posted.
 * Keep the copy warm and specific about what will appear here — never a bare
 * "No results".
 */
export function EmptyState({
  title,
  children,
  action,
  className
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-dashed border-hairline px-6 py-14 text-center',
        className
      )}
    >
      <h2 className='text-base font-semibold text-ink'>{title}</h2>
      {children && (
        <p className='mx-auto mt-2 max-w-[42ch] text-base leading-relaxed text-muted-foreground'>
          {children}
        </p>
      )}
      {action && <div className='mt-6 flex justify-center'>{action}</div>}
    </div>
  );
}
