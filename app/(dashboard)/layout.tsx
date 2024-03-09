import PanelLayout from '@/shared/components/panel-layout';
import { Toaster } from '@/shared/components/ui/Toasts/toaster';
import '@/shared/styles/main.css';
import { getURL } from '@/shared/utils/helpers';
import { Suspense } from 'react';

const meta = {
  title: 'Swarms',
  description: '',
  url: getURL()
};
export default function Panel({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black loading">
        <main
          id="skip"
          className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
        >
          <PanelLayout>{children}</PanelLayout>
        </main>
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
