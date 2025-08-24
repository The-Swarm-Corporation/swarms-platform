'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { KeyRound, Loader2 } from 'lucide-react';
import { useAPIKeyContext } from '../ui/apikey.provider';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '../ui/Toasts/use-toast';
import confetti from 'canvas-confetti';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import GenerateKeyComponent from '@/modules/platform/api-keys/components/generate-key';

export function ApiKeyForm() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>('');
  const [isLoading, setIsLoading] = useState(true);
  const [telemetryData, setTelemetryData] = useState<any>(null);

  const { apiKey: existingApiKey, refetch } = useAPIKeyContext();
  const addApiKey = trpc.apiKey.addApiKey.useMutation();

  useEffect(() => {
    const initializeApiKey = async () => {
      try {
        setIsLoading(true);
        
        // Check if user has an existing API key
        if (existingApiKey) {
          setApiKey(existingApiKey);
          await fetchTelemetryData(existingApiKey);
        } else {
          // Create a new API key if none exists
          await createAndFetchApiKey();
        }
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
  }, [existingApiKey]);

  const createAndFetchApiKey = async () => {
    try {
      const user = await checkUserSession();

      if (!user) {
        toast({
          description: 'You need to be logged in to generate an API key',
          variant: 'destructive',
        });
        return;
      }

      // Create a new API key with a default name
      const data = await addApiKey.mutateAsync({ name: 'Telemetry API Key' });
      const newApiKey = data?.key;
      
      if (newApiKey) {
        setApiKey(newApiKey);
        await refetch();
        await fetchTelemetryData(newApiKey);
        
        toast({
          description: 'API key created successfully',
          style: { backgroundColor: '#10B981', color: 'white' },
        });

        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
        });
      }
    } catch (error: any) {
      toast({
        description: error.message || 'An error occurred while creating API key',
        variant: 'destructive',
      });
    }
  };

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
