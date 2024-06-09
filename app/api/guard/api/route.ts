import { BillingService } from '@/shared/utils/api/billing-service';
import {
  calculateRemainingCredit,
  checkRemainingCredits,
} from '@/shared/utils/api/calculate-credits';
import { SwarmsApiGuard } from '@/shared/utils/api/swarms-guard';
import Decimal from 'decimal.js';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import fetch, { RequestInit, Response as FetchResponse } from 'node-fetch';
import { Agent } from 'http';
import NodeCache from 'node-cache';

const agent = new Agent({ keepAlive: true });
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

async function fetchWithRetries(
  url: string,
  options: RequestInit,
  retries: number = 3,
): Promise<FetchResponse> {
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

  const organizationPublicId = headers.get('Swarms-Organization');
  let apiKey = headers.get('Authorization');
  if (apiKey) {
    apiKey = apiKey.replace('Bearer ', '');
  }

  const data =
    (await req.json()) as OpenAI.Chat.Completions.ChatCompletionCreateParams;
  const modelId = data?.model;

  // Cache key based on API key and organization ID
  const authCacheKey = `auth-${apiKey}-${organizationPublicId}`;
  const cachedAuth = cache.get(authCacheKey);

  let guard: SwarmsApiGuard;
  if (cachedAuth) {
    guard = cachedAuth as SwarmsApiGuard;
  } else {
    guard = new SwarmsApiGuard({ apiKey, organizationPublicId, modelId });
    const isAuthenticated = await guard.isAuthenticated();

    if (isAuthenticated.status !== 200) {
      return new Response(isAuthenticated.message, {
        status: isAuthenticated.status,
      });
    }

    cache.set(authCacheKey, guard);
  }

  const userId = guard.getUserId();
  if (!userId) {
    return new Response('User ID not found', { status: 500 });
  }

  // SEND REQUEST TO DIFFERENT MODELS ENDPOINTS
  const endpoint = guard.modelRecord?.api_endpoint;
  const url = `${endpoint}/v1/chat/completions`;

  const billingService = new BillingService(userId);
  const invoicePaymentStatus = await billingService.checkInvoicePaymentStatus(
    organizationPublicId ?? '',
  );
  const checkCredits = await checkRemainingCredits(
    userId,
    organizationPublicId,
  );

  if (
    checkCredits.credit_plan === 'invoice' &&
    invoicePaymentStatus.status !== 200
  ) {
    return new Response(invoicePaymentStatus.message, {
      status: invoicePaymentStatus.status,
    });
  }

  if (!invoicePaymentStatus.is_paid) {
    return new Response(invoicePaymentStatus.message, {
      status: invoicePaymentStatus.status,
    });
  }

  // since input & output are price per million tokens
  // check if user has sufficient credits by estimates

  const price_million_input = guard.modelRecord?.price_million_input || 0;
  const price_million_output = guard.modelRecord?.price_million_output || 0;

  const estimatedTokens = 1000; // estimated tokens
  const estimatedCost =
    (estimatedTokens / 1000000) * price_million_input +
    (estimatedTokens / 1000000) * price_million_output;

  if (checkCredits.status !== 200) {
    return new Response(checkCredits.message, {
      status: checkCredits.status,
    });
  }

  const remainingCredit = new Decimal(checkCredits.remainingCredits);
  const decimalEstimatedCost = new Decimal(estimatedCost);

  if (
    checkCredits.credit_plan === 'default' &&
    remainingCredit.lessThan(decimalEstimatedCost)
  ) {
    return new Response('Insufficient credits', {
      status: 402,
    });
  }

  try {
    const res = await fetchWithRetries(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
      agent,
    });

    if (res.status !== 200) {
      const errorBody = await res.text();
      return new Response(`Internal Error - fetching model, ${errorBody}`, {
        status: res.status,
      });
    }

    const res_json =
      (await res.json()) as OpenAI.Chat.Completions.ChatCompletion;
    const price_million_input = guard.modelRecord?.price_million_input || 0;
    const price_million_output = guard.modelRecord?.price_million_output || 0;
    const input_price =
      ((res_json.usage?.prompt_tokens ?? 0) / 1000000) * price_million_input;
    const output_price =
      ((res_json.usage?.completion_tokens ?? 0) / 1000000) *
      price_million_output;

    const totalCost = input_price + output_price;

    if (
      checkCredits.credit_plan === 'default' &&
      remainingCredit.lessThan(totalCost)
    ) {
      return new Response('Insufficient credits', {
        status: 402,
      });
    }

    // Update the total cost based on the credit plan
    let totalCostToUpdate = 0;
    let invoiceTotalCostToUpdate = 0;

    if (checkCredits.credit_plan === 'default') {
      totalCostToUpdate = totalCost;
    } else if (checkCredits.credit_plan === 'invoice') {
      invoiceTotalCostToUpdate = totalCost;
    }

    const choices =
      res_json.choices as OpenAI.Chat.Completions.ChatCompletion.Choice[];
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...data.messages,
      {
        role: 'assistant',
        content: choices[0]?.message?.content || '',
      },
    ];

    // calculate remaining credit
    if (
      checkCredits.credit_plan === 'default' &&
      remainingCredit.greaterThan(0)
    ) {
      const creditBalance = await calculateRemainingCredit(
        totalCost,
        userId,
        organizationPublicId,
      );

      if (creditBalance?.status !== 200) {
        return new Response(creditBalance?.message, {
          status: creditBalance?.status,
        });
      }
    }

    // log the result
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
      total_cost: totalCostToUpdate,
      invoice_total_cost: invoiceTotalCostToUpdate,
      stream: data.stream ?? false,
    });

    if (logResult.status !== 200) {
      console.error(`Log Error: ${logResult.message}`);
    }
    // console.log({ logResult });

    return NextResponse.json(res_json);
  } catch (error) {
    console.log('error', error);
    return new Response('Internal Server Error - Swarms gaurd api', {
      status: 500,
    });
  }
}

export { POST };
