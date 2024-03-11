import { useQuery } from '@tanstack/react-query';
import { trpc } from '../utils/trpc/trpc';
import { getStripe } from '../utils/stripe/client';

const useSubscription = () => {
  const chargeAccountPortal = trpc.createStripePaymentSession.useMutation();
  const userCreditQuery = trpc.getUserCredit.useQuery();
  const userCredit = useQuery({
    queryKey: ['user-credit'],
    queryFn: () => userCreditQuery.data
  });

  const openChargeAccountPortal = () => {
    chargeAccountPortal.mutateAsync().then((url) => {
      document.location.href = url;
    });
  };

  const getSubscriptionStatus = trpc.getSubscriptionStatus.useQuery();
  const makeCustomerPortal = trpc.createStripePortalLink.useMutation();

  const data = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => getSubscriptionStatus.data
  });
  const makeSubsctiptionSession =
    trpc.createSubscriptionCheckoutSession.useMutation();

  const createSubscriptionPortal = () => {
    makeSubsctiptionSession.mutateAsync().then(async (sessionId) => {
      const stripe = await getStripe();
      if (stripe) stripe.redirectToCheckout({ sessionId });
    });
  };
  const openCustomerPortal = () => {
    makeCustomerPortal.mutateAsync().then((url) => {
      document.location.href = url;
    });
  };
  return {
    credit: userCredit.data ?? 0,
    creditLoading: userCredit.isLoading,
    data,
    status: data.data?.status,
    isSubscribed: data.data?.status === 'active',
    isCanceled: data.data?.isCanceled,
    //
    createSubscriptionPortalLoading: makeSubsctiptionSession.isPending,
    createSubscriptionPortal,
    openCustomerPortalLoading: makeCustomerPortal.isPending,
    openCustomerPortal,

    openChargeAccountPortalLoading: chargeAccountPortal.isPending,
    openChargeAccountPortal
  };
};

export default useSubscription;
