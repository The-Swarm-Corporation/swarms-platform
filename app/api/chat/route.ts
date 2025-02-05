import { OpenAI } from 'openai';
import { getUserCredit } from '@/shared/utils/supabase/admin';
import { encodingForModel } from 'js-tiktoken';

export const runtime = 'edge';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const encoder = encodingForModel('gpt-4');

export async function POST(req: Request) {
  const { message, systemPrompt, model = 'gpt-4', userId } = await req.json();

  const estimateTokens = (text: string) => encoder.encode(text).length;

  const userTokens = estimateTokens(message);
  const systemTokens = estimateTokens(systemPrompt);
  const totalInputTokens = userTokens + systemTokens;

  const { credit, free_credit } = await getUserCredit(userId);
  const totalCredit = credit + free_credit;

  const inputTokenCost = 0.001;
  const outputTokenCost = 0.0015;
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
