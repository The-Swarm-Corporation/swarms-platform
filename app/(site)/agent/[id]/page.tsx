import { Metadata } from 'next';
import AgentModule from '@/modules/agent';
import { getAgentMetadata } from '@/shared/utils/api/metadata';
import { getURL, optimizeAgentKeywords } from '@/shared/utils/helpers';

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
  const agent = await getAgentMetadata(resolvedParams?.id);

  if (!agent) {
    return {
      title: 'Agent Not Found | Swarms Marketplace',
      description:
        'The requested agent could not be found on the Swarms Marketplace.',
    };
  }

  const seoData = optimizeAgentKeywords(agent);

  const dynamicImage = agent?.image_url
    ? agent.image_url.startsWith('http')
      ? `${agent.image_url}?v=${agent.created_at || agent.id}`
      : `${url}${agent.image_url.replace(/^\/+/, '')}?v=${agent.created_at || agent.id}`
    : `${url}og.png?v=2`;

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    authors: [{ name: 'Swarms Team' }],
    creator: 'Swarms',
    publisher: 'Swarms',
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: `${url}agent/${agent?.id}`,
      type: 'article',
      siteName: 'Swarms Marketplace',
      images: [
        {
          url: dynamicImage,
          width: 1200,
          height: 630,
          alt: `${agent?.name} - AI Agent`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@swarms_corp',
      creator: '@swarms_corp',
      title: seoData.title,
      description: seoData.description,
      images: [
        {
          url: dynamicImage,
          width: 1200,
          height: 630,
          alt: `${agent?.name} - AI Agent`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${url}agent/${agent?.id}`,
    },
  };
}

const Agent = async ({ params }: any) => {
  const resolvedParams = await params;
  return <AgentModule id={resolvedParams?.id} />;
};

export default Agent;
