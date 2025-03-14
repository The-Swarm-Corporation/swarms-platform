import { Tables } from '@/types_db';

export type SwarmArchitecture =
  | 'auto'
  | 'AgentRearrange'
  | 'MixtureOfAgents'
  | 'SpreadSheetSwarm'
  | 'SequentialWorkflow'
  | 'ConcurrentWorkflow'
  | 'GroupChat'
  | 'MultiAgentRouter'
  | 'AutoSwarmBuilder'
  | 'HiearchicalSwarm'
  | 'MajorityVoting';

export interface Agent {
  id?: string;
  name: string;
  description: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  isActive: boolean;
}

export interface SwarmAgent {
  swarm_config_id: string;
  agent_id: string;
  position: number;
  agent: Tables<'swarms_cloud_chat_agents'>;
}

export interface SwarmConfig {
  id: string;
  chat_id: string;
  architecture: SwarmArchitecture;
  created_at: string;
  updated_at: string;
  user_id: string;
  agents: SwarmAgent[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: string;
  imageUrl?: string;
  afterMessageId?: string;
}

export interface Conversation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type ConversationMetadata = Omit<Conversation, 'messages'>;

export type FormAgent = Omit<
  Tables<'swarms_cloud_chat_agents'>,
  'created_at' | 'updated_at' | 'user_id'
>;

export type AgentTemplateWithStatus = {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  chatStatus: {
    id?: string;
    is_selected: boolean;
    is_active: boolean;
    name?: string;
    description?: string;
    system_prompt?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
  };
};