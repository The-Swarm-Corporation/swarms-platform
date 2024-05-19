import { BillingService } from '@/shared/utils/api/billing-service';
import {
  calculateRemainingCredit,
  checkRemainingCredits,
} from '@/shared/utils/api/calculate-credits';
import { SwarmsApiGuard } from '@/shared/utils/api/swarms-guard';
import Decimal from 'decimal.js';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
async function POST(req: Request) {
  /* 
      headers:
        Authorization: Bearer <token> : Required
        Organization ID : Optional
    */

  const headers = req.headers;

  const organizationPublicId = headers.get('Swarms-Organization');
  let apiKey = headers.get('Authorization');
  if (apiKey) {
    apiKey = apiKey.replace('Bearer ', '');
  }

  const data =
    (await req.json()) as OpenAI.Chat.Completions.ChatCompletionCreateParams;

  const modelId = data?.model;

  const guard = new SwarmsApiGuard({ apiKey, organizationPublicId, modelId });
  const isAuthenticated = await guard.isAuthenticated();

  if (isAuthenticated.status !== 200) {
    return new Response(isAuthenticated.message, {
      status: isAuthenticated.status,
    });
  }

  const userId = guard.getUserId();
  if (!userId) {
    return new Response('User ID not found', { status: 500 });
  }

  // SEND REQUEST TO DIFFERENT MODELS ENDPOINTS
  const endpoint = guard.modelRecord?.api_endpoint;
  const url = `${endpoint}/chat/completions`;

  const billingService = new BillingService(userId);
  const invoicePaymentStatus = await billingService.checkInvoicePaymentStatus();
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

  const estimatedTokens = 2000; // estimated tokens
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
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const res_json = (await res.json()) as OpenAI.Completion;

    const price_million_input = guard.modelRecord?.price_million_input || 0;
    const price_million_output = guard.modelRecord?.price_million_output || 0;
    const input_price =
      ((res_json.usage?.prompt_tokens ?? 0) / 1000000) * price_million_input;
    const output_price =
      ((res_json.usage?.completion_tokens ?? 0) / 1000000) *
      price_million_output;

    const totalCost = input_price + output_price;

    // Update the total cost based on the credit plan
    let totalCostToUpdate = 0;
    let invoiceTotalCostToUpdate = 0;

    if (checkCredits.credit_plan === 'default') {
      totalCostToUpdate = totalCost;
    } else if (checkCredits.credit_plan === 'invoice') {
      invoiceTotalCostToUpdate = totalCost;
    }

    const choices =
      res_json.choices as unknown as OpenAI.Chat.Completions.ChatCompletion.Choice[];
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...data.messages,
      {
        role: 'assistant',
        content: choices[0]?.message?.content,
      },
    ];

    // calculate remaining credit
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
      return new Response(logResult.message, {
        status: logResult.status,
      });
    }
    // console.log({ logResult });

    return NextResponse.json(res_json);
  } catch (error) {
    console.log('error', error);
    return new Response('Internal Server Error', {
      status: 500,
    });
  }
}

export { POST };
