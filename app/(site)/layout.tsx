import Footer from '@/shared/components/ui/Footer';
import Navbar from '@/shared/components/ui/Navbar';
import '@/shared/styles/main.css';
import { getURL } from '@/shared/utils/helpers';
import { Metadata, Viewport } from 'next';
import { PropsWithChildren } from 'react';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

const meta = {
  title: 'Swarms',
  description: '',
  cardImage: '/og.png',
  robots: 'follow, index',
  favicon: '/favicon.svg',
  url: getURL(),
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    // keywords: ['Vercel', 'Supabase', 'Next.js', 'Stripe', 'Subscription'],
    // authors: [{ name: 'Vercel', url: 'https://vercel.com/' }],
    // creator: 'Vercel',
    // publisher: 'Vercel',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: 'website',
      siteName: meta.title,
    },
    twitter: {
      card: 'summary_large_image',
      // site: '@Vercel',
      // creator: '@Vercel',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
    },
  };
}
export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)] bg-dot-bg dark:bg-dot-bg-dark">
        {children}
      </main>
      <Footer />
    </>
  );
}
