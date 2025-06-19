'use client';

import { useState } from 'react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { trpc } from '@/shared/utils/trpc/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Lock, CreditCard, Star, User, Loader2 } from 'lucide-react';
import PurchaseModal from './purchase-modal';
import { WalletProvider } from './wallet-provider';
import MessageScreen from '../chat/components/message-screen';
import PriceDisplay from './price-display';

interface AccessRestrictionProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    is_free: boolean;
    seller_wallet_address: string;
    user_id: string;
    type: 'prompt' | 'agent';
  };
  children: React.ReactNode;
}

const AccessRestrictionContent = ({
  item,
  children,
}: AccessRestrictionProps) => {
  const { user } = useAuthContext();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const {
    data: purchaseData,
    isLoading: isPurchaseLoading,
    refetch: refetchPurchase,
  } = trpc.marketplace.checkUserPurchase.useQuery(
    {
      itemId: item.id,
      itemType: item.type,
    },
    {
      enabled: !!user?.id && !item.is_free,
    },
  );

  if (item.is_free) {
    return <>{children}</>;
  }

  if (user?.id === item.user_id) {
    return <>{children}</>;
  }

  if (isPurchaseLoading && user?.id) {
    return (
      <MessageScreen
        icon={Loader2}
        iconClass="h-8 w-8 text-red-400 dark:text-red-500 animate-spin mb-2"
        title="Checking Access..."
        borderClass="border border-zinc-700/50"
      >
        <p className="text-center text-sm text-zinc-300">
          Verifying your status
        </p>
      </MessageScreen>
    );
  }

  if (purchaseData?.hasPurchased) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border border-[#40403F] bg-background">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-yellow-500/10 rounded-full w-fit">
                  <Lock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Premium {item.type}
                </CardTitle>
                <CardDescription className="text-lg">
                  This {item.type} requires a purchase to access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                      Premium Content
                    </span>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Price:
                    </span>
                    <span className="text-lg font-bold">
                      <PriceDisplay
                        showSOL={false}
                        solAmount={item.price}
                        size="md"
                      />
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">What you get:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Full access to the {item.type} content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Lifetime access - no recurring fees</span>
                    </li>
                    {item.type === 'agent' && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Access to agent code and configuration</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setShowPurchaseModal(true)}
                    className="flex-1 bg-[#4ECD78]/10 border-[0.5px] border-[#4ECD78]/20 hover:bg-[#4ECD78]/20 text-[#4ECD78]"
                    size="lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    <div className="flex items-center gap-1">
                      <span>Purchase for</span>{' '}
                      <PriceDisplay
                        showSOL={false}
                        solAmount={item.price}
                        className="inline"
                      />
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="flex-1 bg-transparent border border-[#40403F] hover:bg-[#1e1e1e] text-white"
                  >
                    Go Back
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Created by a verified creator</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          item={{
            id: item.id,
            name: item.name,
            price: item.price,
            type: item.type,
            sellerWalletAddress: item.seller_wallet_address,
            sellerId: item.user_id,
          }}
          onPurchaseSuccess={() => {
            refetchPurchase();
            setShowPurchaseModal(false);
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
};

const AccessRestriction = ({ item, children }: AccessRestrictionProps) => {
  return (
    <WalletProvider>
      <AccessRestrictionContent item={item}>
        {children}
      </AccessRestrictionContent>
    </WalletProvider>
  );
};

export default AccessRestriction;
