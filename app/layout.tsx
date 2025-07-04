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
    default: 'Swarms Platform - The Leading AI Agent & Prompt Marketplace',
  },
  description: 'Discover, share, and monetize AI Agents, Prompts, and Tools on the Swarms Platform. Join the largest marketplace for AI solutions, collaborate with creators, and build the future of AI together.',
  keywords: [
    'AI agents',
    'AI marketplace',
    'prompt engineering',
    'AI tools',
    'machine learning',
    'artificial intelligence',
    'swarms platform',
    'AI development',
    'AI solutions',
    'prompt marketplace',
    'agent marketplace',
  ],
  authors: [{ name: 'Swarms Platform Team' }],
  creator: 'Swarms Platform',
  publisher: 'Swarms Platform',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://swarms.world',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://swarms.world',
    siteName: 'Swarms Platform',
    title: 'Swarms Platform - The Leading AI Agent & Prompt Marketplace',
    description: 'Discover, share, and monetize AI Agents, Prompts, and Tools on the Swarms Platform. Join the largest marketplace for AI solutions, collaborate with creators, and build the future of AI together.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Swarms Platform - AI Agent & Prompt Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@swarms_corp',
    creator: '@swarms_corp',
    title: 'Swarms Platform - The Leading AI Agent & Prompt Marketplace',
    description: 'Discover, share, and monetize AI Agents, Prompts, and Tools. Join the largest marketplace for AI solutions.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Swarms Platform - AI Agent & Prompt Marketplace',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Technology',
  classification: 'AI Marketplace',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'Swarms Platform',
    'format-detection': 'telephone=no',
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
