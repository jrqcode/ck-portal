import { requireStaff } from '@/lib/auth';
import { AdminNav } from '@/components/layout/admin-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Redirect only. RLS is what stops a homeowner reading staff data.
  const profile = await requireStaff();

  return (
    <div className='min-h-dvh bg-background md:flex'>
      <AdminNav name={profile.full_name || 'Staff'} />
      <main className='min-w-0 flex-1'>
        <div className='mx-auto max-w-[1280px] px-5 py-8 md:px-8'>{children}</div>
      </main>
    </div>
  );
}
