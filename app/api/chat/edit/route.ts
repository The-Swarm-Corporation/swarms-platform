import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messageId, newContent, userId, promptId, model } = await req.json();

    if (!messageId || !newContent || !userId || !promptId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { error: editError } = await supabase
      .from('swarms_cloud_prompts_chats')
      .update({ content: newContent, updated_at: new Date() })
      .eq('id', messageId)
      .eq('user_id', userId);

    if (editError) throw editError;

    // Find & delete the previous AI response
    const { data: oldAiMessage, error: findError } = await supabase
      .from('swarms_cloud_prompts_chats')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', userId)
      .eq('role', 'ai')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError) throw findError;

    if (oldAiMessage) {
      await supabase
        .from('swarms_cloud_prompts_chats')
        .delete()
        .eq('id', oldAiMessage.id);
    }

    // Stream AI response using OpenAI v4 SDK (Fixed)
    const stream = new ReadableStream({
      async start(controller) {
        const response = await openai.chat.completions.create({
          model: model || 'gpt-4o',
          messages: [{ role: 'user', content: newContent }],
          stream: true,
        });

        let aiMessage = '';

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content ?? ''; // FIXED: `delta` now correctly handled
          aiMessage += text;
          controller.enqueue(text);
        }

        controller.close();

        // Save the new AI response
        await supabase
          .from('swarms_cloud_prompts_chats')
          .insert([
            {
              user_id: userId,
              prompt_id: promptId,
              content: aiMessage,
              role: 'ai',
            },
          ]);
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Edit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
