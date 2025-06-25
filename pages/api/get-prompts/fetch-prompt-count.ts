import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';

const getPromptCount = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.authenticate();
    
    if (!authResult.isAuthenticated || !authResult.userId) {
      return res.status(authResult.status).json({ 
        error: 'Authentication required to fetch prompt count',
        message: authResult.message,
        hint: 'Provide API key in Authorization header or authenticate via Supabase',
        auth_methods: ['API Key (Bearer token)', 'Supabase session']
      });
    }

    const user_id = authResult.userId;

    const { count, error } = await supabaseAdmin
      .from('swarms_cloud_prompts')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id);

    if (error) throw error;

    return res.status(200).json({ 
      promptCount: count,
      user_id: user_id,
      auth_method: authResult.authMethod
    });
  } catch (e) {
    console.error('Error fetching prompt count:', e);
    return res.status(500).json({ error: 'Could not fetch prompt count' });
  }
};

export default getPromptCount;
