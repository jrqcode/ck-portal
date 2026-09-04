import { SignInForm } from '@/features/auth/sign-in-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next?.startsWith('/') && !next.startsWith('//') ? next : '/';

  return (
    <>
      <div className='mb-8 text-center'>
        <h1 className='text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
          Follow your build
        </h1>
        <p className='mt-2 text-base leading-relaxed text-body'>
          Sign in to see the latest progress on your home.
        </p>
      </div>

      <SignInForm next={target} />

      <p className='mt-10 text-center text-[13px] leading-[1.23] text-muted-foreground'>
        Accounts are set up by Caiden-Keller Homes. If you need access, get in touch with your
        project manager.
      </p>
    </>
  );
}
