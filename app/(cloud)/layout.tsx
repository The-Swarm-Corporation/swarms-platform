import type React from 'react';
import '@/shared/styles/main.css';
import { Header } from '@/shared/components/telemetry/header';
import { PlatformTabs } from '@/shared/components/telemetry/platform-tabs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <PlatformTabs />
        {children}
      </main>
    </div>
  );
}
