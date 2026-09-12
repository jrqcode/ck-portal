import { signInAsDemo, signOut } from '@/features/auth/actions';
import { DEMO_ACCOUNTS, otherDemoRole, type DemoRole } from '@/lib/demo';

/**
 * The demo-only strip above both areas.
 *
 * It exists because one browser holds one Supabase session: without it, seeing
 * the other side of the portal means signing out, or clearing cookies. Neutral
 * greys throughout — this is scaffolding, not product, and it should not spend
 * the one red accent.
 *
 * Rendered only where `demoEnabled` is true, and it disappears entirely with the
 * flag off.
 */
// Named `viewing` rather than `role` so the a11y lint doesn't read it as an
// ARIA role on a DOM element.
export function DemoBar({ viewing }: { viewing: DemoRole }) {
  const current = DEMO_ACCOUNTS[viewing];
  const other = DEMO_ACCOUNTS[otherDemoRole(viewing)];

  return (
    <div className='border-b border-hairline bg-surface-strong'>
      <div className='mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-6 px-5 md:px-8'>
        <p className='py-1 text-[13px] leading-[1.23] text-muted-foreground'>
          <span className='font-semibold text-ink'>Demo</span> — viewing as {current.name} (
          {current.short})
        </p>

        <div className='flex items-center gap-5'>
          <form action={signInAsDemo}>
            <input type='hidden' name='role' value={otherDemoRole(viewing)} />
            <button
              type='submit'
              className='flex min-h-11 items-center text-[13px] leading-[1.23] font-medium text-ink underline-offset-4 hover:underline'
            >
              Switch to the {other.label.toLowerCase()}
            </button>
          </form>

          <form action={signOut}>
            <button
              type='submit'
              className='flex min-h-11 items-center text-[13px] leading-[1.23] text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
