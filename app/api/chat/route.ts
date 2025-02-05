import { getUserCredit } from '@/shared/utils/supabase/admin';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { message, systemPrompt, model = 'gpt-4o', userId } = await req.json();

  // Dynamically import OpenAI only when POST is called
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const MILLION_INPUT = 1000000;
  // Initialize encoder dynamically
  const getTikToken = async () => {
    const { encodingForModel } = await import('js-tiktoken');
    return encodingForModel('gpt-4');
  };

  const encoder = await getTikToken();
  const estimateTokens = (text: string) => encoder.encode(text).length;

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
