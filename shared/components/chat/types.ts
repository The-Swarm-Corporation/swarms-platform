export type SwarmArchitecture = 'sequential' | 'concurrent' | 'hierarchical';

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  isActive: boolean;
}

export interface SwarmConfig {
  architecture: SwarmArchitecture;
  agents: Agent[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  securityLevel: string;
  agentId?: string;
}

export interface Conversation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type ConversationMetadata = Omit<Conversation, 'messages'>;
