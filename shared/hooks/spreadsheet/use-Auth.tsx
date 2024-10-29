import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useRouter } from 'next/navigation';
import { createQueryString, isEmpty } from '@/shared/utils/helpers';
import { PLATFORM } from '@/shared/constants/links';
import { User } from '@supabase/supabase-js';
import { trpc } from '@/shared/utils/trpc/trpc';

interface ExtendedUser extends User {
  payment_method?: any;
}

export const useAuth = () => {
  const { user, setIsAuthModalOpen } = useAuthContext();
  const extendedUser = user as ExtendedUser;
  const router = useRouter();
  const toast = useToast();

  const getSubscription = trpc.payment.getSubscriptionStatus.useQuery();
  const cardManager = trpc.payment.getUserPaymentMethods.useQuery();

  const redirectStatus = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return true;
    }

    if (isEmpty(cardManager?.data)) {
      const params = createQueryString({
        card_available: 'false',
      });
      router.push(PLATFORM.ACCOUNT + '?' + params);
      return true;
    }

    if (getSubscription.data && getSubscription.data.status !== 'active') {
      toast.toast({
        description: 'Please subscribe to use this feature.',
      });

      const params = createQueryString({
        subscription_status: 'null',
      });

      router.push(PLATFORM.ACCOUNT + '?' + params);
      return true;
    }

    return false;
  };

  return {
    user: extendedUser,
    redirectStatus,
    isSubscriptionLoading: getSubscription.isPending,
  };
};
