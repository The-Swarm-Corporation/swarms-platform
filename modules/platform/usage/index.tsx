'use client';

import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/utils/cn';
import React, { useEffect, useState } from 'react';
import MonthPicker from './components/month-picker';
import { trpc } from '@/shared/utils/trpc/trpc';
import { UserUsage } from '@/shared/utils/api/usage';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import LoadingSpinner from '@/shared/components/loading-spinner';
import MonthlyChart from './components/monthy-usage';
import MonthlyPricing from './components/charts/monthly-pricing';
import ModelUsage from './components/charts/models';
import CreditsUsage from './components/credits';

type UsageTab = 'cost' | 'activity';
type UsageData = UserUsage | null;

export default function Usage() {
  const [activeTab, setActiveTab] = useState<UsageTab>('cost');
  const [month, setMonth] = useState(new Date());
  const [usageData, setUsageData] = useState<UsageData>(null);
  const toast = useToast();

  const isCost = activeTab === 'cost';
  const handleTabChange = (tab: UsageTab) => setActiveTab(tab);

  const handleMonthChange = (newMonth: Date) => setMonth(newMonth);

  const usageMutation = trpc.panel.getUsageAPICluster.useMutation();

  useEffect(() => {
    usageMutation
      .mutateAsync({ month })
      .then((data) => {
        setUsageData(data as UsageData);
      })
      .catch((err) => {
        console.error(err);

        toast.toast({
          description: err?.message || 'Error fetching usage data',
          variant: 'destructive',
          duration: 5000,
        });
      });
  }, [month]);

  return (
    <article className="flex flex-col w-full">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Usage</h1>

      <section className="flex flex-col sm:items-center sm:flex-row sm:justify-between mt-6">
        <div className="flex items-center justify-center p-1 bg-secondary rounded-md w-fit">
          <Button
            onClick={() => handleTabChange('cost')}
            className={cn(
              'px-6 py-0 h-8 w-28 lg:w-32 text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-black dark:text-white',
              'hover:bg-transparent, hover:text-primary rounded-md shadow-md',
              isCost &&
                'bg-primary text-white hover:text-white hover:bg-primary',
            )}
          >
            Cost
          </Button>
          <Button
            onClick={() => handleTabChange('activity')}
            className={cn(
              'px-6 py-0 h-8 w-28 lg:w-32 text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-black dark:text-white',
              'hover:bg-transparent, hover:text-primary rounded-md shadow-md',
              activeTab === 'activity' &&
                'bg-primary text-white hover:text-white hover:bg-primary',
            )}
          >
            Activity
          </Button>
        </div>

        <MonthPicker month={month} onMonthChange={handleMonthChange} />
      </section>

      <section className="mt-8 md:mt-14 flex justify-center max-xl:flex-col gap-10">
        <div className="w-full">
          {usageMutation.isPending ? (
            <LoadingSpinner />
          ) : (
            <div>
              <MonthlyChart data={usageData} />
              <ModelUsage usageData={usageData} />
            </div>
          )}
        </div>
        <div className="w-full md:w-[55%] xl:w-1/2">
          <MonthlyPricing usageData={usageData} month={month} />
          <CreditsUsage />
        </div>
      </section>
    </article>
  );
}
