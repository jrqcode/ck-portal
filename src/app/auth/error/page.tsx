import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Wordmark } from '@/components/wordmark';

export default function AuthErrorPage() {
  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16'>
      <div className='w-full max-w-[400px] text-center'>
        <div className='mb-10 flex justify-center'>
          <Wordmark />
        </div>
        <h1 className='text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
          That link has expired
        </h1>
        <p className='mt-3 text-base leading-relaxed text-body'>
          Sign-in links work once and last about an hour. Ask for a new one and you&rsquo;ll be
          straight back in.
        </p>
        <Link href='/sign-in' className={buttonVariants({ size: 'cta', className: 'mt-8 w-full' })}>
          Get a new link
        </Link>
      </div>
    </main>
  );
}
