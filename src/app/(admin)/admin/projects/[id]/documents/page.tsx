import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { ProjectTabs } from '@/features/admin/project-tabs';
import { UploadDocumentForm } from '@/features/admin/upload-document-form';
import { getProject, getProjectDocuments } from '@/features/admin/queries';
import { deleteDocument } from '@/features/admin/actions';
import { formatDateShort, formatFileSize } from '@/lib/format';

export const metadata: Metadata = { title: 'Documents' };

export default async function AdminDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, documents] = await Promise.all([getProject(id), getProjectDocuments(id)]);
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

      <ProjectTabs projectId={id} active='documents' />

      <div className='mt-8 grid gap-10 lg:grid-cols-[1fr_320px]'>
        <section>
          {documents.length === 0 ? (
            <EmptyState title='No documents yet'>
              Agreements, permits, drawings, and warranty paperwork all live here.
            </EmptyState>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[560px] border-collapse text-sm'>
                <thead>
                  <tr className='border-b border-hairline bg-surface-strong text-left'>
                    <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                      Title
                    </th>
                    <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                      Category
                    </th>
                    <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                      Visible
                    </th>
                    <th scope='col' className='px-3 py-2.5 font-semibold text-ink'>
                      Added
                    </th>
                    <th scope='col' className='px-3 py-2.5'>
                      <span className='sr-only'>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className='border-b border-hairline-soft hover:bg-surface-soft'
                    >
                      <td className='px-3 py-2.5'>
                        <span className='font-medium text-ink'>{doc.title}</span>
                        {doc.size_bytes && (
                          <span className='block text-[13px] text-muted-foreground'>
                            {formatFileSize(doc.size_bytes)}
                          </span>
                        )}
                      </td>
                      <td className='px-3 py-2.5 text-body capitalize'>{doc.category}</td>
                      <td className='px-3 py-2.5 text-body'>
                        {doc.visible_to_homeowner ? 'Yes' : 'Staff only'}
                      </td>
                      <td className='px-3 py-2.5 text-body'>{formatDateShort(doc.created_at)}</td>
                      <td className='px-3 py-2.5 text-right'>
                        <form action={deleteDocument}>
                          <input type='hidden' name='id' value={doc.id} />
                          <input type='hidden' name='project_id' value={id} />
                          <Button
                            type='submit'
                            size='sm'
                            variant='destructive'
                            aria-label={`Delete ${doc.title}`}
                          >
                            Delete
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className='text-base font-semibold text-ink'>Add a document</h2>
          <UploadDocumentForm projectId={id} />
        </section>
      </div>
    </div>
  );
}
