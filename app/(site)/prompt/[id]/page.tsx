import PromptModule from '@/modules/prompt';
import { getPrompt } from '@/shared/utils/api/prompt';
import { getURL, optimizePromptKeywords } from '@/shared/utils/helpers';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
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
      url: `${url}${prompt?.id}`,
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `${url}${prompt?.id}`,
    },
  };
}

const Prompt = async ({ params }: { params: any }) => {
  const resolvedParams = await params;
  return <PromptModule id={resolvedParams.id} />;
};

export default Prompt;
