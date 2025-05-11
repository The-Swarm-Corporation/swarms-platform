'use client';

import PricingCards from '@/modules/pricing/components/pricing-cards';
import MessageScreen from '@/shared/components/chat/components/message-screen';
import { Button } from '@/shared/components/ui/button';
import useSubscription from '@/shared/hooks/subscription';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/utils/helpers';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const tiers = ['Free', 'Premium', 'Enterprise'];
const SubscriptionStatus = () => {
  const subscription = useSubscription();
  const status = subscription.status;
  const interval = subscription.interval;
  const isLoading = subscription.data.isLoading;
  const subscriptionData = subscription.data.data;

  const [userTier, setUserTier] = useState('Free');

  useEffect(() => {
    if (
      status &&
      (status.toLowerCase() === 'active' || status.toLowerCase() === 'trialing')
    ) {
      setUserTier('Premium');
    }
  }, [status]);

  if (isLoading)
    return (
      <MessageScreen
        icon={Loader2}
        iconClass="h-10 w-10 animate-spin duration-1000 mb-2"
        title="Loading..."
        borderClass="border border-zinc-700/50"
        containerClass="h-[250px]"
      >
        <span />
      </MessageScreen>
    );

  return (
    <div className="flex flex-col gap-4 w-full border rounded-md md:p-4 text-card-foreground">
      <h1 className="text-base font-bold flex items-center gap-4 md:block">
        Subscription Status{' '}
        {interval && (
          <span className="md:hidden flex items-center gap-2">
            <span>-</span>
            <span className="md:ml-2 bg-black p-2 text-xs text-white rounded-sm shadow-sm">
              *per {interval}
            </span>
          </span>
        )}
      </h1>
      <div className="flex flex-row justify-around">
        {tiers.map((tier) => (
          <div
            key={tier}
            className={`p-3 border text-xs md:text-base ${userTier === tier ? 'bg-primary text-white' : 'bg-secondary text-[#2e2e2e]'}`}
            style={{ flex: 1, textAlign: 'center' }}
          >
            {tier}{' '}
            {interval && userTier === tier && (
              <span className="hidden md:inline-flex ml-2 bg-black p-2 text-xs text-white rounded-sm shadow-sm">
                *per {interval}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-wrap gap-4 md:items-center font-mono justify-between">
          <div
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
            className="text-sm mt-2.5 italic font-medium md:text-base text-white/80 bg-zinc-950/50 p-3 rounded-md border-l-2 border-primary/50 shadow-inner w-fit"
          >
            {status && (
              <h2>
                Your subscription status:{' '}
                <span
                  className={`text-${status === 'active' ? 'green-500' : 'primary'} font-semibold`}
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
          </div>
          {status && (
            <Button
              disabled={subscription.openCustomerPortalLoading}
              variant="outline"
              onClick={subscription.openCustomerPortal}
              className={cn(
                'items-center justify-between inline-flex w-fit font-medium px-6 py-2.5 text-center',
                ' duration-200 border',
                'border-white/5 dark:border-white/10 rounded-md h-14 ',
                'focus:outline-none focus-visible:outline-black text-base focus-visible:ring-black',
                'text-white bg-white/10 dark:bg-white/5 hover:bg-white/10 hover:border-white/10 hover:dark:bg-white/10 hover:dark:border-white/10',
              )}
            >
              Open customer portal
            </Button>
          )}
        </div>

        <div className="py-8">
          <PricingCards page="account" />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
