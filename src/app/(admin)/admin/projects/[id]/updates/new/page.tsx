import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProject, getProjectStages } from '@/features/admin/queries';
import { PostUpdateForm } from '@/features/admin/post-update-form';

export const metadata: Metadata = { title: 'Post an update' };

export default async function NewUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, stages] = await Promise.all([getProject(id), getProjectStages(id)]);
  if (!project) notFound();

  return (
    <div className='max-w-[560px]'>
      <Link
        href={`/admin/projects/${id}`}
        className='text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
      >
        &larr; {project.name}
      </Link>
      <h1 className='mt-3 text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
        Post an update
      </h1>
      <p className='mt-1 text-sm text-muted-foreground'>
        A few photos and a sentence is plenty. This is what the homeowners will see.
      </p>

      <PostUpdateForm projectId={id} stages={stages.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  );
}
