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
  afterMessageId?: string;
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
  afterMessageId,
}: AddMessageProps) {
  const isStructured = typeof content !== 'string';

  let editedTimestamp = timestamp;

  if (afterMessageId) {
    const { data: referenceMessage } = await supabase
      .from('swarms_cloud_chat_messages')
      .select('timestamp')
      .eq('id', afterMessageId)
      .single();

    if (referenceMessage) {
      const referenceTime = new Date(referenceMessage.timestamp);
      const newTimestamp = new Date(referenceTime.getTime() + 100); // 100ms later

      editedTimestamp = newTimestamp.toISOString();
    }
  }

  const { data, error } = await supabase
    .from('swarms_cloud_chat_messages')
    .insert([
      {
        chat_id: chatId,
        role,
        content: isStructured ? JSON.stringify(content) : content,
        structured_content: isStructured ? (content as Json) : null,
        user_id: userId,
        timestamp: editedTimestamp,
        img: imageUrl,
        agent_id: agentId ?? '',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting message:', error);
    console.log({ error });
    throw new Error('Failed to insert message');
  }

  return data;
}
