import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';
import { checkDailyLimit } from '@/shared/utils/api/daily-rate-limit';
import { validateMarketplaceSubmission } from '@/shared/services/fraud-prevention';
import { getSolPrice } from '@/shared/services/sol-price';

const createAgentSchema = z.object({
  name: z.string().min(2, 'Name should be at least 2 characters'),
  agent: z
    .string()
    .min(5, { message: 'Agent should be at least 5 characters' }),
  language: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(
    z.object({
      package: z.string(),
      installation: z.string(),
    }),
  ),
  useCases: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
  tags: z.string().min(2, {
    message: 'Tags should be at least 1 characters and separated by commas',
  }),
  is_free: z.boolean().default(true),
  price_usd: z.number().min(0, 'Price must be non-negative').optional(),
  category: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
}).refine((data) => {
  if (!data.is_free && (!data.price_usd || data.price_usd <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Paid agents must have a USD price greater than 0',
  path: ['price_usd'],
});

const addAgent = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.authenticate();

    if (!authResult.isAuthenticated || !authResult.userId) {
      return res.status(authResult.status).json({
        error: 'Authentication required to create agent',
        message: authResult.message,
        hint: 'Provide API key in Authorization header or authenticate via Supabase',
        auth_methods: ['API Key (Bearer token)', 'Supabase session']
      });
    }

    const user_id = authResult.userId;

    const input = createAgentSchema.parse(req.body);
    const {
      name,
      agent,
      description,
      useCases,
      tags,
      requirements,
      language,
      is_free,
      price_usd,
      category,
      status
    } = input;

    const dailyLimitCheck = await checkDailyLimit(user_id, 'agent', !is_free);
    if (!dailyLimitCheck.allowed) {
      return res.status(429).json({
        error: 'Daily limit exceeded',
        message: dailyLimitCheck.reason,
        currentUsage: dailyLimitCheck.currentUsage,
        limits: dailyLimitCheck.limits,
        resetTime: dailyLimitCheck.resetTime,
      });
    }

    if (!is_free) {
      const validationResult = await validateMarketplaceSubmission(
        user_id,
        agent,
        'agent',
        name,
        description || '',
        false // isPaid
      );

      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Marketplace validation failed',
          errors: validationResult.errors,
          trustworthiness: validationResult.trustworthiness,
          contentQuality: validationResult.contentQuality,
        });
      }
    }

    // Convert USD to SOL for storage (snapshot at creation time)
    let price_sol = 0;
    if (!is_free && price_usd && price_usd > 0) {
      try {
        const currentSolPrice = await getSolPrice();
        price_sol = price_usd / currentSolPrice;
      } catch (error) {
        console.error('Failed to get SOL price for agent creation:', error);
        return res.status(500).json({
          error: 'Unable to convert USD to SOL',
          message: 'Price conversion service is temporarily unavailable. Please try again later.',
        });
      }
    }

    // Check for duplicate agent content
    const { data: recentAgents, error: recentAgentsError } = await supabaseAdmin
      .from('swarms_cloud_agents')
      .select('*')
      .eq('agent', agent)
      .eq('user_id', user_id);

    if (recentAgentsError) throw recentAgentsError;

    if (recentAgents.length > 0) {
      return res.status(400).json({ error: 'Agent already exists' });
    }

    const trimTags = tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(',');

    const { error } = await supabaseAdmin.from('swarms_cloud_agents').insert([
      {
        name,
        use_cases: useCases,
        agent,
        description,
        user_id,
        requirements,
        language,
        tags: trimTags,
        is_free: is_free ?? true,
        price_usd: price_usd || null,
        price: price_sol || null,
        category: category || null,
        status: status || 'pending',
      },
    ]);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors });
    }
    return res.status(500).json({ error: 'Could not add agent' });
  }
};

export default addAgent;
