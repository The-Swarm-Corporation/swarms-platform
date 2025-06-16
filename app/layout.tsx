import { Toaster } from '@/shared/components/ui/Toasts/toaster';
import { ThemeProvider } from '@/shared/components/ui/theme-provider';
import { helvetica } from '@/shared/styles/fonts';
import { TrpcProvider } from '@/shared/utils/trpc/trpc-provider';
import { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/shared/components/ui/auth.provider';
import { createClient } from '@/shared/utils/supabase/server';
import AuthModal from '@/shared/components/modal/auth';
import { CommandPaletteProvider } from '@/shared/components/command-palette/provider';
import { StarredAppsProvider } from '@/shared/components/starred-apps-context';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://swarms.world',
  ),
  title: {
    template: '%s | Swarms Platform',
    default: 'Swarms Platform - The Agent Marketplace',
  },
  description: 'Revolutionize your services with AI-driven swarms',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://swarms.world',
    siteName: 'Swarms Platform',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@swarms_corp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={helvetica.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider user={user}>
            <TrpcProvider>
              <CommandPaletteProvider>
                <AuthModal />
                <StarredAppsProvider>
                  {children}
                </StarredAppsProvider>
              </CommandPaletteProvider>
            </TrpcProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
