import PromptModule from '@/modules/prompt';
import { getPrompt } from '@/shared/utils/api/prompt';
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
  const prompt = await getPrompt(resolvedParams?.id);
  const seoData = optimizePromptKeywords(prompt);

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: `${url}prompt/${prompt?.id}`,
      images: [
        {
          url: prompt?.image_url || '/og.png',
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: [prompt?.image_url || '/og.png'],
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
