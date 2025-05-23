import { trpc } from '../utils/trpc/trpc';
import { getStripe } from '../utils/stripe/client';
import { useMemo } from 'react';

/**
 * Custom hook for managing subscription-related functionality.
 * This hook provides methods and data for handling subscription status, creating subscription portals, and managing user credits.
 *
 * @returns An object containing methods and data related to subscription management.
 */
const useSubscription = () => {
  const chargeAccountPortal =
    trpc.payment.createStripePaymentSession.useMutation();
  const userCredit = trpc.panel.getUserCredit.useQuery();

  const openChargeAccountPortal = () => {
    chargeAccountPortal.mutateAsync().then((url: string) => {
      document.location.href = url;
    });
  };

  const getSubscription = trpc.payment.getSubscriptionStatus.useQuery();
  const makeCustomerPortal = trpc.payment.createStripePortalLink.useMutation();

  const makeSubsctiptionSession =
    trpc.payment.createSubscriptionCheckoutSession.useMutation();

  const createSubscriptionPortal = (
    stripeProductId: string,
    productType: string,
    cancelPath?: string,
  ) => {
    makeSubsctiptionSession
      .mutateAsync({ stripeProductId, productType, cancelPath })
      .then(async (sessionId: string) => {
        const stripe = await getStripe();
        if (stripe) stripe.redirectToCheckout({ sessionId });
      });
  };
  const openCustomerPortal = () => {
    makeCustomerPortal.mutateAsync().then((url: string) => {
      document.location.href = url;
    });
  };

  const refetchCredit = async () => {
    await userCredit.refetch();
  };

  return {
    credit: userCredit.data,
    creditLoading: userCredit.isLoading,
    refetchCredit,
    data: getSubscription,
    statusLoading: getSubscription.isLoading,
    interval: getSubscription.data?.interval,
    status: getSubscription.data?.status,
    isLoading: getSubscription.isLoading,
    isSubscribed: getSubscription.data?.status === 'active' || false,
    isCanceled: getSubscription.data?.isCanceled,
    createSubscriptionPortalLoading: makeSubsctiptionSession.isPending,
    createSubscriptionPortal,
    openCustomerPortalLoading: makeCustomerPortal.isPending,
    openCustomerPortal,
    openChargeAccountPortalLoading: chargeAccountPortal.isPending,
    openChargeAccountPortal,
  };
};

export default useSubscription;
