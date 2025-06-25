import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

interface FullPromptData {
  id: string;
  name: string;
  description: string;
  prompt: string;
  use_cases: any;
  tags: string;
  is_free: boolean;
  price: number;
  file_path?: string;
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

async function checkPromptAccess(promptId: string, userId: string): Promise<boolean> {
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

const getFullPrompt = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const authResult = await authGuard.authenticate();

    if (!authResult.isAuthenticated || !authResult.userId) {
      return res.status(authResult.status).json({
        error: 'Authentication required for full content access',
        message: authResult.message,
        hint: 'Provide API key in Authorization header or use /preview endpoint for public data',
        auth_methods: ['API Key (Bearer token)', 'Supabase session']
      });
    }

    const { data: prompt, error } = await supabaseAdmin
      .from('swarms_cloud_prompts')
      .select(`
        id, name, description, prompt, use_cases, tags,
        is_free, price, file_path, category, status,
        user_id, created_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Prompt not found or not approved' });
      }
      throw error;
    }

    const isOwner = prompt.user_id === authResult.userId;
    const isFree = prompt.is_free;
    const hasPurchased = await checkPromptAccess(id, authResult.userId);
    const hasAccess = isFree || isOwner || hasPurchased;

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must purchase this prompt to access full content',
        prompt_info: {
          id: prompt.id,
          name: prompt.name,
          price: prompt.price,
          is_free: prompt.is_free,
        },
      });
    }

    const fullData: FullPromptData = {
      id: prompt.id,
      name: prompt.name || '',
      description: prompt.description || '',
      prompt: prompt.prompt || '',
      use_cases: prompt.use_cases,
      tags: prompt.tags || '',
      is_free: prompt.is_free,
      price: prompt.price || 0,
      file_path: prompt.file_path || undefined,
      category: prompt.category as string,
      status: prompt.status || 'pending',
      user_id: prompt.user_id || '',
      created_at: prompt.created_at,
    };

    return res.status(200).json({
      ...fullData,
      access_granted: true,
      access_reason: isOwner ? 'author' : isFree ? 'free' : 'paid',
    });
  } catch (e) {
    console.error('Error fetching full prompt:', e);
    return res.status(500).json({ error: 'Could not fetch full prompt content' });
  }
};

export default getFullPrompt;
