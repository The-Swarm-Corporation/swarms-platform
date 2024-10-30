// types/agent.ts
import { Tables } from '@/types_db';

export type SwarmAgent = Tables<'swarms_spreadsheet_session_agents'>;

export interface DraggedFile {
  name: string;
  content: string;
  type: string;
}

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface Agent extends Tables<'swarms_spreadsheet_session_agents'> {
  systemPrompt?: string;
}

export interface NewAgent {
  name: string;
  description: string;
  system_prompt: string;
  llm: string;
}

// types/session.ts

export type DbSession = Tables<'swarms_spreadsheet_sessions'>;

export interface Session extends DbSession {
  agents: SwarmAgent[];
}

// types/task.ts
export interface TaskConfig {
  task: string;
  sessionId: string;
  agents: Agent[];
}

export interface TaskResult {
  agentId: string;
  output: string;
  status: AgentStatus;
}
