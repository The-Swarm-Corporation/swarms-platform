import { Toaster } from '@/shared/components/ui/Toasts/toaster';
import { ThemeProvider } from '@/shared/components/ui/theme-provider';
import { helvetica } from '@/shared/styles/fonts';
import { TrpcProvider } from '@/shared/utils/trpc/trpc-provider';
import { Analytics } from '@vercel/analytics/react';
import { Viewport } from 'next';
import { Suspense } from 'react';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={helvetica.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TrpcProvider>{children}</TrpcProvider>
        </ThemeProvider>
        <Suspense>
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
