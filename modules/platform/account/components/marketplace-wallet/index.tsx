'use client';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Wallet, ExternalLink, Copy, CheckCircle, History } from 'lucide-react';
import { WalletProvider, useWallet } from '@/shared/components/marketplace/wallet-provider';
import MarketplaceTransactions from './marketplace-transactions';

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

  const { data: userWallet } = trpc.marketplace.getUserWallet.useQuery(
    undefined,
    { enabled: !!user?.id }
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
    } catch (error) {
      toast({
        description: 'Failed to connect wallet',
        variant: 'destructive',
      });
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
        <p className="text-muted-foreground">
          Manage your wallet and view transaction history
        </p>
      </div>

      <Tabs defaultValue="wallet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-4">

      {!isConnected ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </CardTitle>
            <CardDescription>
              Connect your Phantom wallet to buy and sell prompts and agents
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Wallet Connected
                </span>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <p className="font-mono">{formatAddress(publicKey ?? "")}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://explorer.solana.com/address/${publicKey}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">SOL Balance</p>
                  <p className="font-semibold">
                    {`${solBalance.toFixed(4)} SOL`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshBalance}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketplace Features</CardTitle>
              <CardDescription>
                What you can do with your connected wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Buy premium prompts and agents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sell your own prompts and agents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Receive payments directly to your wallet</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Platform takes 10% commission on sales</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <MarketplaceTransactions user={user} />
        </TabsContent>
      </Tabs>
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
