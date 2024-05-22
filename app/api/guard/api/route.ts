import { SwarmsApiGuard } from '@/shared/utils/api/swarms-guard';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';
import { Agent } from 'http';

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const agent = new Agent({ keepAlive: true });

async function POST(req: Request) {
  const headers = req.headers;
  const organizationId = headers.get('Swarms-Organization');
  let apiKey = headers.get('Authorization');
  if (apiKey) {
    apiKey = apiKey.replace('Bearer ', '');
  }

  const data = await req.json() as OpenAI.Chat.Completions.ChatCompletionCreateParams;
  const modelId = data?.model;

  // Cache key based on request data
  const cacheKey = `${organizationId}-${modelId}-${JSON.stringify(data.messages)}`;
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return NextResponse.json(cachedResponse);
  }

  const guard = new SwarmsApiGuard({ apiKey, organizationId, modelId });
  const isAuthenticated = await guard.isAuthenticated();

  if (isAuthenticated.status !== 200) {
    return new Response(isAuthenticated.message, {
      status: isAuthenticated.status,
    });
  }

  const endpoint = guard.modelRecord?.api_endpoint;
  const url = `${endpoint}/chat/completions`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(data),
      agent,
    });

    if (res.status != 200) {
      return new Response('Internal Error', {
        status: res.status,
      });
    }

    const res_json = await res.json() as OpenAI.Completion;

    const price_million_input = guard.modelRecord?.price_million_input || 0;
    const price_million_output = guard.modelRecord?.price_million_output || 0;
    const input_price = ((res_json.usage?.prompt_tokens ?? 0) / 1000000) * price_million_input;
    const output_price = ((res_json.usage?.completion_tokens ?? 0) / 1000000) * price_million_output;

    const choices = res_json.choices as unknown as OpenAI.Chat.Completions.ChatCompletion.Choice[];
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...data.messages,
      {
        role: 'assistant',
        content: choices[0]?.message?.content,
      },
    ];

    // Parallel logging of usage
    const logUsagePromise = guard.logUsage({
      input_cost: input_price,
      output_cost: output_price,
      input_tokens: res_json.usage?.prompt_tokens ?? 0,
      output_tokens: res_json.usage?.completion_tokens ?? 0,
      max_tokens: data.max_tokens ?? 0,
      messages,
      model: modelId,
      temperature: data.temperature ?? 0,
      top_p: data.top_p ?? 0,
      total_cost: input_price + output_price,
      stream: data.stream ?? false,
    });

    // Await logging result in parallel
    const [logResult] = await Promise.all([logUsagePromise]);

    if (logResult.status !== 200) {
      return new Response(logResult.message, {
        status: logResult.status,
      });
    }

    // Cache the response
    cache.set(cacheKey, res_json);

    return NextResponse.json(res_json);
  } catch (error) {
    console.log('error', error);
    return new Response('Internal Server Error', {
      status: 500,
    });
  }
}

export { POST };
