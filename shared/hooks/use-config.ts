'use client';

import { useState, useEffect } from 'react';

interface AppConfig {
  rpcUrl: string;
  openAPIKey: string;
  marketplaceEnabled: boolean;
  platformWalletAddress: string;
  solanaNetwork: string;
}

// Cache config globally to prevent repeated API calls
let cachedConfig: AppConfig | null = null;
let configPromise: Promise<AppConfig> | null = null;

export const useConfig = () => {
  const [config, setConfig] = useState<AppConfig | null>(cachedConfig);
  const [isLoading, setIsLoading] = useState(!cachedConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setIsLoading(false);
      return;
    }

    if (configPromise) {
      configPromise
        .then((data) => {
          setConfig(data);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to fetch config');
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    const fetchConfig = async (): Promise<AppConfig> => {
      const response = await fetch('/api/config');

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }

      const data = await response.json();
      cachedConfig = data; // Cache the result
      return data;
    };

    setIsLoading(true);
    configPromise = fetchConfig();

    configPromise
      .then((data) => {
        setConfig(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching config:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch config');
        setConfig(null);
      })
      .finally(() => {
        setIsLoading(false);
        configPromise = null; // Clear the promise
      });
  }, []);

  return {
    config,
    isLoading,
    error,
    rpcUrl: config?.rpcUrl,
    platformWalletAddress: config?.platformWalletAddress,
    marketplaceEnabled: config?.marketplaceEnabled ?? false,
    solanaNetwork: config?.solanaNetwork ?? 'mainnet-beta',
  };
};
