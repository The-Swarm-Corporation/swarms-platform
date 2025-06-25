import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';

interface AgentPreview {
  id: string;
  name: string;
  description: string;
  use_cases: any;
  tags: string;
  requirements?: string;
  language?: string;
  is_free: boolean;
  price: number;
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

const getAgentPreview = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }

    const { data: agent, error } = await supabaseAdmin
      .from('swarms_cloud_agents')
      .select(`
        id, name, description, use_cases, tags, requirements, language,
        is_free, price, category, status,
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

    const previewData: AgentPreview = {
      id: agent.id,
      name: agent.name || '',
      description: agent.description || '',
      use_cases: agent.use_cases,
      tags: agent.tags || '',
      requirements: agent.requirements as string,
      language: agent.language || undefined,
      is_free: agent.is_free,
      price: agent.price || 0,
      category: agent.category as string,
      status: agent.status || 'pending',
      user_id: agent.user_id || '',
      created_at: agent.created_at,
    };

    return res.status(200).json({
      ...previewData,
      preview: true,
      message: agent.is_free ? 'Full content available' : 'Purchase required for full content',
    });
  } catch (e) {
    console.error('Error fetching agent preview:', e);
    return res.status(500).json({ error: 'Could not fetch agent preview' });
  }
};

export default getAgentPreview;
