export const LLM_OPTIONS = {
  GPT4_TURBO: 'openai:gpt-4-turbo',
  CLAUDE3_OPUS: 'anthropic:claude-3-opus-20240229',
  CLAUDE3_SONNET: 'anthropic:claude-3-sonnet-20240229',
};

export const FILE_TYPES = {
  ACCEPTED: ['application/pdf', 'text/plain', 'text/csv'],
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
};

export const AGENT_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export const DEFAULT_TASK_PLACEHOLDER = 'Enter task for agents...';

export const CSV_HEADERS = [
  'Session ID',
  'Timestamp',
  'Task',
  'Agent ID',
  'Name',
  'Description',
  'System Prompt',
  'LLM',
  'Status',
  'Output',
];
