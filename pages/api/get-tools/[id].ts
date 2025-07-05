import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

interface ToolData {
  id: string;
  name: string;
  description: string;
  tool?: string;
  use_cases: any;
  tags: string;
  requirements?: string;
  language?: string;
  is_free: boolean;
  file_path?: string;
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

const getToolById = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid tool ID' });
    }

    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.optionalAuthenticate();
    const userId = authResult.userId;

    const { data: tool, error } = await supabaseAdmin
      .from('swarms_cloud_tools')
      .select(`
        id, name, description, tool, use_cases, tags, requirements, language,
        is_free, file_path, category, status,
        user_id, created_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tool not found' });
      }
      throw error;
    }

    const isOwner = userId && tool.user_id === userId;
    const isFree = tool.is_free;
    const hasAccess = isFree || isOwner;

    const responseData: ToolData = {
      id: tool.id,
      name: tool.name || '',
      description: tool.description || '',
      use_cases: tool.use_cases,
      tags: tool.tags || '',
      requirements: tool.requirements as string,
      language: tool.language || undefined,
      is_free: tool.is_free,
      file_path: tool.file_path || undefined,
      category: tool.category as string,
      status: tool.status || 'pending',
      user_id: tool.user_id || '',
      created_at: tool.created_at,
    };

    if (hasAccess) {
      responseData.tool = tool.tool || '';
    }

    const response = {
      ...responseData,
      access_info: {
        has_access: hasAccess,
        is_owner: isOwner,
        is_free: isFree,
        requires_purchase: false,
      },
    };

    return res.status(200).json(response);
  } catch (e) {
    console.error('Error fetching tool:', e);
    return res.status(500).json({ error: 'Could not fetch tool' });
  }
};

export default getToolById;
