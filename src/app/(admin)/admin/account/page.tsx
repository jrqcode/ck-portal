import type { Metadata } from 'next';
import { requireStaff } from '@/lib/auth';
import { signOut } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Account' };

export default async function AdminAccountPage() {
  const profile = await requireStaff();

  return (
    <div className='max-w-[480px]'>
      <h1 className='text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
        Account
      </h1>
      <dl className='mt-8 space-y-5'>
        <div>
          <dt className='text-sm text-muted-foreground'>Name</dt>
          <dd className='mt-1 text-sm text-ink'>{profile.full_name || '—'}</dd>
        </div>
        <div>
          <dt className='text-sm text-muted-foreground'>Role</dt>
          <dd className='mt-1 text-sm text-ink capitalize'>{profile.role}</dd>
        </div>
      </dl>
      <form action={signOut} className='mt-10 border-t border-hairline pt-8'>
        <Button type='submit' variant='outline' size='admin'>
          Sign out
        </Button>
      </form>
    </div>
  );
}
