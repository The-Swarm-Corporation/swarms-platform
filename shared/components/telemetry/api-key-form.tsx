'use client';

import { useEffect, useState } from 'react';
import { useAPIKeyContext } from '../ui/apikey.provider';
import { useToast } from '../ui/Toasts/use-toast';

/**
 * ApiKeyForm - Simple API key usage that relies on the context system
 * 
 * This component now:
 * 1. Waits for the API key context to finish loading
 * 2. Uses whatever API key the context provides (existing or newly created)
 * 3. Does not duplicate the key creation logic - lets the context handle it
 * 4. Focuses on using the key for telemetry purposes
 * 
 * The APIkeyProvider is configured with isCreateAutoKey={true}, which means:
 * - It will first search for existing API keys in the database
 * - If no existing keys are found, it will automatically create a new one
 * - This prevents the duplicate key creation issue that was happening before
 */
export function ApiKeyForm() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>('');
  const [isLoading, setIsLoading] = useState(true);
  const [telemetryData, setTelemetryData] = useState<any>(null);

  const { 
    apiKey: existingApiKey, 
    isApiKeyLoading, 
    isInitializing,
    isCreatingApiKey 
  } = useAPIKeyContext();

  useEffect(() => {
    const initializeApiKey = async () => {
      try {
        setIsLoading(true);
        
        // Wait for the API key context to finish loading and initializing
        if (isApiKeyLoading || isInitializing || isCreatingApiKey.current) {
          return;
        }
        
        // Use whatever API key the context provides
        if (existingApiKey) {
          setApiKey(existingApiKey);
          await fetchTelemetryData(existingApiKey);
        }
        // If no API key, the context will handle creating one automatically
        // We don't need to duplicate that logic here
      } catch (error) {
        console.error('Error initializing API key:', error);
        toast({
          description: 'Failed to initialize API key',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApiKey();
  }, [existingApiKey, isApiKeyLoading, isInitializing, isCreatingApiKey.current]);

  const fetchTelemetryData = async (key: string) => {
    try {
      const response = await fetch(
        'https://swarms-api-285321057562.us-east1.run.app/health',
        {
          headers: {
            'x-api-key': key,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setTelemetryData(data);
      } else {
        console.error('Failed to fetch telemetry data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching telemetry data:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(apiKey ?? '')
      .then(() => {
        toast({
          description: 'Copied to clipboard',
          style: { backgroundColor: '#10B981', color: 'white' },
        });
      })
      .catch((e) => console.error(e));
  };

  // Component runs in background - no UI needed
  return null;
}
