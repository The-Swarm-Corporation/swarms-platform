import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define types
type Agent = {
  id: string;
  name: string;
  description: string;
  agent: string;
  language: string;
  user_id: string;
  use_cases: { title: string; description: string }[];
  requirements: { package: string; installation: string }[];
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

// Input validation schema
const createAgentSchema = z.object({
  name: z.string().min(2, 'Name should be at least 2 characters'),
  agent: z.string(),
  language: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(
    z.object({
      package: z.string(),
      installation: z.string(),
    })
  ),
  useCases: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  tags: z.string().optional(),
});

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication using Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(req.headers.authorization!);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const validatedData = createAgentSchema.parse(req.body);

    // Check if agent already exists
    const { data: existingAgent } = await supabase
      .from('swarms_cloud_agents')
      .select('id')
      .eq('agent', validatedData.agent)
      .eq('user_id', user.id)
      .single();

    if (existingAgent) {
      return res.status(409).json({ error: 'Agent already exists' });
    }

    // Rate limiting: 1 agent per minute
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentAgents } = await supabase
      .from('swarms_cloud_agents')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo)
      .order('created_at', { ascending: false });

    if (recentAgents && recentAgents.length > 0) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait before creating another agent.' });
    }

    // Insert new agent
    const { data: newAgent, error } = await supabase
      .from('swarms_cloud_agents')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        user_id: user.id,
        use_cases: validatedData.useCases,
        agent: validatedData.agent,
        requirements: validatedData.requirements,
        tags: validatedData.tags ? validatedData.tags.split(',').map(tag => tag.trim()) : [],
        language: validatedData.language,
        status: 'pending',
      } as Partial<Agent>)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(newAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};