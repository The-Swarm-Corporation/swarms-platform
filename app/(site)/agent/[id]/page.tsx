import { Metadata } from 'next';
import AgentModule from '@/modules/agent';
import { getURL, optimizeAgentKeywords } from '@/shared/utils/helpers';
import { trpcApi } from '@/shared/utils/trpc/trpc';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const url = getURL();
  const resolvedParams = await params;
  const agent = await trpcApi.explorer.getAgentById.query(resolvedParams?.id);
  const seoData = optimizeAgentKeywords(agent);

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: `${url}agent/${agent?.id}`,
      images: [
        {
          url: agent?.image_url || '/og.png',
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: [agent?.image_url || '/og.png'],
    },
    alternates: {
      canonical: `${url}agent/${agent?.id}`,
    },
  };
}

const Agent = async ({ params }: { params: any }) => {
  const resolvedParams = await params;
  return <AgentModule id={resolvedParams?.id} />;
};

export default Agent;
