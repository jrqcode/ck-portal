import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import QueryProvider from '@/components/layout/query-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Caiden-Keller Homes',
    template: '%s · Caiden-Keller Homes'
  },
  description: 'Follow the progress of your new home.',
  // A private client portal has no business being indexed.
  robots: { index: false, follow: false }
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The font variable must live on <html>, not <body>: --font-sans is computed
    // at :root, so if --font-inter is only defined lower down the whole value
    // resolves invalid and type silently falls back to the system stack.
    <html lang='en-CA' className={fontVariables} suppressHydrationWarning>
      <body className='bg-background text-foreground font-sans antialiased'>
        <NextTopLoader color='#d92227' showSpinner={false} />
        <NuqsAdapter>
          <QueryProvider>{children}</QueryProvider>
        </NuqsAdapter>
        <Toaster position='top-center' />
      </body>
    </html>
  );
}
