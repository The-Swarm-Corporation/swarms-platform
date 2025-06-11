'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { RefreshCcw, Search, Download } from 'lucide-react';
import {
  fetchSwarmLogs,
  type SwarmLog,
} from '@/shared/utils/api/telemetry/api';
import { useAPIKeyContext } from '@/shared/components/ui/apikey.provider';
import { estimateTokenCost } from '@/shared/utils/helpers';
import { getDisplaySwarmName } from '@/shared/components/telemetry/helper';

export default function HistoryPage() {
  const [search, setSearch] = useState('');
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

        if (!response.logs || !Array.isArray(response.logs)) {
          throw new Error('Invalid logs data received');
        }

        const validLogs = response.logs.filter((log) => {
          return (
            log.data?.status &&
            typeof log.data?.execution_time === 'number' &&
            typeof log.data?.usage?.total_tokens === 'number' &&
            log.created_at
          );
        });

        const sortedLogs = validLogs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setLogs(sortedLogs);
      } catch (err) {
        console.error('Error loading logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load logs');
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [apiKey, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const filteredLogs = logs.filter(
    (log) =>
      (log.data?.swarm_name || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (log.data?.description || '')
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const exportToCSV = () => {
    try {
      const headers = [
        'Swarm Name',
        'Status',
        'Start Time',
        'Duration (s)',
        'Tokens',
        'Cost ($)',
        'Description',
      ];

      const csvContent = [
        headers.join(','),
        ...filteredLogs.map((log) => {
          const totalCost = log.data?.usage
            ? estimateTokenCost(
                log.data.usage.input_tokens,
                log.data.usage.output_tokens,
              ).totalCost
            : 0;
          const row = [
            log.data?.swarm_name,
            log.data?.status,
            new Date(log?.created_at).toLocaleString(),
            log.data?.execution_time?.toFixed(2),
            log.data?.usage?.total_tokens.toLocaleString(),
            totalCost,
            `"${(log.data.description || '').replace(/"/g, '""')}"`,
          ];
          return row.join(',');
        }),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `swarm-history-${new Date().toISOString().split('T')[0]}.csv`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV file');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/4" />
          <div className="h-[400px] bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-4 bg-red-950/10 border-red-900">
          <div className="text-primary">
            <h3 className="font-semibold mb-2">Error Loading History</h3>
            <p className="mb-4">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border-red-900 text-primary hover:bg-red-950/50"
              size="sm"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <p className="text-zinc-400 text-center">
            No execution history found
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-red-600">Execution History</h1>
        <p className="text-zinc-900 dark:text-zinc-400">
          View and analyze past swarm executions
        </p>
      </div>

      <Card className="border-red-500/50">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              />
            </div>
            <Button
              variant="outline"
              className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400"
              onClick={exportToCSV}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-primary/70 font-bold">Swarm Name</TableHead>
              <TableHead className="text-primary/70 font-bold">Status</TableHead>
              <TableHead className="text-primary/70 font-bold">Start Time</TableHead>
              <TableHead className="text-primary/70 font-bold">Duration</TableHead>
              <TableHead className="text-primary/70 font-bold">Tokens</TableHead>
              <TableHead className="text-primary/70 font-bold">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs?.map((log) => {
              const swarmName = getDisplaySwarmName(
                log?.data?.swarm_name,
                log?.data?.description,
              );
              const { totalCost } = estimateTokenCost(
                log.data?.usage?.input_tokens,
                log.data?.usage?.output_tokens,
              );
              return (
                <TableRow
                  key={log.id}
                  className="border-zinc-800 hover:bg-zinc-800/50"
                >
                  <TableCell className="font-medium text-red-600">
                    {swarmName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.data.status === 'success'
                          ? 'border-green-500 text-green-500'
                          : 'border-red-500 text-primary'
                      }
                    >
                      {log.data.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.data?.execution_time.toFixed(2)}s</TableCell>
                  <TableCell>
                    {log.data?.usage?.total_tokens.toLocaleString()}
                  </TableCell>
                  <TableCell>${totalCost.toFixed(4)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
