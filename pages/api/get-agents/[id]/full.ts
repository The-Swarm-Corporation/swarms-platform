import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

interface FullAgentData {
  id: string;
  name: string;
  description: string;
  agent: string; // Full content included
  use_cases: any;
  tags: string;
  requirements?: string;
  language?: string;
  is_free: boolean;
  price: number;
  file_path?: string;
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

/**
 * Check if user has access to paid agent content
 */
async function checkAgentAccess(agentId: string, userId: string): Promise<boolean> {
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

/**
 * Authenticated endpoint - returns full agent content with access control
 * Requires authentication and proper access permissions
 */
const getFullAgent = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }

    // Require authentication for full content (API key or Supabase)
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

    // Fetch full agent data
    const { data: agent, error } = await supabaseAdmin
      .from('swarms_cloud_agents')
      .select(`
        id, name, description, agent, use_cases, tags, requirements, language,
        is_free, price, file_path, category, status,
        user_id, created_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Agent not found or not approved' });
      }
      throw error;
    }

    // Apply strict access control
    const isOwner = agent.user_id === authResult.userId;
    const isFree = agent.is_free;
    const hasPurchased = await checkAgentAccess(id, authResult.userId);
    const hasAccess = isFree || isOwner || hasPurchased;

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must purchase this agent to access full content',
        agent_info: {
          id: agent.id,
          name: agent.name,
          price: agent.price,
          is_free: agent.is_free,
        },
      });
    }

    const fullData: FullAgentData = {
      id: agent.id,
      name: agent.name || '',
      description: agent.description || '',
      agent: agent.agent || '',
      use_cases: agent.use_cases,
      tags: agent.tags || '',
      requirements: agent.requirements as string,
      language: agent.language || undefined,
      is_free: agent.is_free,
      price: agent.price || 0,
      file_path: agent.file_path || undefined,
      category: agent.category as string,
      status: agent.status || 'pending',
      user_id: agent.user_id || '',
      created_at: agent.created_at,
    };

    return res.status(200).json({
      ...fullData,
      access_granted: true,
      access_reason: isOwner ? 'author' : isFree ? 'free' : 'paid',
    });
  } catch (e) {
    console.error('Error fetching full agent:', e);
    return res.status(500).json({ error: 'Could not fetch full agent content' });
  }
};

export default getFullAgent;
