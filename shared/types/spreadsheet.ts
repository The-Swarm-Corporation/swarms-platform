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

export const mapDbAgentToInternalAgent = (agent: SwarmAgent) => ({
  ...agent,
  status: (agent.status as AgentStatus) || 'idle',
});

// types/session.ts

export type DbSession = Tables<'swarms_spreadsheet_sessions'>;

export interface Session extends DbSession {
  agents: SwarmAgent[];
}
export const mapDbSessionToSession = (
  dbSession: DbSession & { agents: SwarmAgent[] },
): Session => ({
  ...dbSession,
  tasks_executed: dbSession.tasks_executed || 0,
  time_saved: dbSession.time_saved || 0,
});

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
