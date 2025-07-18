'use client';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { User } from '@supabase/supabase-js';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Button } from '@/shared/components/ui/button';
import { Download, History, Loader2, LogOut, AlertTriangle } from 'lucide-react';
import { WalletProvider, useWallet } from '@/shared/components/marketplace/wallet-provider';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CompactPriceDisplay } from '@/shared/components/marketplace/price-display';
import { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

const MarketplaceWalletContent = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const { publicKey, isConnected, isConnecting, connect, disconnect, solBalance, refreshBalance } = useWallet();
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const disconnectRef = useRef<HTMLDivElement>(null);

  // Close disconnect confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (disconnectRef.current && !disconnectRef.current.contains(event.target as Node)) {
        setShowDisconnectConfirm(false);
      }
    };

    if (showDisconnectConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDisconnectConfirm]);

  const saveWalletMutation = trpc.marketplace.saveUserWallet.useMutation({
    onSuccess: () => {
      toast({
        description: 'Wallet connected successfully for marketplace',
        style: { backgroundColor: '#10B981', color: 'white' },
      });
    },
    onError: (error) => {
      toast({
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get recent transactions for miniature history
  const { data: transactions, isLoading: transactionsLoading } = trpc.marketplace.getUserTransactions.useQuery(
    { type: 'all' },
    {
      enabled: !!user?.id && isConnected,
      refetchOnWindowFocus: false,
    }
  );

  const handleConnect = async () => {
    try {
      await connect();

      // Save wallet to database
      if (publicKey) {
        await saveWalletMutation.mutateAsync({
          walletAddress: publicKey,
        });
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);

      // Show specific error message with helpful guidance
      let errorMessage = error?.message || 'Failed to connect wallet. Please try again.';

      // Add installation link for Phantom wallet not found errors
      if (errorMessage.includes('Phantom wallet not found')) {
        toast({
          description: (
            <div className="space-y-2">
              <p>{errorMessage}</p>
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
          duration: 8000, // Longer duration for installation message
        });
      } else {
        toast({
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      setShowDisconnectConfirm(false);
      toast({
        title: 'Wallet Disconnected',
        description: 'Your Phantom wallet has been disconnected from the marketplace.',
        style: { backgroundColor: '#10B981', color: 'white' },
      });
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Disconnect Failed',
        description: error?.message || 'Failed to disconnect wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast({
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!user) return null;

  // Get recent transactions (limit to 3 for miniature view)
  const recentTransactions = transactions?.slice(0, 3) || [];

  return (
    <div className="bg-black text-red-500">
      <div className="max-w-3xl mx-auto md:p-6">
        <div className="bg-black/50 backdrop-blur-xl border-2 border-red-500/50 rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-red-500 mb-2 font-cyber">
              MARKETPLACE WALLET
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-transparent"></div>
          </div>

          {/* Wallet Connection */}

          {!isConnected ? (
            typeof window !== 'undefined' && !(window as any)?.solana?.isPhantom ? (
              <div className="space-y-4">
                <div className="w-full flex items-center justify-center bg-red-500/20 border border-red-500 text-red-500
                             font-bold py-4 px-6 rounded-lg mb-6">
                  Phantom wallet not detected
                </div>
                <button
                  onClick={() => window.open('https://phantom.com/', '_blank')}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-500
                           font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out
                           hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  INSTALL PHANTOM
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-500
                         font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out
                         hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-6"
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT PHANTOM'}
              </button>
            )
      ) : (
            <div className="space-y-6">
              {/* Wallet Info */}
              <div className="flex justify-between items-center mb-6">
                <div className="grid grid-cols-2 gap-4 flex-grow">
                  <div className="bg-black/60 border border-red-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400">
                      CONNECTED WALLET
                    </div>
                    <div className="font-mono text-red-400">
                      {formatAddress(publicKey ?? "")}
                    </div>
                  </div>
                  <div className="bg-black/60 border border-red-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400">SOL BALANCE</div>
                    <div className="font-mono text-red-400">
                      <CompactPriceDisplay solAmount={solBalance} />
                    </div>
                  </div>
                </div>
                <div className="ml-4 relative" ref={disconnectRef}>
                  {!showDisconnectConfirm ? (
                    <button
                      onClick={() => setShowDisconnectConfirm(true)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500
                               text-red-500 rounded-lg transition duration-300 ease-in-out
                               hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      DISCONNECT
                    </button>
                  ) : (
                    <div className="bg-black/90 border border-red-500 rounded-lg p-4 absolute right-0 top-0 z-10 min-w-[280px] shadow-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-500">Confirm Disconnect</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-4">
                        Are you sure you want to disconnect your wallet? You&apos;ll need to reconnect to make marketplace transactions.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDisconnect}
                          disabled={isDisconnecting}
                          className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded
                                   transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2"
                        >
                          {isDisconnecting ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            <>
                              <LogOut className="h-3 w-3" />
                              Disconnect
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowDisconnectConfirm(false)}
                          disabled={isDisconnecting}
                          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded
                                   transition duration-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Marketplace Features */}
              <div className="bg-black/60 border border-red-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-400">Marketplace Features</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Buy premium prompts and agents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Sell your own prompts and agents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Receive payments directly to your wallet</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Platform takes 10% commission on sales</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyAddress}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500
                             text-red-500 rounded-lg transition duration-300 ease-in-out
                             hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  >
                    COPY ADDRESS
                  </button>
                  <button
                    onClick={refreshBalance}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500
                             text-red-500 rounded-lg transition duration-300 ease-in-out
                             hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  >
                    REFRESH
                  </button>
                </div>
              </div>


            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MarketplaceWallet = ({ user }: { user: User | null }) => {
  return (
    <WalletProvider>
      <MarketplaceWalletContent user={user} />
    </WalletProvider>
  );
};

export default MarketplaceWallet;