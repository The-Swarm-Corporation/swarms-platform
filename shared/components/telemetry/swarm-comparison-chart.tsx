'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  fetchSwarmLogs,
  type SwarmLog,
} from '@/shared/utils/api/telemetry/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { AlertOctagon, Loader2, RefreshCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAPIKeyContext } from '../ui/apikey.provider';
import {
  ChartType,
  formatValue,
  getMetricLabel,
  getProcessedData,
  ITelemetry,
  Metric,
  ProcessedSwarmData,
  SortOrder,
} from './helper';

interface SwarmComparisonProps extends ITelemetry {
  limit?: number;
  className?: string;
}

export function SwarmComparison({
  limit,
  className,
  logs,
  isLoading,
  error,
}: SwarmComparisonProps) {
  const [processedData, setProcessedData] = useState<ProcessedSwarmData[]>([]);
  const [swarmLogs, setSwarmLogs] = useState<SwarmLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('executionTime');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    const validLogs = logs?.filter((log) => {
      return (
        log &&
        log.data?.execution_time !== undefined &&
        log.data?.usage &&
        typeof log.data.usage.input_tokens === 'number' &&
        typeof log.data.usage.output_tokens === 'number' &&
        log.data?.status &&
        log.created_at &&
        log.data?.swarm_name
      );
    });

    setSwarmLogs(validLogs || []);
    setErrorLogs(error);
    setIsLoadingLogs(isLoading);
  }, [logs, isLoading, error]);

  useEffect(() => {
    if (swarmLogs.length > 0) {
      const data = getProcessedData(swarmLogs, metric, sortOrder, limit);
      setProcessedData(data);
    }
  }, [swarmLogs, metric, sortOrder, limit]);

  const processData = getProcessedData(swarmLogs, metric, sortOrder, limit);

  const getTooltipFormatter = (value: number, name: string) => {
    return formatValue(value, metric);
  };

  const fetchData = async () => {
    if (!apiKey) return;
    setErrorLogs(null);
    setIsLoadingLogs(true);

    try {
      const response = await fetchSwarmLogs(apiKey);

      if (!response.logs || !Array.isArray(response.logs)) {
        throw new Error('Invalid logs data received');
      }

      const validLogs = response?.logs?.filter((log) => {
        return (
          log &&
          log.data?.execution_time !== undefined &&
          log.data?.usage &&
          typeof log.data.usage.input_tokens === 'number' &&
          typeof log.data.usage.output_tokens === 'number' &&
          log.data?.status &&
          log.created_at &&
          log.data?.swarm_name
        );
      });

      setSwarmLogs(validLogs);
      setErrorLogs(null);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setErrorLogs(
        error instanceof Error ? error.message : 'Failed to load logs',
      );
      setSwarmLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  if (isLoadingLogs) {
    return (
      <Card className={`${className} border border-white/20 bg-card`}>
        <CardHeader>
          <CardTitle>Swarm Comparison</CardTitle>
          <CardDescription>Loading swarm performance data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading swarm data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorLogs) {
    return (
      <Card className={`${className} border border-white/20 bg-card`}>
        <CardHeader>
          <CardTitle>Swarm Comparison</CardTitle>
          <CardDescription>Error loading swarm data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertOctagon className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{errorLogs}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="mt-2 border border-white/20"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Card className={`${className} border border-white/20 bg-card`}>
        <CardHeader>
          <CardTitle>Swarm Comparison</CardTitle>
          <CardDescription>No swarm data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              No swarm execution data found. Run some swarms to see comparison
              data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border border-white/20 bg-card`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Swarm Comparison</CardTitle>
            <CardDescription>
              Compare performance metrics across different swarms
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Select
                value={metric}
                onValueChange={(value) => {
                  setMetric(value as any);
                  setProcessedData(processData);
                }}
              >
                <SelectTrigger className="w-[180px] border border-white/20">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executionTime">Execution Time</SelectItem>
                  <SelectItem value="tokenCount">Token Usage</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="successRate">Success Rate</SelectItem>
                  <SelectItem value="agentCount">Agent Count</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  setProcessedData(processData);
                }}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                className="border border-white/20"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
            <Tabs
              value={chartType}
              onValueChange={(value) =>
                setChartType(value as 'bar' | 'comparison')
              }
            >
              <TabsList className="h-9 border border-white/20">
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              title="Refresh Data"
              className="border border-white/20"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === 'bar' ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.1)"
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  label={{
                    value: getMetricLabel(metric),
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  formatter={getTooltipFormatter}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend />
                <Bar
                  dataKey={metric}
                  name={getMetricLabel(metric)}
                  radius={[4, 4, 0, 0]}
                  fill="hsl(var(--foreground))"
                >
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey={metric}
                    position="top"
                    formatter={(value: number) => formatValue(value, metric)}
                    style={{ fontSize: '10px', fill: 'hsl(var(--muted-foreground))' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-sm font-medium">Swarm Name</th>
                  <th className="text-left p-2 text-sm font-medium">Type</th>
                  <th className="text-right p-2 text-sm font-medium">Execution Time</th>
                  <th className="text-right p-2 text-sm font-medium">Token Usage</th>
                  <th className="text-right p-2 text-sm font-medium">Cost</th>
                  <th className="text-right p-2 text-sm font-medium">Success Rate</th>
                  <th className="text-right p-2 text-sm font-medium">Agents</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((swarm, index) => (
                  <tr
                    key={swarm.id}
                    className="border-b border-white/20 hover:bg-white/5"
                  >
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: swarm.color }}
                        ></div>
                        <span className="text-sm">{swarm.name}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="border border-white/20">
                        {swarm.swarmType}
                      </Badge>
                    </td>
                    <td className="text-right p-2 text-sm">
                      {formatValue(swarm.executionTime, 'executionTime')}
                    </td>
                    <td className="text-right p-2 text-sm">
                      {formatValue(swarm.tokenCount, 'tokenCount')}
                    </td>
                    <td className="text-right p-2 text-sm">
                      {formatValue(swarm.cost, 'cost')}
                    </td>
                    <td className="text-right p-2">
                      <Badge
                        variant="outline"
                        className={
                          swarm.successRate > 90
                            ? 'border-green-500 text-green-500'
                            : swarm.successRate > 70
                              ? 'border-yellow-500 text-yellow-500'
                              : 'border-destructive text-destructive'
                        }
                      >
                        {formatValue(swarm.successRate, 'successRate')}
                      </Badge>
                    </td>
                    <td className="text-right p-2 text-sm">
                      {formatValue(swarm.agentCount, 'agentCount')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
