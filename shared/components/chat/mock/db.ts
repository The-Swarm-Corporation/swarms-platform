import { Conversation, ConversationMetadata, Message } from '../types';

class Database {
  private conversations: Conversation[] = [
    {
      id: 'convo-1',
      name: 'Project Discussion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: "Hey, let's discuss the project!",
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Sure! What are the key points?',
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'convo-2',
      name: 'Team Meeting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-3',
          role: 'user',
          content: 'Reminder: Team meeting at 3 PM.',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ];

  private messages: Message[] = this.conversations.flatMap(
    (convo) => convo.messages,
  );

  async createConversation(name: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    this.conversations.push(conversation);
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.find((convo) => convo.id === id);
  }

  async listConversations(): Promise<ConversationMetadata[]> {
    return this.conversations.map(({ messages, ...meta }) => meta).reverse();
  }

  async updateConversation(
    id: string,
    updates: Partial<Conversation>,
  ): Promise<void> {
    const conversation = this.conversations.find((convo) => convo.id === id);
    if (!conversation) throw new Error('Conversation not found');

    Object.assign(conversation, updates, {
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations = this.conversations.filter((convo) => convo.id !== id);
  }

  async addMessage(
    conversationId: string,
    message: Omit<Message, 'id'>,
  ): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
    };

    const conversation = this.conversations.find(
      (convo) => convo.id === conversationId,
    );
    if (!conversation) throw new Error('Conversation not found');

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();
    return newMessage;
  }

  async exportConversation(id: string): Promise<string> {
    const conversation = this.conversations.find((convo) => convo.id === id);
    if (!conversation) throw new Error('Conversation not found');
    return JSON.stringify(conversation, null, 2);
  }
}

export const db = new Database();
