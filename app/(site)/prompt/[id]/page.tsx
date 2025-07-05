import PromptModule from '@/modules/prompt';
import { getPromptMetadata } from '@/shared/utils/api/metadata';
import { getURL, optimizePromptKeywords } from '@/shared/utils/helpers';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const url = getURL();
  const resolvedParams = await params;
  const prompt = await getPromptMetadata(resolvedParams?.id);

  if (!prompt) {
    return {
      title: 'Prompt Not Found | Swarms Marketplace',
      description:
        'The requested prompt could not be found on the Swarms Marketplace.',
    };
  }

  const seoData = optimizePromptKeywords(prompt);

  const dynamicImage = prompt?.image_url
    ? prompt.image_url.startsWith('http')
      ? `${prompt.image_url}?v=${prompt.created_at || prompt.id}`
      : `${url}${prompt.image_url.replace(/^\/+/, '')}?v=${prompt.created_at || prompt.id}`
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
      url: `${url}prompt/${prompt?.id}`,
      type: 'article',
      siteName: 'Swarms Marketplace',
      images: [
        {
          url: dynamicImage,
          width: 1200,
          height: 630,
          alt: `${prompt?.name} - AI Prompt`,
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
          alt: `${prompt?.name} - AI Prompt`,
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
      canonical: `${url}prompt/${prompt?.id}`,
    },
  };
}

const Prompt = async ({ params }: { params: any }) => {
  const resolvedParams = await params;
  return <PromptModule id={resolvedParams.id} />;
};

export default Prompt;
