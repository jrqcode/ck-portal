import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth';
import { getMyProject } from '@/features/portal/queries';
import { signOut } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { SetPasswordForm } from '@/features/portal/set-password-form';

export const metadata: Metadata = { title: 'Your account' };

export default async function AccountPage() {
  const [profile, project] = await Promise.all([requireProfile(), getMyProject()]);

  return (
    <div className='max-w-[560px]'>
      <h1 className='text-[28px] leading-[1.4] font-bold text-ink'>Your account</h1>

      <dl className='mt-10 space-y-6'>
        <div>
          <dt className='text-sm text-muted-foreground'>Name</dt>
          <dd className='mt-1 text-base text-ink'>{profile.full_name || '—'}</dd>
        </div>
        {project && (
          <div>
            <dt className='text-sm text-muted-foreground'>Your build</dt>
            <dd className='mt-1 text-base text-ink'>{project.name}</dd>
          </div>
        )}
      </dl>

      <section className='mt-12 border-t border-hairline pt-10'>
        <h2 className='text-[20px] leading-[1.18] font-semibold tracking-[-0.18px] text-ink'>
          Set a password
        </h2>
        <p className='mt-2 text-base leading-relaxed text-body'>
          Optional. You can always sign in with an emailed link instead — most people find that
          easier.
        </p>
        <SetPasswordForm />
      </section>

      <section className='mt-12 border-t border-hairline pt-10'>
        <form action={signOut}>
          <Button type='submit' variant='outline' size='cta'>
            Sign out
          </Button>
        </form>
      </section>
    </div>
  );
}
