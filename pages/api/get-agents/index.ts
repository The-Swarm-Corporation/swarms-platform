import { AuthApiGuard } from '@/shared/utils/api/auth-guard';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';

type UseCase = {
  title: string;
  description: string;
};

type Requirement = {
  package: string;
  installation: string;
};

const getAllAgents = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const apiKey = req.headers.authorization?.split(' ')[1];
    if (!apiKey) {
      return res.status(401).json({
        error: 'API Key is missing, go to link to create one',
        link: 'https://swarms.world/platform/api-keys',
      });
    }

    const guard = new AuthApiGuard({ apiKey });
    const isAuthenticated = await guard.isAuthenticated();
    if (isAuthenticated.status !== 200) {
      return res
        .status(isAuthenticated.status)
        .json({ error: isAuthenticated.message });
    }

    const user_id = guard.getUserId();
    if (!user_id) {
      return res.status(404).json({ error: 'User is missing' });
    }

    const { name, tag, use_case, req_package, language } = req.query;

    let query = supabaseAdmin
      .from('swarms_cloud_agents')
      .select(
        'id, name, description, agent, use_cases, tags, requirements, language',
      )
      .order('created_at', { ascending: false });

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

    const { data, error } = await query;

    if (error) throw error;

    let filteredData = data;

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

    return res.status(200).json(filteredData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not fetch agents' });
  }
};

export default getAllAgents;
