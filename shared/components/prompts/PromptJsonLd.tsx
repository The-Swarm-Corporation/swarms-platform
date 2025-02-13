import Script from 'next/script';
import { Tables } from '@/types_db';
import { getUserById } from '@/shared/utils/api/user';

export default async function PromptJsonLd({
  prompt,
  userId,
}: {
  prompt: Tables<'swarms_cloud_prompts'>;
  userId: string;
}) {
  if (!prompt) {
    console.error('PromptJsonLd: No prompt data provided');
    return null;
  }

  const user = await getUserById(userId);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: prompt?.name,
    description: prompt?.description,
    datePublished: prompt?.created_at || new Date(),
    dateModified: prompt.created_at || new Date(),
    author: {
      '@type': 'Person',
      name: user?.full_name || user?.username || 'Swarms',
    },
    keywords: prompt.tags
      ? (prompt.tags as string).split(',').join(', ')
      : undefined,
  };

  return (
    <Script
      id="json-ld-prompt"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}
