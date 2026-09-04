import type { Metadata } from 'next';
import Link from 'next/link';
import { NewProjectForm } from '@/features/admin/new-project-form';

export const metadata: Metadata = { title: 'New build' };

export default function NewProjectPage() {
  return (
    <div className='max-w-[560px]'>
      <Link
        href='/admin'
        className='text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
      >
        &larr; Builds
      </Link>
      <h1 className='mt-3 text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
        New build
      </h1>
      <p className='mt-1 text-sm text-muted-foreground'>
        The standard build stages are added automatically — you can mark them off as you go.
      </p>
      <NewProjectForm />
    </div>
  );
}
