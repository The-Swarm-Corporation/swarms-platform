import { Metadata } from 'next';
import AccessModule from '@/modules/access';
import { resolveAccessToken } from '@/shared/utils/access-tokens';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { type } = resolvedParams;

  return {
    title: `Access ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    description: `Secure access to premium ${type} content`,
    robots: 'noindex, nofollow',
  };
}

const AccessPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const { type, id: accessToken } = resolvedParams;

  if (!['prompt', 'agent'].includes(type)) {
    throw new Error('Invalid content type');
  }

  const tokenData = resolveAccessToken(accessToken);

  if (!tokenData) {
    redirect('/');
  }

  if (tokenData.itemType !== type) {
    redirect('/');
  }

  return (
    <AccessModule
      type={type as 'prompt' | 'agent'}
      id={tokenData.itemId}
      accessToken={accessToken}
    />
  );
};

export default AccessPage;
