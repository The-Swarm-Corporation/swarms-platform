'use client';
import { Button } from '@/shared/components/ui/Button';
import useSubscription from '@/shared/hooks/subscription';
import { formatDate } from '@/shared/utils/helpers';

const SubscriptionStatus = () => {
  const subscription = useSubscription();
  const status = subscription.status;
  const isLoading = subscription.data.isLoading;
  const subscriptionData = subscription.data.data;

  return (
    <div className="flex flex-col gap-4 w-full border rounded-md p-4 text-card-foreground">
      <h1 className="text-base  font-bold">Subscription Status</h1>
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
            {status && subscription?.isCanceled && (
              <p>
                Subscription will be canceled at{' '}
                <span className="text-primary">
                  {subscriptionData?.renewAt
                    ? formatDate(subscriptionData?.renewAt)
                    : 'end of the current period'}
                  .
                </span>
                <br />
                If you would like to reactivate your subscription, please click
                the button below.
                <br />
              </p>
            )}
            {status ? (
              <Button
                disabled={subscription.openCustomerPortalLoading}
                variant="outline"
                onClick={subscription.openCustomerPortal}
              >
                Open customer portal
              </Button>
            ) : (
              <Button
                disabled={subscription.createSubscriptionPortalLoading}
                variant="default"
                onClick={subscription.createSubscriptionPortal}
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
