'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useWallet } from '@/shared/components/marketplace/wallet-provider';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  Download,
  Loader2 
} from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

interface SmartWalletInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function SmartWalletInput({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = '',
}: SmartWalletInputProps) {
  const { toast } = useToast();
  const { publicKey, isConnected, isConnecting, connect } = useWallet();
  
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);

  const MAX_CONNECTION_ATTEMPTS = 3;

  useEffect(() => {
    if (isConnected && publicKey && !value) {
      onChange(publicKey);
    }
  }, [isConnected, publicKey, value, onChange]);

  useEffect(() => {
    const autoConnect = async () => {
      if (!isConnected && !showManualInput && connectionAttempts === 0) {
        const wasDisconnected = typeof window !== 'undefined' &&
          localStorage.getItem('phantom-disconnected') === 'true';

        if (!wasDisconnected) {
          if (typeof window !== 'undefined' && (window as any)?.solana?.isPhantom) {
            setIsAutoConnecting(true);
            try {
              await connect();
              setConnectionAttempts(1);
            } catch (error) {
              console.log('Auto-connect failed, will show manual option');
              setConnectionAttempts(1);
            } finally {
              setIsAutoConnecting(false);
            }
          } else {
            setShowManualInput(true);
          }
        } else {
          setShowManualInput(false);
        }
      }
    };

    autoConnect();
  }, [connect, isConnected, showManualInput, connectionAttempts]);

  const handleConnectWallet = async () => {
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      setShowManualInput(true);
      return;
    }

    try {
      await connect();
      setConnectionAttempts(prev => prev + 1);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('phantom-disconnected');
      }

      toast({
        title: 'Wallet Connected',
        description: 'Your Phantom wallet has been connected successfully.',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setConnectionAttempts(prev => prev + 1);

      let errorMessage = error?.message || 'Failed to connect wallet';

      if (errorMessage.includes('Phantom wallet not found')) {
        toast({
          title: 'Phantom Wallet Required',
          description: (
            <div className="space-y-2">
              <p>Phantom wallet not detected. Please install Phantom wallet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://phantom.com/', '_blank')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Phantom Wallet
              </Button>
            </div>
          ),
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: errorMessage,
          variant: 'destructive',
          duration: 5000,
        });
      }

      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS - 1) {
        setTimeout(() => {
          setShowManualInput(true);
          toast({
            title: 'Manual Input Available',
            description: 'You can now enter your wallet address manually.',
            duration: 5000,
          });
        }, 2000);
      }
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const handleManualToggle = () => {
    setShowManualInput(!showManualInput);
    if (!showManualInput) {
      onChange('');
    }
  };

  if (isConnected && publicKey && value === publicKey && !showManualInput) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Wallet Connected
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                {formatAddress(publicKey)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualToggle}
            className="text-green-600 hover:text-green-700"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          ✅ Your connected wallet address will be used automatically. 
          Click the edit icon to enter a different address manually.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!showManualInput && !isConnected ? (
        <div className="space-y-3">
          {/* Phantom Detection */}
          {typeof window !== 'undefined' && !(window as any)?.solana?.isPhantom ? (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Phantom Wallet Required
                </p>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                To automatically use your wallet address, please install Phantom wallet.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://phantom.com/', '_blank')}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Phantom
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualInput(true)}
                  className="flex-1"
                >
                  Enter Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting || isAutoConnecting || disabled}
                className="w-full"
                variant="outline"
              >
                {isConnecting || isAutoConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Phantom Wallet
                  </>
                )}
              </Button>
              
              {connectionAttempts > 0 && connectionAttempts < MAX_CONNECTION_ATTEMPTS && (
                <p className="text-xs text-muted-foreground text-center">
                  Connection attempt {connectionAttempts}/{MAX_CONNECTION_ATTEMPTS}. 
                  {connectionAttempts >= 2 && ' Manual input will be available after next attempt.'}
                </p>
              )}
              
              {connectionAttempts > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualInput(true)}
                  className="w-full text-xs"
                >
                  Or enter wallet address manually
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Your Wallet Address <span className="text-red-500">*</span>
            </label>
            {!isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualInput(false)}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Wallet
              </Button>
            )}
          </div>
          
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="Enter your Solana wallet address..."
            disabled={disabled}
            className={`font-mono text-sm ${error ? 'border-red-500' : ''} ${className}`}
          />
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <p className="text-xs text-muted-foreground">
            💡 Platform takes 10% commission. You&apos;ll receive 90% of the sale price.
          </p>
        </div>
      )}
    </div>
  );
}
