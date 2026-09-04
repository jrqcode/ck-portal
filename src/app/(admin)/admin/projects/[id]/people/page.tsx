import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { ProjectTabs } from '@/features/admin/project-tabs';
import { InviteForm } from '@/features/admin/invite-form';
import { getProject, getProjectPeople } from '@/features/admin/queries';
import { removeMember } from '@/features/admin/actions';

export const metadata: Metadata = { title: 'People' };

export default async function AdminPeoplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, people] = await Promise.all([getProject(id), getProjectPeople(id)]);
  if (!project) notFound();

  return (
    <div>
      <Link
        href='/admin'
        className='text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
      >
        &larr; Builds
      </Link>
      <h1 className='mt-3 text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
        {project.name}
      </h1>

      <ProjectTabs projectId={id} active='people' />

      <div className='mt-8 grid gap-10 lg:grid-cols-[1fr_320px]'>
        <section>
          <h2 className='text-base font-semibold text-ink'>Homeowners</h2>
          {people.length === 0 ? (
            <EmptyState title='Nobody invited yet' className='mt-4'>
              Invite the homeowners and they&rsquo;ll get an email with a link to sign in. Add both
              partners separately — each gets their own login.
            </EmptyState>
          ) : (
            <ul className='mt-4 divide-y divide-hairline-soft border-t border-hairline'>
              {people.map((person) => (
                <li key={person.id} className='flex items-center justify-between gap-4 py-3'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-ink'>
                      {person.full_name || 'Invited'}
                    </p>
                    <p className='text-[13px] text-muted-foreground capitalize'>{person.role}</p>
                  </div>
                  <form action={removeMember}>
                    <input type='hidden' name='project_id' value={id} />
                    <input type='hidden' name='user_id' value={person.id} />
                    <Button
                      type='submit'
                      size='sm'
                      variant='destructive'
                      aria-label={`Remove ${person.full_name || 'this person'} from the build`}
                    >
                      Remove
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className='text-base font-semibold text-ink'>Invite a homeowner</h2>
          <InviteForm projectId={id} />
        </section>
      </div>
    </div>
  );
}
