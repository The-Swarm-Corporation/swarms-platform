import { getURL } from '@/shared/utils/helpers';
import { Database } from '@/types_db';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function fetchPrompts() {
  const { data, error } = await supabase
    .from('swarms_cloud_prompts')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
  return data || [];
}

export default async function sitemap() {
  const baseUrl = getURL();
  const prompts = await fetchPrompts();

  const promptUrls = prompts.map((prompt) => ({
    url: `${baseUrl}prompt/${prompt.id}`,
    lastModified: prompt.created_at || new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...promptUrls,
  ];
}
