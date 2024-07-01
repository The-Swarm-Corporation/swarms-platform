'use client';

import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import useSubscription from '@/shared/hooks/subscription';
import { trpc } from '@/shared/utils/trpc/trpc';
import LoadingSpinner from '@/shared/components/loading-spinner';
import PlanSwitchDialog from './components/plan';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';

export type Plan = 'default' | 'invoice';
const plans: Plan[] = ['default', 'invoice'];

const Credit = ({ user }: { user: User | null }) => {
  const subscription = useSubscription();
  const toast = useToast();
  const [openModals, setOpenModals] = useState<{ [key in Plan]: boolean }>({
    default: false,
    invoice: false,
  });

  const creditPlanQuery = user ? trpc.panel.getUserCreditPlan.useQuery() : null;
  const creditPlanMutation = trpc.panel.updateUserCreditPlan.useMutation();

  const isLoading = creditPlanMutation.isPending;
  const isQueryLoading = creditPlanQuery?.isLoading;
  const currentPlan = creditPlanQuery?.data?.credit_plan;

  async function handleCreditPlanChange(plan: 'default' | 'invoice') {
    if (!user) {
      toast.toast({
        description: 'You must be logged in to change your plan',
        variant: 'destructive',
      });
      return;
    }

    if (!plan) {
      toast.toast({
        description: 'No plan selected',
        variant: 'destructive',
      });
      return;
    }

    if (plan === currentPlan) {
      toast.toast({
        description: 'You are already on this plan',
        variant: 'destructive',
      });
      setOpenModals((prev) => ({ ...prev, [plan]: false }));
      return;
    }

    if (plan) {
      toast.toast({
        description:
          'Service is currently unavailable. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await creditPlanMutation.mutateAsync({
        credit_plan: plan,
      });
      if (response) {
        toast.toast({
          description: 'Plan successfully changed',
          style: { color: 'green' },
        });
        creditPlanQuery?.refetch();
        setOpenModals((prev) => ({ ...prev, [plan]: false }));
      }
    } catch (error) {
      if ((error as any)?.message) {
        toast.toast({
          description: (error as any)?.message,
          variant: 'destructive',
        });
      }
    }
  }

  function handleCreditCharge() {
    if (!user) {
      toast.toast({
        description: 'You must be logged in to charge your account',
        variant: 'destructive',
      });
      return;
    }

    if (currentPlan === 'invoice')
      return toast.toast({
        description: 'You are on invoice plan. Cannot charge account.',
        variant: 'destructive',
      });
    return subscription.openChargeAccountPortal();
  }

  return (
    <section>
      <div>
        <h3 className="text-md font-bold tracking-wide">
          Select available plan
        </h3>
        <div className="mt-2 mb-3 w-fit">
          {isQueryLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="flex items-center justify-center p-1 bg-secondary rounded-md">
              {plans.map((plan) => {
                return (
                  <PlanSwitchDialog
                    key={plan}
                    plan={plan}
                    isLoading={isLoading}
                    openModal={openModals[plan]}
                    currentPlan={(currentPlan as Plan) || 'default'}
                    setOpenModal={(value) =>
                      setOpenModals((prev) => ({ ...prev, [plan]: value }))
                    }
                    handleConfirm={handleCreditPlanChange}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 border rounded-md p-4 w-full">
        <div className="flex gap-2">
          <span className="text-lg font-bold">Credits Available:</span>
          {user ? (
            <span className="text-primary text-lg">
              {subscription.creditLoading
                ? 'Loading...'
                : `$ ${(subscription.credit ?? 0).toFixed(2)}`}
            </span>
          ) : (
            <span className="text-primary text-lg">$ 0.00</span>
          )}
        </div>
        <Button
          onClick={handleCreditCharge}
          disabled={currentPlan === 'invoice'}
        >
          Charge
        </Button>
      </div>
    </section>
  );
};

export default Credit;
