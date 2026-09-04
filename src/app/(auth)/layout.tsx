import { Wordmark } from '@/components/wordmark';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16'>
      <div className='w-full max-w-[400px]'>
        <div className='mb-10 flex justify-center'>
          <Wordmark />
        </div>
        {children}
      </div>
    </main>
  );
}
