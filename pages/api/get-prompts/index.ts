import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';

type UseCase = {
  title: string;
  description: string;
};

const getAllPrompts = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { name, tag, use_case, use_case_description } = req.query;

    let query = supabaseAdmin
      .from('swarms_cloud_prompts')
      .select('id, name, description, prompt, use_cases, tags')
      .order('created_at', { ascending: false });

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    if (tag) {
      const tagsArray = (tag as string).split(',').map((t) => t.trim());
      const tagsQuery = tagsArray.map((t) => `tags.ilike.%${t}%`).join(',');
      query = query.or(tagsQuery);
    }

    const { data, error } = await query;

    if (error) throw error;

    let filteredData = data;

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

    return res.status(200).json(filteredData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not fetch prompts' });
  }
};

export default getAllPrompts;
