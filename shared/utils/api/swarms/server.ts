import { Json } from '@/types_db';

type AddMessageProps = {
  chatId: string;
  role: 'user' | 'assistant';
  content: string | object;
  userId: string;
  timestamp: string;
  supabase: any;
  imageUrl: string | null;
  agentId?: string;
};

export async function addMessage({
  chatId,
  role,
  content,
  userId,
  imageUrl,
  timestamp,
  supabase,
  agentId,
}: AddMessageProps) {
  const isStructured = typeof content !== 'string';

  const { data, error } = await supabase
    .from('swarms_cloud_chat_messages')
    .insert([
      {
        chat_id: chatId,
        role,
        content: isStructured ? JSON.stringify(content) : content,
        structured_content: isStructured ? (content as Json) : null,
        user_id: userId,
        timestamp,
        img: imageUrl,
        agent_id: agentId ?? '',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting message:', error);
    console.log({ error });
    throw new Error('Failed to insert message');
  }

  return data;
}
