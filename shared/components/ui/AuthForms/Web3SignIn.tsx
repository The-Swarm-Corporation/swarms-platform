'use client';

import { Button } from '@/shared/components/ui/button';
import { generateWeb3AuthNonce, signInWithWeb3 } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useWallet } from '@/shared/components/marketplace/wallet-provider';
import { AlertCircle, Wallet } from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

interface Web3SignInProps {
  redirectMethod: string;
}

export default function Web3SignIn({ redirectMethod }: Web3SignInProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNonce, setIsGeneratingNonce] = useState(false);
  const { publicKey, isConnected, connect, isConnecting } = useWallet();
  const { toast } = useToast();

  const handleWeb3SignIn = async () => {
    if (!isConnected || !publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingNonce(true);

    try {
      const nonceFormData = new FormData();
      nonceFormData.append('walletAddress', publicKey);
      
      const nonceResult = await generateWeb3AuthNonce(nonceFormData);
      
      if (nonceResult.error || !nonceResult.nonce || !nonceResult.message) {
        toast({
          title: 'Authentication failed',
          description: nonceResult.error || 'Failed to generate authentication challenge',
          variant: 'destructive',
        });
        return;
      }

      setIsGeneratingNonce(false);
      setIsSubmitting(true);

      const provider = (window as any)?.solana;
      if (!provider?.signMessage) {
        toast({
          title: 'Wallet error',
          description: 'Your wallet does not support message signing.',
          variant: 'destructive',
        });
        return;
      }

      const messageBytes = new TextEncoder().encode(nonceResult.message);
      const signatureResult = await provider.signMessage(messageBytes);
      const signature = Array.from(signatureResult.signature as Uint8Array).map((b: number) => b.toString(16).padStart(2, '0')).join('');

      const tempForm = document.createElement('form');

      const walletInput = document.createElement('input');
      walletInput.name = 'walletAddress';
      walletInput.value = publicKey;
      tempForm.appendChild(walletInput);

      const signatureInput = document.createElement('input');
      signatureInput.name = 'signature';
      signatureInput.value = signature;
      tempForm.appendChild(signatureInput);

      const nonceInput = document.createElement('input');
      nonceInput.name = 'nonce';
      nonceInput.value = nonceResult.nonce;
      tempForm.appendChild(nonceInput);

      const fakeEvent = {
        preventDefault: () => {},
        currentTarget: tempForm
      } as React.FormEvent<HTMLFormElement>;

      await handleRequest(
        fakeEvent,
        signInWithWeb3,
        redirectMethod === 'client' ? router : null
      );

    } catch (error: any) {
      console.error('Web3 sign-in error:', error);
      toast({
        title: 'Authentication failed',
        description: error.message || 'Failed to authenticate with wallet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsGeneratingNonce(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const isWeb3Enabled = process.env.NEXT_PUBLIC_WEB3_AUTH_ENABLED === 'true';
  
  if (!isWeb3Enabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      {typeof window !== 'undefined' && !(window as any)?.solana?.isPhantom && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            Phantom wallet not detected.{' '}
            <button
              onClick={() => window.open('https://phantom.com/', '_blank')}
              className="underline hover:no-underline"
            >
              Install here
            </button>
          </span>
        </div>
      )}

      {!isConnected ? (
        <Button
          onClick={handleConnectWallet}
          disabled={isConnecting}
          variant="outline"
          className="w-full"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <Wallet className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Wallet connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
            </span>
          </div>
          
          <Button
            onClick={handleWeb3SignIn}
            disabled={isSubmitting || isGeneratingNonce}
            className="w-full"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isGeneratingNonce 
              ? 'Generating challenge...' 
              : isSubmitting 
                ? 'Signing in...' 
                : 'Sign in with Wallet'
            }
          </Button>
        </div>
      )}
    </div>
  );
}
