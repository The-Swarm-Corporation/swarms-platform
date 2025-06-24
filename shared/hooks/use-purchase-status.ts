'use client';

import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { trpc } from '@/shared/utils/trpc/trpc';

interface UsePurchaseStatusProps {
  itemId: string;
  itemType: 'prompt' | 'agent' | 'tool';
  userId?: string;
  isFree?: boolean;
}

export function usePurchaseStatus({
  itemId,
  itemType,
  userId,
  isFree = false,
}: UsePurchaseStatusProps) {
  const { user } = useAuthContext();

  const {
    data: purchaseData,
    isLoading: isPurchaseLoading,
    refetch: refetchPurchase,
  } = trpc.marketplace.checkUserPurchase.useQuery(
    {
      itemId,
      itemType,
    },
    {
      enabled: !!user?.id && !isFree,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  );

  // Determine status
  const isOwner = user?.id === userId;
  const hasPurchased = purchaseData?.hasPurchased || false;
  const hasAccess = isFree || isOwner || hasPurchased;
  const showPremiumBadge = !isFree && !isOwner && !hasPurchased;
  const showOwnerBadge = isOwner && !isFree;
  const showPurchasedBadge = hasPurchased && !isOwner;

  return {
    user,
    isOwner,
    hasPurchased,
    hasAccess,
    showPremiumBadge,
    showOwnerBadge,
    showPurchasedBadge,
    isPurchaseLoading,
    refetchPurchase, // Expose refetch function for manual refresh
  };
}

export default usePurchaseStatus;
