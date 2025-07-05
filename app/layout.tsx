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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://swarms.world/';
const url = `${siteUrl}/`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Swarms Marketplace',
    default: 'The Swarms Marketplace - The Leading Agent Marketplace',
  },
  description:
    'Share, discover, and monetize autonomous agents, custom prompts, and specialized tools on the Swarms Marketplace.',
  keywords: [
    'AI agents',
    'autonomous agents',
    'agent marketplace',
    'prompt engineering',
    'AI tools',
    'machine learning',
    'artificial intelligence',
    'swarms marketplace',
    'AI development',
    'AI solutions',
    'prompt marketplace',
    'custom prompts',
  ],
  authors: [{ name: 'Swarms Team' }],
  creator: 'Swarms',
  publisher: 'Swarms',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Swarms Marketplace',
    title: 'The Swarms Marketplace - The Leading Agent Marketplace',
    description:
      'Share, discover, and monetize autonomous agents, custom prompts, and specialized tools on the Swarms Marketplace.',
    images: [
      {
        url: `${url}og.png?v=2`,
        width: 1200,
        height: 630,
        alt: 'Swarms Marketplace - The Leading Agent Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@swarms_corp',
    creator: '@swarms_corp',
    title: 'The Swarms Marketplace - The Leading Agent Marketplace',
    description:
      'Share, discover, and monetize autonomous agents, custom prompts, and specialized tools on the Swarms Marketplace.',
    images: [
      {
        url: `${url}og.png?v=2`,
        width: 1200,
        height: 630,
        alt: 'Swarms Marketplace - The Leading Agent Marketplace',
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
  classification: 'Agent Marketplace',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'Swarms Marketplace',
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
                <StarredAppsProvider>{children}</StarredAppsProvider>
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
