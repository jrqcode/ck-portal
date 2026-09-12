import { requireStaff } from '@/lib/auth';
import { AdminNav } from '@/components/layout/admin-nav';
import { DemoBar } from '@/components/layout/demo-bar';
import { demoEnabled } from '@/lib/demo';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Redirect only. RLS is what stops a homeowner reading staff data.
  const profile = await requireStaff();

  return (
    <div className='flex min-h-dvh flex-col bg-background'>
      {demoEnabled && <DemoBar viewing='staff' />}
      <div className='flex-1 md:flex'>
        <AdminNav name={profile.full_name || 'Staff'} />
        <main className='min-w-0 flex-1'>
          <div className='mx-auto max-w-[1280px] px-5 py-8 md:px-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
