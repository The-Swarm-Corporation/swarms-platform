import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';

const getPromptById = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt ID' });
    }

    const { data, error } = await supabaseAdmin
      .from('swarms_cloud_prompts')
      .select('id, name, description, prompt, use_cases, tags')
      .eq('id', id)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not fetch prompt' });
  }
};

export default getPromptById;
