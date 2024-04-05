import PanelLayout from '@/shared/components/panel-layout';
import '@/shared/styles/main.css';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { getURL } from '@/shared/utils/helpers';
import { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

const meta = {
  title: 'Swarms Platform',
  description: '',
  url: getURL(),
  favicon: '/favicon.svg'
};
export default async function Panel({
  children
}: {
  children: React.ReactNode;
}) {
  await checkUserSession();

  return <PanelLayout>{children}</PanelLayout>;
}
