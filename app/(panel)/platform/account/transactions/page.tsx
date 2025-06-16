'use client';

import { User } from '@supabase/supabase-js';
import { useSession } from '@/shared/components/providers/session-provider';
import MarketplaceTransactions from '@/modules/platform/account/components/marketplace-wallet/marketplace-transactions';

export default function TransactionsPage() {
  const { session } = useSession();
  const user = session?.data?.user as User | null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground mt-2">
          View your marketplace purchase and sales history
        </p>
      </div>
      
      <MarketplaceTransactions user={user} />
    </div>
  );
}
