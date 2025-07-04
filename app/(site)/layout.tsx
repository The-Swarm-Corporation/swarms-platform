import React from 'react';

import { Metadata, Viewport } from 'next';
import { PropsWithChildren } from 'react';
import { getURL } from '@/shared/utils/helpers';
import '@/shared/styles/main.css';
import SiteLayout from '@/shared/components/site-layout';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://swarms.world/';


const meta = {
  title: 'Swarms Platform - The Leading AI Agent & Prompt Marketplace',
  description: 'Discover, share, and monetize AI Agents, Prompts, and Tools on the Swarms Platform. Join the largest marketplace for AI solutions, collaborate with creators, and build the future of AI together.',
  cardImage: `${siteUrl}/og.png`,
  robots: 'index, follow',
  favicon: '/favicon.svg',
  url: getURL(),
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
  ].join(', '),
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    referrer: 'origin-when-cross-origin',
    authors: [{ name: 'Swarms Platform Team' }],
    creator: 'Swarms Platform',
    publisher: 'Swarms Platform',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    alternates: {
      canonical: meta.url,
    },
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [{
        url: meta.cardImage,
        width: 1200,
        height: 630,
        alt: 'Swarms Platform - AI Agent & Prompt Marketplace'
      }],
      type: 'website',
      siteName: meta.title,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      site: '@swarms_corp',
      creator: '@swarms_corp',
      images: [{
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Swarms Platform - AI Agent & Prompt Marketplace'
      }],
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-title': 'Swarms Platform',
      'format-detection': 'telephone=no',
    },
  };
}
export default function RootLayout({ children }: PropsWithChildren) {
  return <SiteLayout>{children}</SiteLayout>;
}
