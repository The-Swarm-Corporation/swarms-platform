'use client';

import { Button } from '@/shared/components/ui/Button';
import { trpc } from '@/shared/utils/trpc/trpc';

const Credit = () => {
  const crateStripePaymentSession =
    trpc.createStripePaymentSession.useMutation();
  const userCredit = trpc.getUserCredit.useQuery();
  return (
    <div className="flex flex-col gap-4 border rounded-md p-4 w-full">
      <div className="flex gap-2">
        <span>Your Credit:</span>
        <span className="text-primary">$ {(userCredit.data ?? 0).toFixed(2)}</span>
      </div>
      <Button
        onClick={async () => {
          crateStripePaymentSession.mutateAsync().then((url) => {
            if (url) window.location.href = url;
          });
        }}
      >
        Charge
      </Button>
    </div>
  );
};

export default Credit;
