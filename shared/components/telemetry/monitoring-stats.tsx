'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Activity,
  DollarSign,
  Timer,
  Zap,
  Users,
  Box,
  Brain,
  Award,
} from 'lucide-react';
import { useAPIKeyContext } from '../ui/apikey.provider';
import { estimateTokenCost } from '@/shared/utils/helpers';
import { ITelemetry } from './helper';

type MonitoringStats = {
  totalSwarms: number;
  totalCost: number;
  averageExecutionTime: number;
  totalTokens: number;
  successRate: number;
  totalAgentsBuilt: number;
  totalSwarmsBuilt: number;
  mostUsedModel: string;
};

const initialStats: MonitoringStats = {
  totalSwarms: 0,
  totalCost: 0,
  averageExecutionTime: 0,
  totalTokens: 0,
  successRate: 0,
  totalAgentsBuilt: 0,
  totalSwarmsBuilt: 0,
  mostUsedModel: 'N/A',
};

export function MonitoringStats({ logs, isLoading, error }: ITelemetry) {
  const [stats, setStats] = useState<MonitoringStats>(initialStats);
  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const totalSwarms = logs.length;

        let totalCost = 0;
        let totalExecutionTime = 0;
        let totalTokens = 0;
        let successfulSwarms = 0;
        const modelUsage: Record<string, number> = {};
        const agentCount: Record<string, number> = {};
        const swarmCount: Record<string, number> = {};

        for (const log of logs) {
          const usage = log?.data?.usage;
          const status = log?.data?.status || 'success';
          const executionTime = log?.data?.execution_time || 0;
          const agents = log?.data?.number_of_agents || 0;
          const swarmName = log?.data?.swarm_name || 'unknown';

          if (!usage) continue;

          const { input_tokens, output_tokens, total_tokens } = usage;
          const cost = estimateTokenCost(input_tokens, output_tokens);
          totalCost += cost.totalCost;
          totalTokens += total_tokens;
          totalExecutionTime += executionTime;

          if (status === 'success') {
            successfulSwarms++;
          }

          agentCount[log.id] = agents;
          swarmCount[swarmName] = (swarmCount[swarmName] || 0) + 1;

          // If models are tracked per agent, add logic here
          // Example:
          // for (const agent of log?.data?.agents || []) {
          //   const model = agent?.model_name || 'unknown';
          //   modelUsage[model] = (modelUsage[model] || 0) + 1;
          // }
        }

        const mostUsedModel =
          Object.entries(modelUsage).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          'N/A';

        setStats({
          totalSwarms,
          totalCost,
          averageExecutionTime: totalSwarms
            ? totalExecutionTime / totalSwarms
            : 0,
          totalTokens,
          successRate: totalSwarms ? (successfulSwarms / totalSwarms) * 100 : 0,
          totalAgentsBuilt: Object.values(agentCount).reduce(
            (a, b) => a + b,
            0,
          ),
          totalSwarmsBuilt: Object.keys(swarmCount).length,
          mostUsedModel,
        });
      } catch (err) {
        console.error('Failed to load monitoring stats:', err);
        setStats(initialStats);
      }
    };

    loadStats();
  }, [apiKey, logs]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-zinc-800 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/10 border-red-900">
        <CardContent className="p-4">
          <div className="text-red-500">
            <h3 className="font-semibold mb-2">Error Loading Stats</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricCard = (
    title: string,
    icon: React.ReactNode,
    value: string | number,
    subtitle?: string,
  ) => (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono text-red-600">{value}</div>
        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-white font-mono">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCard(
        'Total Swarms Run',
        <Activity className="h-4 w-4 text-red-500" />,
        stats.totalSwarms,
        `${stats.successRate.toFixed(1)}% success rate`,
      )}
      {metricCard(
        'Total Cost',
        <DollarSign className="h-4 w-4 text-red-500" />,
        `$${stats.totalCost.toFixed(2)}`,
        `$${(stats.totalCost / stats.totalSwarms).toFixed(4)} per swarm`,
      )}
      {metricCard(
        'Avg. Execution Time',
        <Timer className="h-4 w-4 text-red-500" />,
        `${stats.averageExecutionTime.toFixed(2)}s`,
        'Average per swarm',
      )}
      {metricCard(
        'Total Tokens',
        <Zap className="h-4 w-4 text-red-500" />,
        stats.totalTokens.toLocaleString(),
        `${Math.round(stats.totalTokens / stats.totalSwarms).toLocaleString()} per swarm`,
      )}
      {metricCard(
        'Total Agents Built',
        <Users className="h-4 w-4 text-red-500" />,
        stats.totalAgentsBuilt,
      )}
      {metricCard(
        'Total Swarms Built',
        <Box className="h-4 w-4 text-red-500" />,
        stats.totalSwarmsBuilt,
      )}
      {metricCard(
        'Success Rate',
        <Award className="h-4 w-4 text-red-500" />,
        `${stats.successRate.toFixed(1)}%`,
        'Overall success rate',
      )}
      {metricCard(
        'Most Used Model',
        <Brain className="h-4 w-4 text-red-500" />,
        stats.mostUsedModel,
      )}
    </div>
  );
}
