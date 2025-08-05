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
      <div className="space-y-8 p-6 border border-white/20 rounded-lg bg-background/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-[400px] bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-destructive/5 border border-white/20">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error Loading History</h3>
            <p className="mb-4 text-sm">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border border-white/20 text-destructive hover:bg-destructive/10"
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
        <Card className="p-6 bg-card border border-white/20">
          <p className="text-muted-foreground text-center">
            No execution history found
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 border border-white/20 rounded-lg bg-background/50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
        <p className="text-sm text-muted-foreground mt-2">
          View and analyze past swarm executions
        </p>
      </div>

      <Card className="border border-white/20 bg-card">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background border border-white/20"
              />
            </div>
            <Button
              variant="outline"
              className="border border-white/20 hover:bg-white/10"
              onClick={exportToCSV}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-sm font-medium">Swarm Name</TableHead>
              <TableHead className="text-sm font-medium">Status</TableHead>
              <TableHead className="text-sm font-medium">Start Time</TableHead>
              <TableHead className="text-sm font-medium">Duration</TableHead>
              <TableHead className="text-sm font-medium">Tokens</TableHead>
              <TableHead className="text-sm font-medium">Cost</TableHead>
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
                  className="border-white/20 hover:bg-white/5"
                >
                  <TableCell className="font-medium">
                    {swarmName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.data.status === 'success'
                          ? 'border-green-500 text-green-500'
                          : 'border-destructive text-destructive'
                      }
                    >
                      {log.data.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{log.data?.execution_time.toFixed(2)}s</TableCell>
                  <TableCell className="text-sm">
                    {log.data?.usage?.total_tokens.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">${totalCost.toFixed(4)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
