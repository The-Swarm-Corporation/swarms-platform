import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';
import { validateMarketplaceSubmission } from '@/shared/services/fraud-prevention';
import { getSolPrice } from '@/shared/services/sol-price';

const editAgentSchema = z.object({
  id: z.string(),
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
  tags: z.string().optional(),
  is_free: z.boolean().optional(),
  price_usd: z.number().min(0, 'Price must be non-negative').optional(),
  category: z.array(z.string()).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
}).refine((data) => {
  if (data.is_free === false && (!data.price_usd || data.price_usd <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Paid agents must have a USD price greater than 0',
  path: ['price_usd'],
});

const editAgent = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.authenticate();

    if (!authResult.isAuthenticated || !authResult.userId) {
      return res.status(authResult.status).json({
        error: 'Authentication required to edit agent',
        message: authResult.message,
        hint: 'Provide API key in Authorization header or authenticate via Supabase',
        auth_methods: ['API Key (Bearer token)', 'Supabase session']
      });
    }

    const user_id = authResult.userId;

    const input = editAgentSchema.parse(req.body);
    const {
      id,
      name,
      agent,
      description,
      useCases,
      tags,
      language,
      requirements,
      is_free,
      price_usd,
      category,
      status,
    } = input;

    if (!id) {
      return res.status(404).json({
        error: 'Agent ID not found',
      });
    }

    const { data: existingAgent, error: existingAgentError } =
      await supabaseAdmin
        .from('swarms_cloud_agents')
        .select('*')
        .eq('user_id', user_id)
        .eq('id', id)
        .single();

    if (existingAgentError) throw existingAgentError;
    if (!existingAgent) {
      return res.status(404).json({
        error: 'Agent not found or you do not have permission to edit',
      });
    }

    const contentChanged =
      agent !== existingAgent.agent ||
      name !== existingAgent.name ||
      description !== existingAgent.description;

    const wasFree = existingAgent.is_free;
    const willBePaid = is_free === false || (!is_free && !wasFree);

    if (contentChanged && willBePaid) {
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
          message: 'Content changes require validation for paid items',
          errors: validationResult.errors,
          trustworthiness: validationResult.trustworthiness,
          contentQuality: validationResult.contentQuality,
        });
      }
    }

    // Convert USD to SOL if price_usd is being updated
    let price_sol: number | undefined;
    if (price_usd !== undefined && price_usd > 0) {
      try {
        const currentSolPrice = await getSolPrice();
        price_sol = price_usd / currentSolPrice;
      } catch (error) {
        console.error('Failed to get SOL price for agent edit:', error);
        return res.status(500).json({
          error: 'Unable to convert USD to SOL',
          message: 'Price conversion service is temporarily unavailable. Please try again later.',
        });
      }
    } else if (price_usd === 0 || (is_free === true)) {
      price_sol = 0;
    }

    const updateData: any = {
      name,
      use_cases: useCases,
      agent,
      requirements,
      language,
      description,
      tags,
    };

    if (is_free !== undefined) updateData.is_free = is_free;
    if (price_usd !== undefined) updateData.price_usd = price_usd;
    if (price_sol !== undefined) updateData.price = price_sol;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;

    const { data: updatedAgent, error: updateError } = await supabaseAdmin
      .from('swarms_cloud_agents')
      .update(updateData)
      .eq('user_id', user_id)
      .eq('id', id)
      .select('*');

    if (updateError) throw updateError;

    return res.status(200).json(updatedAgent);
  } catch (error) {
    console.error('An error occurred while editing agent:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default editAgent;
