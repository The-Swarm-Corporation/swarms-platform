'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  ShoppingCart,
  DollarSign,
  CreditCard,
  Coins,
  Receipt,
  Loader2,
  ExternalLink,
  Search,
  Filter,
  Download,
  TrendingUp,
  ArrowUpDown,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { cn } from '@/shared/utils/cn';
import { HistoricalPriceDisplay } from '@/shared/components/marketplace/historical-price-display';

interface UnifiedTransaction {
  id: string;
  type: 'marketplace' | 'credit' | 'subscription';
  subtype: 'purchase' | 'sale' | 'credit_purchase' | 'subscription_payment';
  amount: number;
  amount_usd?: number;
  currency: 'SOL' | 'USD';
  status: string;
  created_at: string;
  description: string;
  transaction_signature?: string;
  item_type?: string;
  item_name?: string;
  platform_fee?: number;
  platform_fee_usd?: number;
  sol_price_at_time?: number;
}

const TransactionHistory = () => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItemType, setSelectedItemType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: marketplaceTransactions,
    isLoading: marketplaceLoading,
    refetch: refetchMarketplace,
  } = trpc.marketplace.getUserTransactions.useQuery(
    { type: 'all' },
    {
      enabled: !!user?.id,
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: creditTransactions,
    isLoading: creditLoading,
    refetch: refetchCredit,
  } = trpc.dashboard.getCreditTransactions.useQuery(
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

  const getAllTransactions = (): UnifiedTransaction[] => {
    const allTransactions: UnifiedTransaction[] = [];

    if (marketplaceTransactions) {
      marketplaceTransactions.forEach((tx) => {
        const isUserBuyer = tx.buyer_id === user?.id;
        const isUserSeller = tx.seller_id === user?.id;

        if (isUserBuyer || isUserSeller) {
          const solAmount = isUserBuyer ? tx.amount : tx.seller_amount;
          const usdAmount = isUserBuyer ? tx.amount_usd : tx.seller_amount_usd;
          const itemName = getItemName(tx.item_id, tx.item_type);

          allTransactions.push({
            id: tx.id,
            type: 'marketplace',
            subtype: isUserBuyer ? 'purchase' : 'sale',
            amount: solAmount,
            amount_usd: usdAmount || undefined,
            currency: 'SOL',
            status: tx.status,
            created_at: tx.created_at,
            description: `${itemName} ${isUserBuyer ? 'Purchase' : 'Sale'}`,
            transaction_signature: tx.transaction_signature,
            item_type: tx.item_type,
            item_name: itemName,
            platform_fee: tx.platform_fee,
            platform_fee_usd: tx.platform_fee_usd || undefined,
            sol_price_at_time: tx.sol_price_at_time || undefined,
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
          transaction_signature: tx.transaction_hash,
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

    return allTransactions.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  };

  const allTransactions = getAllTransactions();
  const marketplaceOnly = allTransactions.filter(
    (tx) => tx.type === 'marketplace',
  );
  const creditOnly = allTransactions.filter((tx) => tx.type === 'credit');
  const subscriptionOnly = allTransactions.filter(
    (tx) => tx.type === 'subscription',
  );

  const getTransactionIcon = (transaction: UnifiedTransaction) => {
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

  const getTransactionColor = (transaction: UnifiedTransaction) => {
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

  const filterAndSortTransactions = (transactions: UnifiedTransaction[]) => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.transaction_signature
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((tx) => tx.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((tx) => tx.type === selectedType);
    }

    if (selectedItemType !== 'all') {
      filtered = filtered.filter(
        (tx) => tx.type !== 'marketplace' || tx.item_type === selectedItemType,
      );
    }

    if (dateRange.from) {
      filtered = filtered.filter(
        (tx) => new Date(tx.created_at) >= new Date(dateRange.from),
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(
        (tx) => new Date(tx.created_at) <= new Date(dateRange.to + 'T23:59:59'),
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return filtered;
  };

  const exportTransactions = async (
    transactions: UnifiedTransaction[],
    tabName: string = 'all',
  ) => {
    try {
      const filteredTransactions = filterAndSortTransactions(transactions);

      if (filteredTransactions.length === 0) {
        toast({
          title: 'No transactions to export',
          description: 'Apply different filters to see transactions.',
          variant: 'destructive',
        });
        return;
      }

      const exportData = filteredTransactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        subtype: transaction.subtype,
        item_name: transaction.item_name || transaction.description,
        amount: transaction.amount,
        currency: transaction.currency,
        amount_usd:
          transaction.amount_usd ||
          (transaction.currency === 'USD'
            ? transaction.amount
            : 'Historical data not available'),
        status: transaction.status,
        date: format(parseISO(transaction.created_at), 'yyyy-MM-dd HH:mm:ss'),
        description: transaction.description,
        transaction_signature: transaction.transaction_signature || '',
        item_type: transaction.item_type || '',
        platform_fee: transaction.platform_fee || '',
        platform_fee_usd:
          transaction.platform_fee_usd || 'Historical data not available',
        sol_price_at_time:
          transaction.sol_price_at_time || 'Historical data not available',
      }));

      const currentDate = format(new Date(), 'yyyy-MM-dd');
      const filterSuffix =
        searchTerm ||
        selectedStatus !== 'all' ||
        selectedType !== 'all' ||
        selectedItemType !== 'all' ||
        dateRange.from ||
        dateRange.to
          ? '-filtered'
          : '';
      const filename = `transaction-history-${tabName}-${currentDate}${filterSuffix}.json`;

      const json = JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          total_transactions: exportData.length,
          filters_applied: {
            search_term: searchTerm || null,
            status: selectedStatus !== 'all' ? selectedStatus : null,
            type: selectedType !== 'all' ? selectedType : null,
            item_type: selectedItemType !== 'all' ? selectedItemType : null,
            date_range: {
              from: dateRange.from || null,
              to: dateRange.to || null,
            },
            sort_by: sortBy,
            sort_order: sortOrder,
          },
          transactions: exportData,
        },
        null,
        2,
      );

      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Exported ${exportData.length} transactions to ${filename}`,
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting transactions.',
        variant: 'destructive',
      });
    }
  };

  const renderTransactionTable = (transactions: UnifiedTransaction[]) => {
    const filteredTransactions = filterAndSortTransactions(transactions);

    const totalItems = filteredTransactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      endIndex,
    );

    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return null;
    }

    if (filteredTransactions.length === 0) {
      return (
        <div className="text-center py-16">
          <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            No transactions found
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || selectedStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Your transactions will appear here'}
          </p>
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (sortBy === 'date') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('date');
                        setSortOrder('desc');
                      }
                    }}
                    className="h-auto p-0 font-medium hover:bg-transparent text-xs sm:text-sm"
                  >
                    Transaction
                    {sortBy === 'date' && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm">
                  Status
                </th>
                <th className="text-left p-2 sm:p-4 font-medium text-xs sm:text-sm hidden md:table-cell">
                  Date
                </th>
                <th className="text-right p-2 sm:p-4 font-medium text-xs sm:text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (sortBy === 'amount') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('amount');
                        setSortOrder('desc');
                      }
                    }}
                    className="h-auto p-0 font-medium hover:bg-transparent text-xs sm:text-sm"
                  >
                    Amount
                    {sortBy === 'amount' && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </th>
                <th className="text-right p-2 sm:p-4 font-medium text-xs sm:text-sm hidden sm:table-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction, index) => {
                const Icon = getTransactionIcon(transaction);
                const colorClass = getTransactionColor(transaction);

                return (
                  <tr
                    key={`${transaction.type}-${transaction.id}`}
                    className={`border-b hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="p-2 sm:p-4 flex items-start gap-2">
                      <Icon className={colorClass} size={18} />
                      <div className="space-y-1">
                        <p className="font-medium text-xs sm:text-sm">
                          <span>
                            {transaction.item_name || transaction.description}
                          </span>
                        </p>
                        {transaction.transaction_signature && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {transaction.transaction_signature.slice(0, 8)}...
                            {transaction.transaction_signature.slice(-6)}
                          </p>
                        )}

                        <div className="sm:hidden space-y-1 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            {transaction.type === 'marketplace'
                              ? transaction.subtype
                              : transaction.type}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              parseISO(transaction.created_at),
                              'MMM dd, yyyy HH:mm',
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 hidden sm:table-cell">
                      <span
                        className={cn(
                          'inline-flex items-center capitalize px-2 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/20',
                          colorClass,
                        )}
                      >
                        {transaction.type === 'marketplace'
                          ? transaction.subtype
                          : transaction.type}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' ||
                          transaction.status === 'active'
                            ? 'text-green-600 dark:text-[#4ECD78]/80 bg-green-50 dark:bg-[#4ECD78]/10'
                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <div className="text-sm">
                        <p className="font-medium">
                          {format(
                            parseISO(transaction.created_at),
                            'MMM dd, yyyy',
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(transaction.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-right">
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {transaction.currency === 'SOL' ? (
                            <HistoricalPriceDisplay
                              solAmount={transaction.amount}
                              historicalUsd={transaction.amount_usd}
                              className="font-semibold text-sm"
                              showBracket={false}
                            />
                          ) : (
                            `$${transaction.amount.toFixed(2)}`
                          )}
                        </div>
                        {transaction.platform_fee &&
                          transaction.subtype === 'sale' && (
                            <div className="text-xs text-orange-600 dark:text-orange-400">
                              Fee:{' '}
                              <HistoricalPriceDisplay
                                solAmount={transaction.platform_fee}
                                historicalUsd={transaction.platform_fee_usd}
                                className="text-orange-600 dark:text-orange-400"
                                showBracket={false}
                              />
                            </div>
                          )}

                        <div className="sm:hidden mt-1">
                          {transaction.transaction_signature &&
                            transaction.currency === 'SOL' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    `https://explorer.solana.com/tx/${transaction.transaction_signature}`,
                                    '_blank',
                                  )
                                }
                                className="h-6 w-6 p-0"
                                title="View on Solscan"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-right hidden sm:table-cell">
                      {transaction.transaction_signature &&
                        transaction.currency === 'SOL' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://explorer.solana.com/tx/${transaction.transaction_signature}`,
                                '_blank',
                              )
                            }
                            className="h-8 w-8 p-0"
                            title="View on Solscan"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-3 border-t gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="hidden sm:inline">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-input bg-background rounded text-xs sm:text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs sm:text-sm">of {totalItems}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!user) return null;

  const handleRefreshAll = async () => {
    await Promise.all([refetchMarketplace(), refetchCredit()]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Transaction History
          </h2>
          <p className="text-muted-foreground mt-2">
            Track all your platform transactions and financial activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportTransactions(allTransactions, 'all')}
            className="px-3 py-2 border border-[#40403F] bg-background rounded-md text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="px-3 py-2 border border-[#40403F] bg-background rounded-md text-sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold">{allTransactions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Marketplace
                </p>
                <p className="text-2xl font-bold">{marketplaceOnly.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {
                    marketplaceOnly.filter((t) => t.subtype === 'purchase')
                      .length
                  }{' '}
                  purchases,{' '}
                  {marketplaceOnly.filter((t) => t.subtype === 'sale').length}{' '}
                  sales
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              $
              {marketplaceOnly
                .reduce((sum, t) => sum + (t.amount_usd || 0), 0)
                .toFixed(2)}{' '}
              total value
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Credits
                </p>
                <p className="text-2xl font-bold">{creditOnly.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${creditOnly.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}{' '}
                  total
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Coins className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subscriptions
                </p>
                <p className="text-2xl font-bold">{subscriptionOnly.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscriptionStatus?.status === 'active'
                    ? 'Active'
                    : 'Inactive'}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, description, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 disabled:cursor-not-allowed border-gray-800 disabled:opacity-50 text-white max-sm:text-xs pr-11 bg-transparent focus:outline-none focus:ring-0 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-800 bg-background rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="active">Active</option>
                </select>
                <Button
                  variant="outline"
                  className="px-3 py-2 border border-gray-800 bg-background rounded-md text-sm"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {showMoreFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Transaction Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-800 bg-background rounded-md text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="marketplace">Marketplace</option>
                      <option value="credit">Credits</option>
                      <option value="subscription">Subscriptions</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Item Type
                    </label>
                    <select
                      value={selectedItemType}
                      onChange={(e) => setSelectedItemType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-800 bg-background rounded-md text-sm"
                    >
                      <option value="all">All Items</option>
                      <option value="prompt">Prompts</option>
                      <option value="agent">Agents</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      className="py-2 border border-gray-800 bg-background rounded-md text-sm w-fit"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className="py-2 border border-gray-800 bg-background rounded-md text-sm w-fit"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('all');
                      setSelectedType('all');
                      setSelectedItemType('all');
                      setDateRange({ from: '', to: '' });
                    }}
                    className="text-primary underline text-sm hover:text-primary/80 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-4 w-fit">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({allTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm">
              Marketplace ({marketplaceOnly.length})
            </TabsTrigger>
            <TabsTrigger value="credits" className="text-xs sm:text-sm">
              Credits ({creditOnly.length})
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-xs sm:text-sm">
              Subscriptions ({subscriptionOnly.length})
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              `${allTransactions.length} total transactions`
            )}
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">All Transactions</CardTitle>
                  <CardDescription>
                    Complete history of your platform activity
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportTransactions(allTransactions, 'all')}
                  className="px-3 py-2 border border-[#40403F] bg-background rounded-md text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading transactions...
                    </p>
                  </div>
                </div>
              ) : (
                renderTransactionTable(allTransactions)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Marketplace Transactions
                  </CardTitle>
                  <CardDescription>
                    Your buying and selling activity
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTransactions(marketplaceOnly, 'marketplace')
                  }
                  className="px-3 py-2 border border-[#40403F] bg-background rounded-md text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Marketplace
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading marketplace transactions...
                    </p>
                  </div>
                </div>
              ) : (
                renderTransactionTable(marketplaceOnly)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Credit Transactions</CardTitle>
                  <CardDescription>
                    Your credit purchase history
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportTransactions(creditOnly, 'credits')}
                  className="px-3 py-2 border border-[#40403F] bg-background rounded-md text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Credits
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading credit transactions...
                    </p>
                  </div>
                </div>
              ) : (
                renderTransactionTable(creditOnly)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Subscription Payments
                  </CardTitle>
                  <CardDescription>
                    Your subscription status and payments
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTransactions(subscriptionOnly, 'subscriptions')
                  }
                  className="px-3 py-2 border border-[#40403F] bg-background rounded-md text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Subscriptions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading subscription data...
                    </p>
                  </div>
                </div>
              ) : (
                renderTransactionTable(subscriptionOnly)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionHistory;
