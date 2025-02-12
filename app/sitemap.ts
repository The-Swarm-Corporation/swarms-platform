import { TPrompt } from '@/shared/types/prompt';
import { getPrompts } from '@/shared/utils/api/prompt';
import { getURL } from '@/shared/utils/helpers';

export default async function sitemap() {
  const prompts = await getPrompts();
  const baseUrl = getURL();

  const promptUrls = prompts.map((prompt: TPrompt) => ({
    url: `${baseUrl}prompt/${prompt?.id}`,
    lastModified: prompt?.created_at,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...promptUrls,
  ];
}
