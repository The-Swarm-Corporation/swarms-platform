'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { trpc } from '@/shared/utils/trpc/trpc';
import AccessRestriction from '@/shared/components/marketplace/access-restriction';
import MessageScreen from '@/shared/components/chat/components/message-screen';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface AccessModuleProps {
  type: 'prompt' | 'agent';
  id: string;
  accessToken?: string;
}

const AccessModule = ({ type, id, accessToken }: AccessModuleProps) => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    data: promptData,
    isLoading: promptLoading,
    error: promptError,
  } = trpc.explorer.getPromptById.useQuery(id, {
    enabled: type === 'prompt',
    retry: false,
  });

  const {
    data: agentData,
    isLoading: agentLoading,
    error: agentError,
  } = trpc.explorer.getAgentById.useQuery(id, {
    enabled: type === 'agent',
    retry: false,
  });

  const item = type === 'prompt' ? promptData : agentData;
  const itemLoading = type === 'prompt' ? promptLoading : agentLoading;
  const itemError = type === 'prompt' ? promptError : agentError;

  const { data: purchaseData, isLoading: purchaseLoading } =
    trpc.marketplace.checkUserPurchase.useQuery(
      {
        itemId: id,
        itemType: type,
      },
      {
        enabled: !!user?.id && !!item && !item.is_free,
        staleTime: 0,
        refetchOnWindowFocus: true,
      },
    );

  useEffect(() => {
    if (item && user) {
      const hasAccess =
        item.is_free ||
        item.user_id === user.id ||
        (purchaseData?.hasPurchased && !purchaseLoading);

      if (hasAccess && !isRedirecting) {
        setIsRedirecting(true);

        router.push(`/${type}/${id}`);
      }
    }
  }, [
    item,
    user,
    purchaseData,
    purchaseLoading,
    type,
    id,
    router,
    isRedirecting,
    accessToken,
  ]);

  if (itemLoading) {
    return (
      <MessageScreen
        icon={Loader2}
        iconClass="h-8 w-8 text-blue-400 animate-spin mb-2"
        title="Loading..."
        borderClass="border border-zinc-700/50"
      >
        <p className="text-center text-sm text-zinc-300">
          Loading content details...
        </p>
      </MessageScreen>
    );
  }

  if (itemError || !item) {
    return (
      <MessageScreen
        icon={AlertTriangle}
        iconClass="h-8 w-8 text-red-400 mb-2"
        title="Content Not Found"
        borderClass="border border-red-700/50"
      >
        <p className="text-center text-sm text-zinc-300 mb-4">
          The requested {type} could not be found or may have been removed.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mx-auto"
        >
          Return to Marketplace
        </Button>
      </MessageScreen>
    );
  }

  if (isRedirecting) {
    return (
      <MessageScreen
        icon={CheckCircle}
        iconClass="h-8 w-8 text-green-400 mb-2"
        title="Access Granted"
        borderClass="border border-green-700/50"
      >
        <p className="text-center text-sm text-zinc-300">
          Redirecting to content...
        </p>
      </MessageScreen>
    );
  }

  return (
    <AccessRestriction
      item={{
        id: item.id,
        name: item.name ?? '',
        description: item.description ?? '',
        price: item.price ?? 0,
        price_usd: item.price_usd ?? 0,
        is_free: item.is_free ?? true,
        seller_wallet_address: item.seller_wallet_address ?? '',
        user_id: item.user_id ?? '',
        type,
      }}
    >
      <div />
    </AccessRestriction>
  );
};

export default AccessModule;
