'use client';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { User } from '@supabase/supabase-js';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Button } from '@/shared/components/ui/button';
import { Download, History, Loader2 } from 'lucide-react';
import { WalletProvider, useWallet } from '@/shared/components/marketplace/wallet-provider';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
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
                      {solBalance.toFixed(4)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="ml-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500
                           text-red-500 rounded-lg transition duration-300 ease-in-out
                           hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  DISCONNECT
                </button>
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

              {/* Miniature Transaction History */}
              {user && (
                <div className="bg-black/60 border border-red-500/30 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-red-400">Recent Transactions</h3>
                    <Link href="/platform/account/transactions">
                      <button className="text-sm text-red-400 hover:text-red-300 underline">
                        View All
                      </button>
                    </Link>
                  </div>

                  {transactionsLoading ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-red-400" />
                    </div>
                  ) : recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction: any) => (
                        <div key={transaction.id} className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-red-500/20">
                          <div>
                            <p className="text-sm font-medium text-gray-300 capitalize">
                              {transaction.item_type} {transaction.buyer_id === user.id ? 'Purchase' : 'Sale'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-400">
                              {transaction.amount} SOL
                            </p>
                            <p className={`text-xs capitalize ${
                              transaction.status === 'completed' ? 'text-green-400' :
                              transaction.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">No transactions yet</p>
                      <p className="text-sm text-gray-500">Your marketplace transactions will appear here</p>
                    </div>
                  )}
                </div>
              )}
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