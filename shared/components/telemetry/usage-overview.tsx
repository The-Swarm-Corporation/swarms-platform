'use client';

import { useEffect, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AlertOctagon, Loader2 } from 'lucide-react';
import { useAPIKeyContext } from '../ui/apikey.provider';
import { ITelemetry, getCostFromLog } from './helper';

interface ChartData {
  date: string;
  tokens: number;
  credits: number;
  swarms: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <div className="mb-3 border-b border-white/20 pb-2">
          <span className="text-sm font-medium">
            {new Date(label).toLocaleDateString()}
          </span>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs uppercase text-muted-foreground">
              Tokens
            </span>
            <span className="text-sm font-medium">
              {payload[0].value?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs uppercase text-muted-foreground">
              Credits
            </span>
            <span className="text-sm font-medium">
              ${payload[1].value?.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs uppercase text-muted-foreground">
              Swarms
            </span>
            <span className="text-sm font-medium">
              {payload[2].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  if (!payload) return null;
  return (
    <div className="mt-4 flex justify-center gap-6">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm border border-white/20"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function UsageOverview({ logs, isLoading, error }: ITelemetry) {
  const [data, setData] = useState<ChartData[]>([]);
  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    if (!apiKey) return;

    const loadData = () => {
      const dailyDataMap = new Map<string, ChartData>();

      logs.forEach((log) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];

        if (!dailyDataMap.has(date)) {
          dailyDataMap.set(date, {
            date,
            tokens: 0,
            credits: 0,
            swarms: 0,
          });
        }

        const usage = log?.data?.usage;
        const dayData = dailyDataMap.get(date)!;

        dayData.swarms++;

        if (usage) {
          const { total_tokens } = usage;
          const totalCost = getCostFromLog(log);

          dayData.tokens += total_tokens;
          dayData.credits += totalCost;
        }
      });

      const chartData = Array.from(dailyDataMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setData(chartData);
    };

    loadData();
  }, [apiKey, logs]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-white/20 bg-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-white/20 bg-card">
        <div className="flex items-center gap-2 text-destructive">
          <AlertOctagon className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-white/20 bg-card">
        <span className="text-sm text-muted-foreground">
          No usage data available
        </span>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-lg border border-white/20 bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.1)"
          />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tokens"
            name="Tokens"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              strokeWidth: 2,
              fill: "hsl(var(--foreground))",
              stroke: "hsl(var(--foreground))",
            }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="credits"
            name="Credits"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              strokeWidth: 2,
              fill: "hsl(var(--muted-foreground))",
              stroke: "hsl(var(--muted-foreground))",
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="swarms"
            name="Swarms"
            stroke="hsl(var(--foreground)/0.6)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              strokeWidth: 2,
              fill: "hsl(var(--foreground)/0.6)",
              stroke: "hsl(var(--foreground)/0.6)",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
