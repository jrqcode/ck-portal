import { Button } from '@/components/ui/button';
import { DEMO_ACCOUNTS, DEMO_ROLES } from '@/lib/demo';
import { signInAsDemo } from './actions';

/**
 * The two one-click demo logins, shown under the real sign-in form while demo
 * mode is on.
 *
 * Both are secondary on purpose — DESIGN.md allows one primary per screen
 * region and the real sign-in CTA above owns it. Nothing here renders unless
 * the caller has already checked `demoEnabled`.
 */
export function DemoSignIn() {
  return (
    <section className='mt-10 border-t border-hairline pt-8'>
      <h2 className='text-base leading-[1.25] font-semibold text-ink'>Take a look around</h2>
      <p className='mt-2 text-sm leading-[1.43] text-muted-foreground'>
        This portal is loaded with a sample build. Pick a side to see it from — you can switch
        whenever you like.
      </p>

      <div className='mt-6 space-y-5'>
        {DEMO_ROLES.map((role) => {
          const account = DEMO_ACCOUNTS[role];
          return (
            <form key={role} action={signInAsDemo}>
              <input type='hidden' name='role' value={role} />
              <Button type='submit' variant='outline' size='cta' className='w-full'>
                {account.label}
              </Button>
              <p className='mt-2 text-center text-[13px] leading-[1.23] text-muted-foreground'>
                {account.blurb}
              </p>
            </form>
          );
        })}
      </div>
    </section>
  );
}
