import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

type UseCase = {
  title: string;
  description: string;
};

type Requirement = {
  package: string;
  installation: string;
};

interface AgentListItem {
  id: string;
  name: string;
  description: string;
  use_cases: UseCase[];
  tags: string;
  requirements?: Requirement[];
  language?: string;
  is_free: boolean;
  price: number; // SOL price (legacy)
  price_usd: number; // USD price (primary)
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

interface AgentsResponse {
  data: AgentListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
  filters_applied: {
    name?: string;
    tag?: string;
    language?: string;
    category?: string;
    price_range?: string;
    is_free?: boolean;
  };
}

const getAllAgents = async (req: NextApiRequest, res: NextApiResponse) => {
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
      is_free,
      min_price,
      max_price,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20)); // Max 100 items
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('swarms_cloud_agents')
      .select(`
        id, name, description, use_cases, tags, requirements, language,
        is_free, price, price_usd, category, status,
        user_id, created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    if (language) {
      query = query.ilike('language', `%${language}%`);
    }

    if (tag) {
      const tagsArray = (tag as string).split(',').map((t) => t.trim());
      const tagsQuery = tagsArray.map((t) => `tags.ilike.%${t}%`).join(',');
      query = query.or(tagsQuery);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (is_free === 'true') {
      query = query.eq('is_free', true);
    } else if (is_free === 'false') {
      query = query.eq('is_free', false);
    }

    if (min_price) {
      const minPrice = parseFloat(min_price as string);
      if (!isNaN(minPrice)) {
        query = query.gte('price', minPrice);
      }
    }

    if (max_price) {
      const maxPrice = parseFloat(max_price as string);
      if (!isNaN(maxPrice)) {
        query = query.lte('price', maxPrice);
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;

    let filteredData = data || [];

    if (req_package) {
      filteredData = filteredData.filter((agent) =>
        (agent?.requirements as Requirement[])?.some((req: Requirement) =>
          req.package
            .toLowerCase()
            .includes((req_package as string).toLowerCase()),
        ),
      );
    }

    if (use_case) {
      filteredData = filteredData.filter((agent) =>
        (agent?.use_cases as UseCase[])?.some((uc: any) =>
          uc.title.toLowerCase().includes((use_case as string).toLowerCase()),
        ),
      );
    }

    const response: AgentsResponse = {
      data: filteredData.map(agent => ({
        id: agent.id,
        name: agent.name || '',
        description: agent.description || '',
        use_cases: agent.use_cases as UseCase[],
        tags: agent.tags || '',
        requirements: agent.requirements as Requirement[],
        language: agent.language || undefined,
        is_free: agent.is_free,
        price: agent.price || 0,
        price_usd: agent.price_usd || 0,
        category: agent.category as string,
        status: agent.status || 'pending',
        user_id: agent.user_id || '',
        created_at: agent.created_at,
      })),
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        has_more: (count || 0) > offset + limitNum,
      },
      filters_applied: {
        ...(name && { name: name as string }),
        ...(tag && { tag: tag as string }),
        ...(language && { language: language as string }),
        ...(category && { category: category as string }),
        ...(is_free && { is_free: is_free === 'true' }),
        ...((min_price || max_price) && {
          price_range: `${min_price || '0'}-${max_price || '∞'}`
        }),
      },
    };

    return res.status(200).json(response);
  } catch (e) {
    console.error('Error fetching agents:', e);
    return res.status(500).json({ error: 'Could not fetch agents' });
  }
};

export default getAllAgents;
