'use client';

import { MonitoringStats } from '@/shared/components/telemetry/monitoring-stats';
import { ApiKeyForm } from '@/shared/components/telemetry/api-key-form';
import { SwarmComparison } from '@/shared/components/telemetry/swarm-comparison-chart';
import { UsageOverview } from '@/shared/components/telemetry/usage-overview';
import { fetchSwarmLogs, SwarmLog } from '@/shared/utils/api/telemetry/api';
import { useEffect, useState } from 'react';
import { useAPIKeyContext } from '@/shared/components/ui/apikey.provider';

export default function DashboardMetrics() {
  const [logs, setLogs] = useState<SwarmLog[]>([]);
  const { apiKey } = useAPIKeyContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!apiKey) return;
    setError(null);

    try {
      const response = await fetchSwarmLogs(apiKey);
      
      if (!response?.logs || !Array.isArray(response.logs)) {
        throw new Error('Invalid API response format');
      }

      setLogs(response?.logs || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [apiKey]);

  return (
    <>
      <ApiKeyForm />

      <MonitoringStats logs={logs} isLoading={isLoading} error={error} />

      <UsageOverview logs={logs} isLoading={isLoading} error={error} />

      <SwarmComparison
        limit={5}
        logs={logs}
        isLoading={isLoading}
        error={error}
        className="border-red-500/50 hover:border-red-600 hover:shadow-lg transition-all duration-200"
      />
    </>
  );
}
