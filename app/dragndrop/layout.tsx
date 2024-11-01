import { Metadata, Viewport } from 'next';
import { PropsWithChildren } from 'react';
import { getURL } from '@/shared/utils/helpers';
import '@/shared/styles/main.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

const meta = {
  title: 'Swarms Drag n Drop',
  description: 'Visual swarm management with drag and drop interface',
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
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
    },
  };
}
export default async function RootLayout({ children }: PropsWithChildren) {
  return <main>{children}</main>;
}
