import React from 'react';

import { Metadata, Viewport } from 'next';
import Footer from '@/shared/components/ui/Footer';
import Navbar from '@/shared/components/ui/Navbar';
import { PropsWithChildren, use } from 'react';
import { getURL } from '@/shared/utils/helpers';
import '@/shared/styles/main.css';
import PanelLayoutSidebar from '@/shared/components/panel-layout/components/sidebar/sidebar';
import { createClient } from '@/shared/utils/supabase/server';
import PlatformNavBar from '@/shared/components/panel-layout/components/navbar/navbar';
import { cn } from '@/shared/utils/cn';

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      {user ? <PlatformNavBar user={user} /> : <Navbar user={user} />}
      <div
        className={cn(
          user
            ? 'mt-16 md:mt-20 flex flex-row w-screen h-screen min-h-screen max-md:flex-col'
            : '',
        )}
      >
        {user && <PanelLayoutSidebar user={user} />}
        <main
          className={cn(
            user
              ? 'relative container lg:max-w-7xl lg:px-12 h-full mx-auto max-lg:z-10'
              : 'min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]',
          )}
        >
          {children}
          {user && (
            <div className="absolute lg:w-[93%] xl:w-[95%]">
              <Footer />
            </div>
          )}
        </main>
      </div>
      {!user && <Footer />}
    </>
  );
}
