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
    <div className="flex flex-col min-h-screen w-full bg-background">
      <APIkeyProvider isCreateAutoKey={true}>
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <TelemetryLayout>
            <PlatformTabs />
            {children}
          </TelemetryLayout>
        </main>
      </APIkeyProvider>
    </div>
  );
}
