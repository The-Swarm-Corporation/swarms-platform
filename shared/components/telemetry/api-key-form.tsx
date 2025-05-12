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
import { KeyRound } from 'lucide-react';
import { useAPIKeyContext } from '../ui/apikey.provider';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '../ui/Toasts/use-toast';
import confetti from 'canvas-confetti';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import GenerateKeyComponent from '@/modules/platform/api-keys/components/generate-key';

export function ApiKeyForm() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>('');

  const { apiKey: existingApiKey, refetch } = useAPIKeyContext();
  const addApiKey = trpc.apiKey.addApiKey.useMutation();

  const [keyName, setKeyName] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (existingApiKey) {
      setApiKey(existingApiKey);
    }
  }, [existingApiKey]);

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

  const generate = async () => {
    if (addApiKey.isPending) {
      return;
    }

    try {
      const user = await checkUserSession();

      if (!user) {
        toast({
          description: 'You need to be logged in to generate an API key',
          variant: 'destructive',
        });
        return;
      }

      const data = await addApiKey.mutateAsync({ name: keyName });

      setKeyName('');
      setApiKey(data?.key ?? '');
      refetch();

      toast({
        description: 'API key created',
        style: { backgroundColor: '#10B981', color: 'white' },
      });

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (error: any) {
      toast({
        description:
          error.message || 'An error occurred while creating API key',
        variant: 'destructive',
      });
    }
  };

  const apiKeyHandler = async () => {
    if (apiKey) {
      handleCopy();
    } else {
      await generate();
    }
  };

  const validateAndSaveKey = async () => {
    if (!apiKey) {
      toast({
        description: 'Please enter an API key',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(
        'https://swarms-api-285321057562.us-east1.run.app/health',
        {
          headers: {
            'x-api-key': apiKey,
          },
        },
      );

      if (response.ok) {
        toast({
          description: 'API key validated and saved successfully',
          style: { backgroundColor: '#10B981', color: 'white' },
        });
      } else {
        toast({
          description: 'Invalid API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        description: 'Failed to validate API key',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="bg-zinc-100 dark:bg-zinc-900 border-red-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <KeyRound className="h-5 w-5 text-red-500" />
          API Key Configuration
        </CardTitle>
        <CardDescription>
          {apiKey
            ? 'The Swarms API key is automatically enabled. You can view your usage data in the Swarms Cloud dashboard.'
            : 'Create a new Swarms API key to get started. You can find your API key in the Swarms Cloud dashboard.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            readOnly
            value={'.................................'}
            onChange={(e) => e.preventDefault()}
            placeholder="Enter your API key"
            className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <GenerateKeyComponent
            {...{
              apiKey,
              page: 'telemetry',
              addApiKey,
              generate: apiKeyHandler,
              setKeyName,
              keyName,
              generatedKey: apiKey,
              setGeneratedKey: setApiKey,
            }}
          />
          <Button
            onClick={validateAndSaveKey}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate API Key'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
