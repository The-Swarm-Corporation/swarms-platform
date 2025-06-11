'use client';

export interface SwarmLog {
  id: number;
  created_at: string;
  data: {
    task: string;
    output: string[];
    status: string;
    execution_time: number;
    number_of_agents: number;
    metadata: {
      max_loops: number;
      num_agents: number;
      billing_info: {
        total_cost: number;
        cost_breakdown: {
          agent_cost: number;
          num_agents: number;
          token_counts: {
            per_agent: {
              [key: string]: {
                input_tokens: number;
                total_tokens: number;
                output_tokens: number;
              };
            };
            total_tokens: number;
            total_input_tokens: number;
            total_output_tokens: number;
          };
          input_token_cost: number;
          output_token_cost: number;
          execution_time_seconds: number;
        };
      };
      completion_time: number;
      execution_time_seconds: number;
    };
    swarm_name: string;
    service_tier: string;
    description: string;
    agents?: Array<{
      model_name?: string;
      role?: string;
    }>;
    swarm_type?: string;
    usage: {
      input_tokens: number;
      total_tokens: number;
      output_tokens: number;
    };
  };
}

const DEFAULT_MODELS = ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'];
const DEFAULT_SWARM_TYPES = [
  'SequentialWorkflow',
  'ConcurrentWorkflow',
  'AgentRearrange',
  'MixtureOfAgents',
  'GroupChat',
  'AutoSwarmBuilder',
];

async function fetchFromAPI<T>(endpoint: string, apiKey: string): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called in the browser');
  }

  if (!apiKey) {
    throw new Error('Please configure your API key in the dashboard first');
  }

  const url = `${process.env.NEXT_PUBLIC_SWARMS_API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
      credentials: 'omit',
    });

    if (!res.ok) {
      const errorText = await res.text();
      const baseMessage = `API request failed: ${res.status} ${res.statusText}`;
      const extraInfo = errorText ? ` - ${errorText}` : '';

      switch (res.status) {
        case 401:
        case 403:
          throw new Error('Invalid or expired API key. Please reconfigure it.');
        case 404:
          throw new Error(
            'Requested endpoint not available. Check your configuration.',
          );
        default:
          throw new Error(`${baseMessage}${extraInfo}`);
      }
    }

    return await res.json();
  } catch (err: any) {
    console.error('API Fetch Error:', err);
    throw new Error(`Failed API request: ${err?.message || 'Unknown error'}`);
  }
}

// --- LOGS
export async function fetchSwarmLogs(apiKey: string): Promise<{
  status: string;
  count: number;
  logs: SwarmLog[];
}> {
  const data = await fetchFromAPI<{ status: string; logs: SwarmLog[] }>(
    '/v1/swarm/logs',
    apiKey,
  );

  const validLogs = data.logs.filter(
    (log) => log.id && log.created_at && log.data,
  );

  return {
    status: data.status,
    count: validLogs.length,
    logs: validLogs,
  };
}

// --- MODELS
export async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const data = await fetchFromAPI<{ models?: string[] }>(
      '/v1/models/available',
      apiKey,
    );
    return Array.isArray(data.models) ? data.models : DEFAULT_MODELS;
  } catch (err) {
    console.error('Error fetching models:', err);
    return DEFAULT_MODELS;
  }
}

// --- SWARM TYPES
export async function fetchAvailableSwarmTypes(
  apiKey: string,
): Promise<string[]> {
  try {
    const data = await fetchFromAPI<{ swarm_types?: string[] }>(
      '/v1/swarms/available',
      apiKey,
    );
    return Array.isArray(data.swarm_types)
      ? data.swarm_types
      : DEFAULT_SWARM_TYPES;
  } catch (err) {
    console.error('Error fetching swarm types:', err);
    return DEFAULT_SWARM_TYPES;
  }
}
