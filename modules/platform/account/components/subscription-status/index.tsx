'use client';
import { Button } from '@/shared/components/ui/Button';
import useSubscription from '@/shared/hooks/subscription';
import { formatDate } from '@/shared/utils/helpers';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const tiers = ['Free', 'Premium', 'Enterprise'];
const SubscriptionStatus = () => {
  const subscription = useSubscription();
  const status = subscription.status;
  const isLoading = subscription.data.isLoading;
  const subscriptionData = subscription.data.data;

  const searchParams = useSearchParams();
  const subscriptionStatus = searchParams?.get('subscription_status');

  const subNullQuery = subscriptionStatus === 'null';
  const [userTier, setUserTier] = useState('Free');

  useEffect(() => {
    if (status && status.toLowerCase() === 'active') {
      setUserTier('Premium');
    }
  }, [status]);

  return (
    <div className="flex flex-col gap-4 w-full border rounded-md p-4 text-card-foreground">
      <h1 className="text-base font-bold">Subscription Status</h1>
      <div className="flex flex-row justify-around">
        {tiers.map((tier) => (
          <div
            key={tier}
            className={`p-3 border ${userTier === tier ? 'bg-primary text-white' : 'bg-secondary text-black'}`}
            style={{ flex: 1, textAlign: 'center' }}
          >
            {tier}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {isLoading && 'Loading...'}
        {!isLoading && (
          <>
            {status && (
              <h2>
                Your subscription status :{' '}
                <span
                  className={`text-${status === 'active' ? 'success' : 'error'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </h2>
            )}
            {!status && <h2>You are not currently subscribed to any plan.</h2>}
            {status && subscription?.isCanceled && (
              <p>
                Subscription will be canceled at{' '}
                <span className="text-primary">
                  {subscriptionData?.renewAt
                    ? formatDate(subscriptionData?.renewAt)
                    : 'end of the current period'}
                </span>
                .
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
                className={
                  (!status || status !== 'active') && subNullQuery
                    ? 'animate animate-bounce'
                    : ''
                }
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
