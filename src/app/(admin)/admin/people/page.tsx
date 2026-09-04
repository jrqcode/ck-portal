import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { InviteForm } from '@/features/admin/invite-form';
import { getAllPeople, getProjectRows } from '@/features/admin/queries';
import { formatDateShort } from '@/lib/format';

export const metadata: Metadata = { title: 'People' };

export default async function PeoplePage() {
  const [people, projects] = await Promise.all([getAllPeople(), getProjectRows()]);

  return (
    <div>
      <h1 className='text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>People</h1>
      <p className='mt-1 text-sm text-muted-foreground'>
        Everyone with access to the portal. Homeowners only ever see their own build.
      </p>

      <div className='mt-8 grid gap-10 lg:grid-cols-[1fr_320px]'>
        <section>
          {people.length === 0 ? (
            <EmptyState title='Nobody yet' />
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[480px] border-collapse text-sm'>
                <thead>
                  <tr className='border-b border-hairline bg-surface-strong text-left'>
                    <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                      Name
                    </th>
                    <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                      Role
                    </th>
                    <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr
                      key={person.id}
                      className='border-b border-hairline-soft hover:bg-surface-soft'
                    >
                      <td className='px-3 py-2.5 font-medium text-ink'>
                        {person.full_name || <span className='text-muted-soft'>Invited</span>}
                      </td>
                      <td className='px-3 py-2.5 text-body capitalize'>{person.role}</td>
                      <td className='px-3 py-2.5 text-body'>
                        {formatDateShort(person.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className='text-base font-semibold text-ink'>Invite a homeowner</h2>
          <InviteForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
        </section>
      </div>
    </div>
  );
}
