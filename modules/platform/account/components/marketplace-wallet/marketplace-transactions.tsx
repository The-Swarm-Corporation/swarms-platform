'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { 
  ShoppingCart, 
  DollarSign, 
  ExternalLink, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatSOLAmount } from '@/shared/utils/marketplace/commission';

interface MarketplaceTransactionsProps {
  user: User | null;
}

const MarketplaceTransactions = ({ user }: MarketplaceTransactionsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'purchases' | 'sales'>('all');

  const {
    data: transactions,
    isLoading,
    refetch,
    isRefetching
  } = trpc.marketplace.getUserTransactions.useQuery(
    {
      type: activeTab
    },
    {
      enabled: !!user?.id,
      refetchOnWindowFocus: false,
    }
  );

  const { data: stats } = trpc.marketplace.getMarketplaceStats.useQuery(
    undefined,
    { refetchOnWindowFocus: false }
  );

  if (!user) return null;

  const formatSOL = (amount: number) => formatSOLAmount(amount);

  const getTransactionTypeColor = (transaction: any, userId: string) => {
    if (transaction.buyer_id === userId) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getTransactionIcon = (transaction: any, userId: string) => {
    if (transaction.buyer_id === userId) {
      return <TrendingDown className="h-4 w-4" />;
    } else {
      return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (transaction: any, userId: string) => {
    if (transaction.buyer_id === userId) {
      return 'Purchase';
    } else {
      return 'Sale';
    }
  };

  const getTransactionAmount = (transaction: any, userId: string) => {
    if (transaction.buyer_id === userId) {
      return transaction.amount;
    } else {
      return transaction.seller_amount;
    }
  };

  const calculateUserStats = () => {
    if (!transactions) return { totalPurchases: 0, totalSales: 0, totalSpent: 0, totalEarned: 0 };

    const purchases = transactions.filter(t => t.buyer_id === user.id);
    const sales = transactions.filter(t => t.seller_id === user.id);

    return {
      totalPurchases: purchases.length,
      totalSales: sales.length,
      totalSpent: purchases.reduce((sum, t) => sum + t.amount, 0),
      totalEarned: sales.reduce((sum, t) => sum + t.seller_amount, 0),
    };
  };

  const userStats = calculateUserStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold">{userStats.totalPurchases}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{userStats.totalSales}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatSOL(userStats.totalSpent)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">{formatSOL(userStats.totalEarned)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View your marketplace purchase and sales history
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading transactions...</p>
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'purchases' 
                      ? 'You haven\'t made any purchases yet.'
                      : activeTab === 'sales'
                      ? 'You haven\'t made any sales yet.'
                      : 'You don\'t have any marketplace transactions yet.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction, user.id)}
                              <Badge className={getTransactionTypeColor(transaction, user.id)}>
                                {getTransactionLabel(transaction, user.id)}
                              </Badge>
                            </div>

                            <div>
                              <p className="font-semibold capitalize">
                                {transaction.item_type} Purchase
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold">
                              {formatSOL(getTransactionAmount(transaction, user.id))}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {transaction.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(
                                  `https://explorer.solana.com/tx/${transaction.transaction_signature}`,
                                  '_blank'
                                )}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {transaction.buyer_id === user.id && (
                          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Item Price:</span>
                              <span>{formatSOL(transaction.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Platform Fee (10%):</span>
                              <span>{formatSOL(transaction.platform_fee)}</span>
                            </div>
                          </div>
                        )}

                        {transaction.seller_id === user.id && (
                          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Sale Price:</span>
                              <span>{formatSOL(transaction.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Platform Fee (10%):</span>
                              <span>-{formatSOL(transaction.platform_fee)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-foreground">
                              <span>You Received:</span>
                              <span>{formatSOL(transaction.seller_amount)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Platform Stats (Optional) */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                <p className="text-xs text-muted-foreground">Total Transactions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatSOL(stats.totalVolume)}</p>
                <p className="text-xs text-muted-foreground">Total Volume</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatSOL(stats.totalPlatformFees)}</p>
                <p className="text-xs text-muted-foreground">Platform Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketplaceTransactions;