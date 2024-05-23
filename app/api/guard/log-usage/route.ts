import { z } from 'zod';

const bodySchema = z.object({
  model: z.string(),
  temperature: z.number(),
  top_p: z.number(),
  echo: z.boolean().optional(),
  stream: z.boolean().optional(),

  input_cost: z.number(),
  output_cost: z.number(),
  total_cost: z.number(),

  input_tokens: z.number(),
  output_tokens: z.number(),

  max_tokens: z.number(),

  messages: z.any(),
});

import { SwarmsApiGuard } from '@/shared/utils/api/swarms-guard';

async function POST(req: Request) {
  const headers = req.headers;

  const secretkey = headers.get('SecretKey');
  if (!secretkey) {
    return new Response('Secret Key is missing', { status: 401 });
  }
  if (secretkey !== process.env.GUARD_SECRET_KEY) {
    return new Response('Invalid Secret Key', { status: 401 });
  }
  const organizationPublicId = headers.get('Swarms-Organization');
  const apiKey = headers.get('Authorization');

  const body = await req.json();

  const validation = bodySchema.safeParse(body);
  if (!validation.success) {
    return new Response(validation.error.message, { status: 400 });
  }
  const modelId = body?.model;

  const guard = new SwarmsApiGuard({ apiKey, organizationPublicId, modelId });
  const isAuthenticated = await guard.isAuthenticated();
  if (isAuthenticated.status !== 200) {
    return new Response(isAuthenticated.message, {
      status: isAuthenticated.status,
    });
  }
  const logResult = await guard.logUsage(body);
  try {
    return new Response(logResult.message, {
      status: logResult.status,
    });
  } catch (error) {
    console.log('error', error);

    return new Response('Internal Server Error', {
      status: 500,
    });
  }
}

export { POST };
