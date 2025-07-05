import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

interface ToolListItem {
  id: string;
  name: string;
  description: string;
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

interface ToolsResponse {
  tools: ToolListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

const getTools = async (req: NextApiRequest, res: NextApiResponse<ToolsResponse | { error: string }>) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const authGuard = new HybridAuthGuard(req);
    await authGuard.optionalAuthenticate();

    const {
      name,
      tag,
      use_case,
      req_package,
      language,
      category,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20)); // Max 100 items
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('swarms_cloud_tools')
      .select(`
        id, name, description, use_cases, tags, requirements, language,
        is_free, file_path, category, status,
        user_id, created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    if (tag) {
      query = query.ilike('tags', `%${tag}%`);
    }

    if (use_case) {
      query = query.contains('use_cases', [{ title: use_case }]);
    }

    if (req_package) {
      query = query.contains('requirements', [{ package: req_package }]);
    }

    if (language) {
      query = query.eq('language', Array.isArray(language) ? language[0] : language);
    }

    if (category) {
      query = query.contains('category', [category]);
    }

    const { data: tools, error, count } = await query;

    if (error) {
      throw error;
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    const response: ToolsResponse = {
      tools: (tools || []).map(tool => ({
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
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
      },
    };

    return res.status(200).json(response);
  } catch (e) {
    console.error('Error fetching tools:', e);
    return res.status(500).json({ error: 'Could not fetch tools' });
  }
};

export default getTools;
