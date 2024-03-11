import { useQuery } from '@tanstack/react-query';
import { trpc } from '../utils/trpc/trpc';

const useSubscription = () => {
  const getSubscriptionStatus = trpc.getSubscriptionStatus.useQuery();
  const data = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => getSubscriptionStatus
  });
  return {
    data,
    isSubscribed: data.data?.data?.status === 'active'
  };
};

export default useSubscription;
