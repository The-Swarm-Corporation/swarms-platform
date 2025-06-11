import { SwarmLog } from '@/shared/utils/api/telemetry/api';
import { estimateTokenCost } from '@/shared/utils/helpers';

export interface ITelemetry {
  logs: SwarmLog[];
  isLoading: boolean;
  error: string | null;
}

export interface ProcessedSwarmData {
  id: string;
  name: string;
  executionTime: number;
  tokenCount: number;
  cost: number;
  successRate: number;
  agentCount: number;
  swarmType: string;
  lastRun: string;
  color: string;
}

export type Metric =
  | 'executionTime'
  | 'tokenCount'
  | 'cost'
  | 'successRate'
  | 'agentCount';
export type ChartType = 'bar' | 'comparison';
export type SortOrder = 'asc' | 'desc';

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
];

export const getProcessedData = (
  logs: SwarmLog[] = [],
  metric: Metric,
  sortOrder: SortOrder,
  limit?: number,
): ProcessedSwarmData[] => {
  if (!logs || logs.length === 0) return [];

  const swarmMap = new Map<string, SwarmLog[]>();

  logs.forEach((log) => {
    const swarmName = log.data.swarm_name || 'Unnamed Swarm';
    if (!swarmMap.has(swarmName)) {
      swarmMap.set(swarmName, []);
    }
    swarmMap.get(swarmName)?.push(log);
  });

  let processedData: ProcessedSwarmData[] = [];
  let colorIndex = 0;

  swarmMap.forEach((swarmLogs, swarmName) => {
    const totalRuns = swarmLogs.length;
    const successfulRuns = swarmLogs.filter(
      (log) => log.data.status === 'success',
    ).length;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    let totalExecutionTime = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    let totalAgents = 0;
    let swarmType = '';
    let lastRun = new Date(0).toISOString();

    swarmLogs.forEach((log) => {
      const { execution_time, usage, number_of_agents, swarm_type } = log.data;

      totalExecutionTime += execution_time || 0;
      totalInputTokens += usage?.input_tokens || 0;
      totalOutputTokens += usage?.output_tokens || 0;

      const costEstimate = estimateTokenCost(
        usage?.input_tokens || 0,
        usage?.output_tokens || 0,
      );
      totalCost += costEstimate.totalCost;

      totalAgents += number_of_agents || 0;

      if (new Date(log.created_at) > new Date(lastRun)) {
        lastRun = log.created_at;
        swarmType = swarm_type || 'Unknown';
      }
    });

    processedData.push({
      id: swarmName.replace(/\s+/g, '-').toLowerCase(),
      name: swarmName,
      executionTime: totalRuns > 0 ? totalExecutionTime / totalRuns : 0,
      tokenCount:
        totalRuns > 0 ? (totalInputTokens + totalOutputTokens) / totalRuns : 0,
      cost: totalRuns > 0 ? totalCost / totalRuns : 0,
      successRate,
      agentCount: totalRuns > 0 ? totalAgents / totalRuns : 0,
      swarmType,
      lastRun,
      color: COLORS[colorIndex++ % COLORS.length],
    });

    colorIndex++;
  });

  processedData.sort((a, b) => {
    return sortOrder === 'asc' ? a[metric] - b[metric] : b[metric] - a[metric];
  });

  if (limit && processedData.length > limit) {
    processedData = processedData.slice(0, limit);
  }

  return processedData;
};

export const getMetricLabel = (metric: Metric): string => {
  switch (metric) {
    case 'executionTime':
      return 'Execution Time (s)';
    case 'tokenCount':
      return 'Token Usage';
    case 'cost':
      return 'Cost ($)';
    case 'successRate':
      return 'Success Rate (%)';
    case 'agentCount':
      return 'Agent Count';
    default:
      return metric;
  }
};

export const formatValue = (value: number, metric: Metric): string => {
  switch (metric) {
    case 'executionTime':
      return value.toFixed(2) + 's';
    case 'tokenCount':
      return value.toLocaleString();
    case 'cost':
      return '$' + value.toFixed(4);
    case 'successRate':
      return value.toFixed(1) + '%';
    case 'agentCount':
      return value.toFixed(1);
    default:
      return value.toString();
  }
};

export const getTooltipFormatter = (
  value: number,
  name: string,
  metric: Metric,
) => {
  return formatValue(value, metric);
};

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );

export const getDisplaySwarmName = (swarm_name: string, description?: string) => {
  const MAX_LENGTH = 20;

  if (isUUID(swarm_name)) {
    return `Session-${swarm_name.slice(0, 8)}...`;
  }

  return swarm_name.length > MAX_LENGTH
    ? swarm_name.slice(0, MAX_LENGTH) + '...'
    : swarm_name;
};
