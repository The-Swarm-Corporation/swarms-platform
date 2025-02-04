import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const { message, systemPrompt, model = 'gpt-4o' } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    return NextResponse.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
