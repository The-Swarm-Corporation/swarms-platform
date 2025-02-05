import { OpenAI } from 'openai';
import { getUserCredit } from '@/shared/utils/supabase/admin';

export const runtime = 'edge';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { message, systemPrompt, model = 'gpt-4o', userId } = await req.json();

  const MILLION_INPUT = 1000000;

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const userTokens = estimateTokens(message) / MILLION_INPUT || 0;
  const systemTokens = estimateTokens(systemPrompt) / MILLION_INPUT || 0;
  const totalInputTokens = userTokens + systemTokens;

  const { credit, free_credit } = await getUserCredit(userId);
  const totalCredit = credit + free_credit;

  const inputTokenCost = 5;
  const outputTokenCost = 10;
  const estimatedInputCost = totalInputTokens * inputTokenCost;

  if (totalCredit < estimatedInputCost) {
    return new Response(JSON.stringify({ error: 'Insufficient credit' }), {
      status: 402,
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
    });

    let usedOutputTokens = 0;
    let completeResponse = '';
    const textEncoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          usedOutputTokens += estimateTokens(text);
          completeResponse += text;
          controller.enqueue(textEncoder.encode(text));
        }
        controller.close();
      },
      cancel() {
        console.log('Stream aborted');
      },
    });

    const totalUsedCost =
      estimatedInputCost + usedOutputTokens * outputTokenCost;
    console.log({ totalUsedCost });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'X-Used-Tokens': totalUsedCost.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
