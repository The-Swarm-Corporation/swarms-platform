import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { HybridAuthGuard } from '@/shared/utils/api/hybrid-auth-guard';
import { checkDailyLimit } from '@/shared/utils/api/daily-rate-limit';
import { validateMarketplaceSubmission } from '@/shared/services/fraud-prevention';

const promptSchema = z.object({
  name: z.string().min(2, { message: 'Name should be at least 2 characters' }),
  prompt: z
    .string()
    .min(5, { message: 'Prompt should be at least 5 characters' }),
  description: z.string().optional(),
  useCases: z
    .array(
      z.object({
        title: z.string().min(1, { message: 'Use case title is required' }),
        description: z
          .string()
          .min(1, { message: 'Use case description is required' }),
      }),
    )
    .min(1, { message: 'At least one use case is required' }),
  tags: z.string().min(2, {
    message: 'Tags should be at least 1 characters and separated by commas',
  }),
  is_free: z.boolean().default(true),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  category: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
}).refine((data) => {
  if (!data.is_free && (!data.price || data.price <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Paid prompts must have a price greater than 0',
  path: ['price'],
});

const addPrompt = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const authGuard = new HybridAuthGuard(req);
    const authResult = await authGuard.authenticate();

    if (!authResult.isAuthenticated || !authResult.userId) {
      return res.status(authResult.status).json({
        error: 'Authentication required to create prompt',
        message: authResult.message,
        hint: 'Provide API key in Authorization header or authenticate via Supabase',
        auth_methods: ['API Key (Bearer token)', 'Supabase session']
      });
    }

    const user_id = authResult.userId;

    const input = promptSchema.parse(req.body);
    const {
      name,
      prompt,
      description,
      useCases,
      tags,
      is_free,
      price,
      category,
      status
    } = input;

    const dailyLimitCheck = await checkDailyLimit(user_id, 'prompt', !is_free);
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
        prompt,
        'prompt',
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



    //check for existing prompt
    const { data: existingPrompts, error: existingPromptsError } =
      await supabaseAdmin
        .from('swarms_cloud_prompts')
        .select('*')
        .eq('prompt', prompt)
        .eq('user_id', user_id);

    if (existingPromptsError) throw existingPromptsError;

    if (existingPrompts.length > 0) {
      return res.status(400).json({ error: 'Prompt already exists' });
    }

    const trimTags = tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(',');

    const { error } = await supabaseAdmin.from('swarms_cloud_prompts').insert([
      {
        name,
        use_cases: useCases,
        prompt,
        description,
        user_id,
        tags: trimTags,
        // Marketplace fields
        is_free: is_free ?? true,
        price: price || null,
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
    return res.status(500).json({ error: 'Could not add prompt' });
  }
};

export default addPrompt;
