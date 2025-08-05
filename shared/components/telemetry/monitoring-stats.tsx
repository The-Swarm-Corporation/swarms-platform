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
import { ITelemetry, getCostFromLog } from './helper';

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

          const { total_tokens } = usage;

          totalCost += getCostFromLog(log);
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
          <Card key={i} className="bg-card border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/5 border border-white/20">
        <CardContent className="p-6">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error Loading Stats</h3>
            <p className="text-sm">{error}</p>
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
    <Card className="bg-card border border-white/20 hover:border-white/30 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-foreground/60">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
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
        <Activity className="h-4 w-4" />,
        stats.totalSwarms,
        `${stats.successRate.toFixed(1)}% success rate`,
      )}
      {metricCard(
        'Total Cost',
        <DollarSign className="h-4 w-4" />,
        `$${stats.totalCost.toFixed(2)}`,
        `$${(stats.totalCost / stats.totalSwarms).toFixed(4)} per swarm`,
      )}
      {metricCard(
        'Avg. Execution Time',
        <Timer className="h-4 w-4" />,
        `${stats.averageExecutionTime.toFixed(2)}s`,
        'Average per swarm',
      )}
      {metricCard(
        'Total Tokens',
        <Zap className="h-4 w-4" />,
        stats.totalTokens.toLocaleString(),
        `${Math.round(stats.totalTokens / stats.totalSwarms).toLocaleString()} per swarm`,
      )}
      {metricCard(
        'Total Agents Built',
        <Users className="h-4 w-4" />,
        stats.totalAgentsBuilt,
      )}
      {metricCard(
        'Total Swarms Built',
        <Box className="h-4 w-4" />,
        stats.totalSwarmsBuilt,
      )}
      {metricCard(
        'Success Rate',
        <Award className="h-4 w-4" />,
        `${stats.successRate.toFixed(1)}%`,
        'Overall success rate',
      )}
      {metricCard(
        'Most Used Model',
        <Brain className="h-4 w-4" />,
        stats.mostUsedModel,
      )}
    </div>
  );
}
