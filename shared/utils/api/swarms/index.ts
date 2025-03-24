import { SwarmArchitecture } from '@/shared/components/chat/types';
import { Tables } from '@/types_db';

export interface SwarmAgent {
  agent_name: string;
  description?: string;
  system_prompt?: string;
  model_name?: string;
  auto_generate_prompt?: boolean;
  max_tokens?: number;
  temperature?: number;
  role?: string;
  max_loops?: number;
}

export interface SwarmRequest {
  name?: string;
  description?: string;
  agents: SwarmAgent[];
  max_loops?: number;
  swarm_type: string;
  task: string;
  img?: string;
  output_type?: string;
  rules?: string;
  return_history?: boolean;
  rearrange_flow?: string;
}

export interface SwarmResponse {
  status: string;
  swarm_name: string;
  description: string;
  task: string;
  metadata: Record<string, any>;
  output: any;
}

const architectureToSwarmType: Partial<Record<SwarmArchitecture, string>> = {
  auto: 'auto',
  AgentRearrange: 'AgentRearrange',
  SequentialWorkflow: 'SequentialWorkflow',
  ConcurrentWorkflow: 'ConcurrentWorkflow',
  HiearchicalSwarm: 'HiearchicalSwarm',
  MixtureOfAgents: 'MixtureOfAgents',
  SpreadSheetSwarm: 'SpreadSheetSwarm',
  GroupChat: 'GroupChat',
  MultiAgentRouter: 'MultiAgentRouter',
  AutoSwarmBuilder: 'AutoSwarmBuilder',
  MajorityVoting: 'MajorityVoting',
};

export class SwarmsApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(
    apiKey: string,
    baseUrl = process.env.NEXT_PUBLIC_SWARMS_API_BASE_URL ?? '',
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private get headers(): HeadersInit {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async executeSwarm(request: SwarmRequest): Promise<SwarmResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/swarm/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Swarm API error:', error);
      throw error;
    }
  }

  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models/available`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Swarm API error:', error);
      throw error;
    }
  }

  // Stream the response (if API supports streaming)
  async streamSwarm(
    request: SwarmRequest,
  ): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/swarm/completions`, {
        method: 'POST',
        headers: {
          ...this.headers,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return response.body;
    } catch (error) {
      console.error('Swarm API streaming error:', error);
      throw error;
    }
  }

  static convertAgentsToApiFormat(
    agents: Tables<'swarms_cloud_chat_agents'>[],
    architecture: SwarmArchitecture,
  ): SwarmAgent[] {
    return agents
      .filter((agent) => agent.is_active)
      .map((agent) => ({
        agent_name: agent.name,
        description: agent.description || '',
        system_prompt: agent.system_prompt || '',
        model_name: agent.model || 'gpt-4o',
        temperature:
          agent.temperature !== null ? Number(agent.temperature) : 0.5,
        max_tokens: agent.max_tokens || 2048,
        role: agent.role,
        max_loops: agent.max_loops,
        auto_generate_prompt: agent.auto_generate_prompt,
      }));
  }

  static getSwarmType(architecture: SwarmArchitecture): string {
    return architectureToSwarmType[architecture] || 'SequentialWorkflow';
  }
}
