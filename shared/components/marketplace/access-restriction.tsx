'use client';

import { useState } from 'react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Lock,
  CreditCard,
  Star,
  Loader2,
  Check,
  ArrowLeft,
} from 'lucide-react';
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
  const router = useRouter();
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
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
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

  if (!purchaseData?.hasPurchased) {
    return (
      <div className="min-h-screen relative my-10 items-center flex justify-center 2xl:my-0">
        <div className="absolute inset-0 dark:bg-black/50 dark:backdrop-blur-sm" />
        <div className="w-full max-w-lg relative">
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] dark:ring-1 dark:ring-white/10 transition-colors">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="mx-auto mb-6 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Premium Content
              </h1>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pb-8">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {item.name}
                </h2>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full">
                  <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Premium
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    One-time payment
                  </span>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    <PriceDisplay showSOL={false} solAmount={item.price} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  What you get:
                </h3>

                <div className="space-y-3">
                  {[
                    `Full access to the ${item.type} content`,
                    'Lifetime access - no recurring fees',
                    ...(item.type === 'agent'
                      ? ['Access to agent code and configuration']
                      : []),
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  className="w-full bg-[#4ECD78]/10 border border-[#4ECD78]/20 hover:bg-[#4ECD78]/20 text-[#4ECD78] font-medium py-3 h-auto"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase for{' '}
                  <PriceDisplay
                    showSOL={false}
                    solAmount={item.price}
                    className="ml-1"
                  />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-3 h-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
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
          onPurchaseSuccess={async () => {
            setShowPurchaseModal(false);

            // Retry mechanism to ensure purchase status is updated
            const retryRefetch = async (attempts = 3) => {
              for (let i = 0; i < attempts; i++) {
                try {
                  await refetchPurchase();
                  const result = await refetchPurchase();
                  if (result.data?.hasPurchased) {
                    break;
                  }
                  if (i < attempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                } catch (error) {
                  console.warn(`Refetch attempt ${i + 1} failed:`, error);
                  if (i < attempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
              }
            };

            await retryRefetch();

            router.push(`/${item.type}/${item.id}`);
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
