'use client';
import { Button } from '@/shared/components/ui/Button';
import { formatDate } from '@/shared/utils/helpers';
import { getStripe } from '@/shared/utils/stripe/client';
import { trpc } from '@/shared/utils/trpc/trpc';

const SubscriptionStatus = () => {
  const subscriptionStatus = trpc.getSubscriptionStatus.useQuery();
  const subscriptionData = subscriptionStatus.data;
  const status = subscriptionStatus.data?.status;
  const isLoading = subscriptionStatus.isLoading;
  const makeCustomerPortal = trpc.createStripePortalLink.useMutation();
  const makeSubsctiptionSession =
    trpc.createSubscriptionCheckoutSession.useMutation();
  const openPortal = () => {
    makeCustomerPortal.mutateAsync().then((url) => {
      document.location.href = url;
    });
  };
  const createSubscriptionPortal = () => {
    makeSubsctiptionSession.mutateAsync().then(async (sessionId) => {
      const stripe = await getStripe();
      if (stripe) stripe.redirectToCheckout({ sessionId });
    });
  };
  return (
    <div className="flex flex-col gap-4 w-full border rounded-md p-4 text-card-foreground">
      <h1>Subscription Status</h1>
      <div className="flex flex-col gap-4">
        {isLoading && 'Loading...'}
        {!isLoading && (
          <>
            {status && (
              <h2>
                Your subscription status :{' '}
                <span className="text-primary">
                  {status === 'active' && 'Active'}
                  {status === 'trialing' && 'Trialing'}
                  {status === 'past_due' && 'Past Due'}
                  {status === 'canceled' && 'Canceled'}
                  {status === 'unpaid' && 'Unpaid'}
                </span>
              </h2>
            )}
            {!status && <h2>You are not currently subscribed to any plan.</h2>}
            {/* if canceled  */}
            {status && subscriptionData?.isCanceled && (
              <p>
                Subscription will be canceled at{' '}
                <span className="text-primary">
                  {subscriptionData?.renewAt
                    ? formatDate(subscriptionData?.renewAt)
                    : 'end of the current period'}.
                </span>
                  <br/>
                If you would like to reactivate your subscription, please
                click the button below.
                <br />
              </p>
            )}
            {status ? (
              <Button
                disabled={makeCustomerPortal.isPending}
                variant="outline"
                onClick={openPortal}
              >
                Open customer portal
              </Button>
            ) : (
              <Button
                disabled={makeSubsctiptionSession.isPending}
                variant="outline"
                onClick={createSubscriptionPortal}
              >
                Subscribe
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;
