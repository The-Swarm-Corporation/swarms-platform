import PanelLayout from '@/shared/components/panel-layout';
import '@/shared/styles/main.css';
import { getURL } from '@/shared/utils/helpers';
import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#181a21' },
  ],
};

const meta = {
  title: {
    template: '%s | Swarms Platform',
    default: 'Swarms Platform',
  },
  description: '',
  url: getURL(),
  favicon: '/favicon.svg',
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...meta,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
  };
}

export default async function Panel({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelLayout>{children}</PanelLayout>;
}
