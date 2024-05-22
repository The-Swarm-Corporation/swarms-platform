import { SwarmsApiGuard } from '@/shared/utils/api/swarms-guard';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import fetch, { RequestInit, Response as FetchResponse } from 'node-fetch';
import { Agent } from 'http';
import NodeCache from 'node-cache';
import { Worker } from 'worker_threads';

const agent = new Agent({ keepAlive: true });
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

async function fetchWithRetries(url: string, options: RequestInit, retries: number = 3): Promise<FetchResponse> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      return fetchWithRetries(url, options, retries - 1);
    } else {
      throw error;
    }
  }
}

async function POST(req: Request) {
  const headers = req.headers;
  const organizationId = headers.get('Swarms-Organization');
  let apiKey = headers.get('Authorization');
  if (apiKey) {
    apiKey = apiKey.replace('Bearer ', '');
  }

  const data = await req.json() as OpenAI.Chat.Completions.ChatCompletionCreateParams;
  const modelId = data?.model;

  // Cache key based on API key and organization ID
  const authCacheKey = `auth-${apiKey}-${organizationId}`;
  const cachedAuth = cache.get(authCacheKey);

  let guard: SwarmsApiGuard;
  if (cachedAuth) {
    guard = cachedAuth as SwarmsApiGuard;
  } else {
    guard = new SwarmsApiGuard({ apiKey, organizationId, modelId });
    const isAuthenticated = await guard.isAuthenticated();

    if (isAuthenticated.status !== 200) {
      return new Response(isAuthenticated.message, {
        status: isAuthenticated.status,
      });
    }

    cache.set(authCacheKey, guard);
  }

  const endpoint = guard.modelRecord?.api_endpoint;
  const url = `${endpoint}/chat/completions`;

  try {
    const res = await fetchWithRetries(url, {
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

    // Offloading logging to a worker thread
    const logResult = await guard.logUsage({
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

    logWorker.on('message', (logResult) => {
      if (logResult.status !== 200) {
        console.error(`Log Error: ${logResult.message}`);
      }
    });

    logWorker.on('error', (error) => {
      console.error('Worker Error:', error);
    });

    logWorker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });

    return NextResponse.json(res_json);
  } catch (error) {
    console.log('error', error);
    return new Response('Internal Server Error', {
      status: 500,
    });
  }
}

export { POST };
