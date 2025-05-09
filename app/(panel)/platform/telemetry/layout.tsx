import type React from 'react';
import '@/shared/styles/main.css';
import { PlatformTabs } from '@/shared/components/telemetry/platform-tabs';
import { APIkeyProvider } from '@/shared/components/ui/apikey.provider';
import TelemetryLayout from '@/shared/components/telemetry-layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <APIkeyProvider>
        <main className="flex-1 container mx-auto px-4 pb-6">
          <TelemetryLayout>
            <PlatformTabs />
            {children}
          </TelemetryLayout>
        </main>
      </APIkeyProvider>
    </div>
  );
}
