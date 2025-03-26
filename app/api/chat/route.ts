import { OpenAI } from 'openai';
import {
  getUserCredit,
  getUserPromptChat,
} from '@/shared/utils/supabase/admin';

export const runtime = 'edge';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const {
    message,
    systemPrompt,
    model = 'gpt-4o',
    userId,
    promptId,
  } = await req.json();

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const inputCostPerThousand = 0.005; // $5 per million tokens = $0.005 per 1,000
  const outputCostPerThousand = 0.01; // $10 per million tokens = $0.01 per 1,000

  const userTokens = estimateTokens(message);
  const systemTokens = estimateTokens(systemPrompt);
  const totalInputTokens = userTokens + systemTokens;

  const estimatedInputCost = (totalInputTokens / 1000) * inputCostPerThousand;

  const [{ credit, free_credit }, pastMessages] = await Promise.all([
    getUserCredit(userId),
    getUserPromptChat(userId, promptId),
  ]);
  const totalCredit = credit + free_credit;

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
    const response = await openai.chat.completions.create({
      model,
      messages: messages as any,
      stream: true,
    });

    let usedOutputTokens = 0;
    let completeResponse = '';
    const textEncoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || '';
            usedOutputTokens += estimateTokens(text);
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

    const outputCost = (usedOutputTokens / 1000) * outputCostPerThousand;
    const totalCost = estimatedInputCost + outputCost;

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'X-Used-Tokens': totalCost.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
