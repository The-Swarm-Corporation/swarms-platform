import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';

interface PromptPreview {
  id: string;
  name: string;
  description: string;
  use_cases: any;
  tags: string;
  is_free: boolean;
  price: number; // SOL price (legacy)
  price_usd: number; // USD price (primary)
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

const getPromptPreview = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt ID' });
    }

    const { data: prompt, error } = await supabaseAdmin
      .from('swarms_cloud_prompts')
      .select(`
        id, name, description, use_cases, tags,
        is_free, price, price_usd, category, status,
        user_id, created_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      throw error;
    }

    const previewData: PromptPreview = {
      id: prompt.id,
      name: prompt.name || '',
      description: prompt.description || '',
      use_cases: prompt.use_cases,
      tags: prompt.tags || '',
      is_free: prompt.is_free,
      price: prompt.price || 0,
      price_usd: prompt.price_usd || 0,
      category: prompt.category as string,
      status: prompt.status || 'pending',
      user_id: prompt.user_id || '',
      created_at: prompt.created_at,
    };

    return res.status(200).json({
      ...previewData,
      preview: true,
      message: prompt.is_free ? 'Full content available' : 'Purchase required for full content',
    });
  } catch (e) {
    console.error('Error fetching prompt preview:', e);
    return res.status(500).json({ error: 'Could not fetch prompt preview' });
  }
};

export default getPromptPreview;
