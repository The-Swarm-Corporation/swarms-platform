'use client';

import { User } from '@supabase/supabase-js';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  ShoppingCart,
  DollarSign,
  CreditCard,
  Coins,
  Eye,
  ArrowRight,
  Receipt,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { USDPriceDisplay } from '@/shared/components/marketplace/price-display';
import Link from 'next/link';

interface PurchasesOverviewProps {
  user: User | null;
}

interface Transaction {
  id: string;
  type: 'marketplace' | 'credit' | 'subscription';
  subtype: 'purchase' | 'sale' | 'credit_purchase' | 'subscription_payment';
  amount: number;
  currency: 'SOL' | 'USD';
  status: string;
  created_at: string;
  description: string;
  item_type?: string;
}

const PurchasesOverview = ({ user }: PurchasesOverviewProps) => {
  const { data: marketplaceTransactions, isLoading: marketplaceLoading } =
    trpc.marketplace.getUserTransactions.useQuery(
      { type: 'all' },
      {
        enabled: !!user?.id,
        refetchOnWindowFocus: false,
      },
    );

  const { data: creditTransactions, isLoading: creditLoading } =
    trpc.dashboard.getCreditTransactions.useQuery(
      { userId: user?.id || '' },
      {
        enabled: !!user?.id,
        refetchOnWindowFocus: false,
      },
    );

  const { data: subscriptionStatus, isLoading: subscriptionLoading } =
    trpc.payment.getSubscriptionStatus.useQuery(undefined, {
      enabled: !!user?.id,
      refetchOnWindowFocus: false,
    });

  const isLoading = marketplaceLoading || creditLoading || subscriptionLoading;

  const itemIds = marketplaceTransactions
    ? Array.from(
        new Set(
          marketplaceTransactions
            .map((tx) => ({
              id: tx.item_id,
              type: tx.item_type as 'prompt' | 'agent',
            }))
            .filter(
              (item, index, self) =>
                self.findIndex(
                  (i) => i.id === item.id && i.type === item.type,
                ) === index,
            ),
        ),
      )
    : [];

  const { data: itemNamesData } = trpc.marketplace.getItemNames.useQuery(
    { itemIds },
    {
      enabled: itemIds.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const getItemName = (itemId: string, itemType: string): string => {
    const fetchedName = itemNamesData?.[itemId];
    if (fetchedName) {
      return fetchedName;
    }

    return `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} #${itemId.slice(0, 8)}`;
  };

  const getAllTransactions = (): Transaction[] => {
    const allTransactions: Transaction[] = [];

    if (marketplaceTransactions) {
      marketplaceTransactions.forEach((tx) => {
        const isUserBuyer = tx.buyer_id === user?.id;
        const isUserSeller = tx.seller_id === user?.id;

        if (isUserBuyer || isUserSeller) {
          const solAmount = isUserBuyer ? tx.amount : tx.seller_amount;
          const itemName = getItemName(tx.item_id, tx.item_type);

          allTransactions.push({
            id: tx.id,
            type: 'marketplace',
            subtype: isUserBuyer ? 'purchase' : 'sale',
            amount: solAmount,
            currency: 'SOL',
            status: tx.status,
            created_at: tx.created_at,
            description: `${itemName} ${isUserBuyer ? 'Purchase' : 'Sale'}`,
            item_type: tx.item_type,
          });
        }
      });
    }

    if (creditTransactions) {
      creditTransactions.forEach((tx: any) => {
        allTransactions.push({
          id: tx.id,
          type: 'credit',
          subtype: 'credit_purchase',
          amount: tx.amount_usd || 0,
          currency: 'USD',
          status: tx.status || 'completed',
          created_at: tx.created_at,
          description: `Credit Purchase - ${tx.credits_added} credits`,
        });
      });
    }

    if (subscriptionStatus?.status === 'active') {
      allTransactions.push({
        id: 'subscription-active',
        type: 'subscription',
        subtype: 'subscription_payment',
        amount: 0,
        currency: 'USD',
        status: 'active',
        created_at: new Date().toISOString(),
        description: 'Active Subscription',
      });
    }

    return allTransactions
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  };

  const recentTransactions = getAllTransactions();

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'marketplace':
        return transaction.subtype === 'purchase' ? ShoppingCart : DollarSign;
      case 'credit':
        return Coins;
      case 'subscription':
        return CreditCard;
      default:
        return Receipt;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'marketplace':
        return transaction.subtype === 'purchase'
          ? 'text-blue-500'
          : 'text-green-500';
      case 'credit':
        return 'text-purple-500';
      case 'subscription':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Marketplace</p>
              <p className="text-xl font-bold">
                {marketplaceTransactions?.filter(
                  (tx) => tx.buyer_id === user.id || tx.seller_id === user.id,
                ).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <Coins className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-xl font-bold">
                {creditTransactions?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Subscription</p>
              <p className="text-xl font-bold">
                {subscriptionStatus?.status === 'active' ? 'Active' : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Purchase Summary</h3>
          <Link href="/platform/account/transactions">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction);
              const colorClass = getTransactionColor(transaction);

              return (
                <div
                  key={`${transaction.type}-${transaction.id}`}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full bg-background ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {transaction.currency === 'SOL' ? (
                        <USDPriceDisplay
                          solAmount={transaction.amount}
                          showBracket={false}
                          className="font-medium text-base"
                        />
                      ) : (
                        `$${transaction.amount.toFixed(2)}`
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasesOverview;
