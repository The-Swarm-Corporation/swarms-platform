'use client';

import { useState, useEffect } from 'react';

interface AppConfig {
  rpcUrl: string;
  openAPIKey: string;
  marketplaceEnabled: boolean;
  platformWalletAddress: string;
  solanaNetwork: string;
}

export const useConfig = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/config');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
        
        const data = await response.json();
        setConfig(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching config:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch config');
        setConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return {
    config,
    isLoading,
    error,
    // Helper getters
    rpcUrl: config?.rpcUrl,
    platformWalletAddress: config?.platformWalletAddress,
    marketplaceEnabled: config?.marketplaceEnabled ?? false,
    solanaNetwork: config?.solanaNetwork ?? 'mainnet-beta',
  };
};
