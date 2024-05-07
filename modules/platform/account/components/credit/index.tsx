'use client';

import { Button } from '@/shared/components/ui/Button';
import useSubscription from '@/shared/hooks/subscription';

/**
 * Renders the Credit component.
 * This component displays the user's credit balance and provides a button to charge the account.
 */
const Credit = () => {
  const subscription = useSubscription();
  return (
    <div className="flex flex-col gap-4 border rounded-md p-4 w-full">
      <div className="flex gap-2">
        <span>Your Credit:</span>
        <span className="text-primary">
          {subscription.creditLoading
            ? 'Loading...'
            : `$ ${(subscription.credit ?? 0).toFixed(2)}`}
        </span>
      </div>
      <Button
        onClick={() => {
          subscription.openChargeAccountPortal();
        }}
      >
        Charge
      </Button>
    </div>
  );
};

export default Credit;
