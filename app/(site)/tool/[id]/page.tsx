import { Metadata } from 'next';
import ToolModule from '@/modules/tool';
import { getToolMetadata } from '@/shared/utils/api/metadata';
import { getURL, optimizeToolKeywords } from '@/shared/utils/helpers';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const url = getURL();
  const resolvedParams = await params;
  const tool = await getToolMetadata(resolvedParams?.id);

  if (!tool) {
    return {
      title: 'Tool Not Found | Swarms Marketplace',
      description:
        'The requested tool could not be found on the Swarms Marketplace.',
    };
  }

  const seoData = optimizeToolKeywords(tool);

  const dynamicImage = tool?.image_url
    ? tool.image_url.startsWith('http')
      ? `${tool.image_url}?v=${tool.created_at || tool.id}`
      : `${url}${tool.image_url.replace(/^\/+/, '')}?v=${tool.created_at || tool.id}`
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
      url: `${url}tool/${tool?.id}`,
      type: 'article',
      siteName: 'Swarms Marketplace',
      images: [
        {
          url: dynamicImage,
          width: 1200,
          height: 630,
          alt: `${tool?.name} - AI Tool`,
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
          alt: `${tool?.name} - AI Tool`,
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
      canonical: `${url}tool/${tool?.id}`,
    },
  };
}

const Tool = async ({ params }: any) => {
  const resolvedParams = await params;
  return <ToolModule id={resolvedParams.id} />;
};

export default Tool;
