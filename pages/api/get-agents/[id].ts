import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

interface AgentData {
  id: string;
  name: string;
  description: string;
  agent?: string;
  use_cases: any;
  tags: string;
  requirements?: string;
  language?: string;
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

async function checkAgentAccess(agentId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  const { data: purchase } = await supabaseAdmin
    .from('marketplace_transactions')
    .select('id')
    .eq('buyer_id', userId)
    .eq('item_id', agentId)
    .eq('item_type', 'agent')
    .eq('status', 'completed')
    .single();

  return !!purchase;
}

const getAgentById = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }

    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.optionalAuthenticate();
    const userId = authResult.userId;

    const { data: agent, error } = await supabaseAdmin
      .from('swarms_cloud_agents')
      .select(`
        id, name, description, agent, use_cases, tags, requirements, language,
        is_free, price, price_usd, image_url, file_path, category, status,
        user_id, created_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Agent not found' });
      }
      throw error;
    }

    const isOwner = userId && agent.user_id === userId;
    const isFree = agent.is_free;
    const hasPurchased = userId ? await checkAgentAccess(id, userId) : false;
    const hasAccess = isFree || isOwner || hasPurchased;

    if (!isFree && !userId) {
      const publicData: AgentData = {
        id: agent.id,
        name: agent.name || '',
        description: agent.description || '',
        use_cases: agent.use_cases,
        tags: agent.tags || '',
        requirements: agent.requirements as string,
        language: agent.language || undefined,
        is_free: agent.is_free,
        price: agent.price || 0,
        price_usd: agent.price_usd || 0,
        image_url: agent.image_url || undefined,
        file_path: agent.file_path || undefined,
        category: agent.category as string,
        status: agent.status || 'pending',
        user_id: agent.user_id || '',
        created_at: agent.created_at,
        // No agent content for paid items without auth
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

    const responseData: AgentData = {
      id: agent.id,
      name: agent.name || '',
      description: agent.description || '',
      use_cases: agent.use_cases,
      tags: agent.tags || '',
      requirements: agent.requirements as string,
      language: agent.language || undefined,
      is_free: agent.is_free,
      price: agent.price || 0,
      price_usd: agent.price_usd || 0,
      image_url: agent.image_url || undefined,
      file_path: agent.file_path || undefined,
      category: agent.category as string,
      status: agent.status || 'pending',
      user_id: agent.user_id || '',
      created_at: agent.created_at,
    };

    if (hasAccess) {
      responseData.agent = agent.agent || '';
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
    console.error('Error fetching agent:', e);
    return res.status(500).json({ error: 'Could not fetch agent' });
  }
};

export default getAgentById;
