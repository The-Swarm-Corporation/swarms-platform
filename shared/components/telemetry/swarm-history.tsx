'use client';

import { useEffect, useState } from 'react';
import { Clock, RefreshCcw } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import {
  fetchSwarmLogs,
  type SwarmLog,
} from '@/shared/utils/api/telemetry/api';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { useAPIKeyContext } from '../ui/apikey.provider';
import { estimateTokenCost } from '@/shared/utils/helpers';
import { getDisplaySwarmName } from './helper';

interface SwarmHistoryProps {
  limit?: number;
}

export function SwarmHistory({ limit }: { limit?: number }) {
  const [logs, setLogs] = useState<SwarmLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    if (!apiKey) return;

    const loadLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchSwarmLogs(apiKey);

        if (!Array.isArray(response?.logs)) {
          throw new Error('Invalid logs data received');
        }

        const sortedLogs = response?.logs
          .filter((log) => {
            const usage = log.data?.usage;
            return (
              typeof log.data?.execution_time === 'number' &&
              usage &&
              typeof usage.input_tokens === 'number' &&
              typeof usage.output_tokens === 'number'
            );
          })
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

        setLogs(limit ? sortedLogs.slice(0, limit) : sortedLogs);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load logs';
        setError(message);
        setLogs([]);

        if (message.includes('API key')) {
          setError(
            'Please configure your API key in the dashboard to view execution history. Click here to configure your API key.',
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [limit, apiKey, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(limit || 5)].map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800 rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-950/10 border-red-900">
        <div className="text-red-500">
          <h3 className="font-semibold mb-2">Error Loading History</h3>
          {error.includes('API key') ? (
            <p className="mb-4">
              <Link href="/dashboard" className="underline hover:text-red-400">
                {error}
              </Link>
            </p>
          ) : (
            <p className="mb-4">{error}</p>
          )}
          <Button
            onClick={handleRetry}
            variant="outline"
            className="border-red-900 text-red-500 hover:bg-red-950/50"
            size="sm"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-4 bg-white dark:bg-zinc-900 border-red-500/50">
        <p className="text-zinc-600 dark:text-white text-center">
          No swarm history found
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const { input_tokens, output_tokens } = log.data.usage;
        const { totalCost } = estimateTokenCost(input_tokens, output_tokens);
        const swarmName = getDisplaySwarmName(
          log.data.swarm_name,
          log.data.description,
        );

        return (
          <div key={log.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-sm font-medium text-white">{swarmName}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(log.created_at).toLocaleString()} •{' '}
                  {log.data.execution_time.toFixed(2)}s • $
                  {totalCost.toFixed(4)}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                log.data.status === 'success'
                  ? 'border-green-500 text-green-500'
                  : 'border-red-500 text-red-500'
              }
            >
              {log.data.status}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
