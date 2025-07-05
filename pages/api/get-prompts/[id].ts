import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

interface PromptData {
  id: string;
  name: string;
  description: string;
  prompt?: string;
  use_cases: any;
  tags: string;
  is_free: boolean;
  price: number; // SOL price (legacy)
  price_usd: number; // USD price (primary)
  image_url?: string;
  file_path?: string;
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

async function checkPromptAccess(promptId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  const { data: purchase } = await supabaseAdmin
    .from('marketplace_transactions')
    .select('id')
    .eq('buyer_id', userId)
    .eq('item_id', promptId)
    .eq('item_type', 'prompt')
    .eq('status', 'completed')
    .single();

  return !!purchase;
}

const getPromptById = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt ID' });
    }

    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.optionalAuthenticate();
    const userId = authResult.userId;

    const { data: prompt, error } = await supabaseAdmin
      .from('swarms_cloud_prompts')
      .select(`
        id, name, description, prompt, use_cases, tags,
        is_free, price, price_usd, image_url, file_path, category, status,
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

    const isOwner = userId && prompt.user_id === userId;
    const isFree = prompt.is_free;
    const hasPurchased = userId ? await checkPromptAccess(id, userId) : false;
    const hasAccess = isFree || isOwner || hasPurchased;

    if (!isFree && !userId) {
      const publicData: PromptData = {
        id: prompt.id,
        name: prompt.name || '',
        description: prompt.description || '',
        use_cases: prompt.use_cases,
        tags: prompt.tags || '',
        is_free: prompt.is_free,
        price: prompt.price || 0,
        price_usd: prompt.price_usd || 0,
        image_url: prompt.image_url || undefined,
        file_path: prompt.file_path || undefined,
        category: prompt.category as string,
        status: prompt.status || 'pending',
        user_id: prompt.user_id || '',
        created_at: prompt.created_at,
        // No prompt content for paid items without auth
      };

      return res.status(200).json({
        ...publicData,
        access_info: {
          has_access: false,
          is_owner: false,
          is_free: false,
          requires_purchase: true,
        },
      });
    }

    const responseData: PromptData = {
      id: prompt.id,
      name: prompt.name || '',
      description: prompt.description || '',
      use_cases: prompt.use_cases,
      tags: prompt.tags || '',
      is_free: prompt.is_free,
      price: prompt.price || 0,
      price_usd: prompt.price_usd || 0,
      image_url: prompt.image_url || undefined,
      file_path: prompt.file_path || undefined,
      category: prompt.category as string,
      status: prompt.status || 'pending',
      user_id: prompt.user_id || '',
      created_at: prompt.created_at,
    };

    if (hasAccess) {
      responseData.prompt = prompt.prompt || '';
    }

    const response = {
      ...responseData,
      access_info: {
        has_access: hasAccess,
        is_owner: isOwner,
        is_free: isFree,
        has_purchased: hasPurchased,
        requires_purchase: !isFree && !isOwner && !hasPurchased,
      },
    };

    return res.status(200).json(response);
  } catch (e) {
    console.error('Error fetching prompt:', e);
    return res.status(500).json({ error: 'Could not fetch prompt' });
  }
};

export default getPromptById;
