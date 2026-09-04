import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/auth';
import { PortalNav } from '@/components/layout/portal-nav';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  // Staff belong in the admin area. This is a convenience redirect, not a
  // security boundary — RLS is what actually governs the data.
  if (profile.role === 'staff') redirect('/admin');

  const firstName = profile.full_name.split(' ')[0] || 'Account';

  return (
    <div className='min-h-dvh bg-background'>
      <PortalNav name={firstName} />
      <main className='mx-auto max-w-[1080px] px-6 py-12 md:py-16'>{children}</main>
    </div>
  );
}
