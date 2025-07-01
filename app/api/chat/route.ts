import { OpenAI } from 'openai';
import {
  getUserCredit,
  getUserPromptChat,
} from '@/shared/utils/supabase/admin';
import { estimateTokensAndCost } from '@/shared/utils/helpers';

export const runtime = 'edge';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  let message, systemPrompt, model, userId, promptId;

  try {
    const body = await req.json();
    message = body.message;
    systemPrompt = body.systemPrompt;
    model = body.model || 'gpt-4o';
    userId = body.userId;
    promptId = body.promptId;

    if (!message || !systemPrompt || !userId || !promptId) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters',
        required: ['message', 'systemPrompt', 'userId', 'promptId']
      }), {
        status: 400,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Invalid JSON payload'
    }), {
      status: 400,
    });
  }

  const inputText = systemPrompt + message;
  let initialCostEstimate, estimatedInputCost;

  try {
    initialCostEstimate = estimateTokensAndCost(inputText, '', 1);
    estimatedInputCost = initialCostEstimate.inputCost + initialCostEstimate.agentCost;
  } catch (error) {
    console.error('Error estimating initial cost:', error);
    return new Response(JSON.stringify({
      error: 'Failed to estimate cost',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
    });
  }

  let credit, free_credit, referral_credits, pastMessages;

  try {
    const results = await Promise.all([
      getUserCredit(userId),
      getUserPromptChat(userId, promptId),
    ]);

    ({ credit, free_credit, referral_credits } = results[0]);
    pastMessages = results[1];
  } catch (error) {
    console.error('Error fetching user data:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
    });
  }
  const totalCredit = credit + free_credit + referral_credits;

  if (totalCredit < estimatedInputCost) {
    return new Response(JSON.stringify({ error: 'Insufficient credit' }), {
      status: 402,
    });
  }

  const messageHistory = pastMessages || [];
  const chatHistory = messageHistory?.map(({ text, sender }) => ({
    role: sender === 'user' ? 'user' : 'assistant',
    content: text || "",
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: message },
  ];

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('System API key not configured');
    }

    const response = await openai.chat.completions.create({
      model,
      messages: messages as any,
      stream: true,
    });

    let completeResponse = '';
    const textEncoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || '';
            completeResponse += text;
            controller.enqueue(textEncoder.encode(text));
          }
          controller.close();
        } catch (error) {
          console.error('Stream Error:', error);
          controller.error(error);
        }
      },
      cancel(reason) {
        console.log('Stream aborted:', reason);
      },
    });

    let totalCost = 0;
    try {
      const finalCostEstimate = estimateTokensAndCost(inputText, completeResponse, 1); // No createdAt = no night discount
      totalCost = finalCostEstimate.totalCost;
    } catch (error) {
      console.error('Error calculating final cost:', error);
      totalCost = estimatedInputCost;
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'X-Used-Tokens': totalCost.toString(),
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);

    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('API key')) {
        errorMessage = 'System API key is invalid or expired. Please contact support.';
      } else if (error.message.includes('403')) {
        errorMessage = 'System API access denied. Please contact support.';
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.message.includes('model')) {
        errorMessage = 'Invalid model specified or model not available';
      } else {
        errorMessage = error.message;
      }
    }

    return new Response(JSON.stringify({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
    });
  }
}
