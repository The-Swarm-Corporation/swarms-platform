import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

type UseCase = {
  title: string;
  description: string;
};

interface PromptListItem {
  id: string;
  name: string;
  description: string;
  use_cases: UseCase[];
  tags: string;
  is_free: boolean;
  price: number; // SOL price (legacy)
  price_usd: number; // USD price (primary)
  category?: string;
  status: string;
  user_id: string;
  created_at: string;
}

interface PromptsResponse {
  data: PromptListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
  filters_applied: {
    name?: string;
    tag?: string;
    category?: string;
    price_range?: string;
    is_free?: boolean;
  };
}

const getAllPrompts = async (req: NextApiRequest, res: NextApiResponse) => {
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
      use_case_description,
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

    // Build query with marketplace fields
    let query = supabaseAdmin
      .from('swarms_cloud_prompts')
      .select(`
        id, name, description, use_cases, tags,
        is_free, price, price_usd, category, status,
        user_id, created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (name) {
      query = query.ilike('name', `%${name}%`);
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

    // Apply use case filtering (post-query due to JSON field complexity)
    if (use_case) {
      filteredData = filteredData.filter((prompt) =>
        (prompt?.use_cases as UseCase[])?.some((uc: any) =>
          uc.title.toLowerCase().includes((use_case as string).toLowerCase()),
        ),
      );
    }

    if (use_case_description) {
      filteredData = filteredData.filter((prompt) =>
        (prompt?.use_cases as UseCase[])?.some((uc: any) =>
          uc.description
            .toLowerCase()
            .includes((use_case_description as string).toLowerCase()),
        ),
      );
    }

    const response: PromptsResponse = {
      data: filteredData.map(prompt => ({
        id: prompt.id,
        name: prompt.name || '',
        description: prompt.description || '',
        use_cases: prompt.use_cases as UseCase[],
        tags: prompt.tags || '',
        is_free: prompt.is_free,
        price: prompt.price || 0,
        price_usd: prompt.price_usd || 0,
        category: prompt.category as string,
        status: prompt.status || 'pending',
        user_id: prompt.user_id,
        created_at: prompt.created_at,
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
        ...(category && { category: category as string }),
        ...(is_free && { is_free: is_free === 'true' }),
        ...((min_price || max_price) && {
          price_range: `${min_price || '0'}-${max_price || '∞'}`
        }),
      },
    };

    return res.status(200).json(response);
  } catch (e) {
    console.error('Error fetching prompts:', e);
    return res.status(500).json({ error: 'Could not fetch prompts' });
  }
};

export default getAllPrompts;
