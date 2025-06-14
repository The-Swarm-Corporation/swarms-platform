'use client';

import React from 'react';
import Footer from '@/shared/components/ui/Footer';
import Navbar from '@/shared/components/ui/Navbar';
import '@/shared/styles/main.css';
import PanelLayoutSidebar from '@/shared/components/panel-layout/components/sidebar/sidebar';
import PlatformNavBar from '@/shared/components/panel-layout/components/navbar/navbar';
import { cn } from '@/shared/utils/cn';
import { useAuthContext } from '../ui/auth.provider';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  return (
    <>
      {user ? <PlatformNavBar /> : <Navbar />}
      <div
        className={cn(
          user
            ? 'mt-16 md:mt-20 flex flex-row w-screen h-screen min-h-screen max-md:flex-col'
            : '',
        )}
      >
        {user && <PanelLayoutSidebar />}
        <main
          className={cn(
            user
              ? 'relative container lg:max-w-7xl lg:px-12 h-full mx-auto max-lg:z-10'
              : 'min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]',
          )}
        >
          {children}
          {user && <Footer />}
        </main>
      </div>
      {!user && <Footer />}
    </>
  );
}
