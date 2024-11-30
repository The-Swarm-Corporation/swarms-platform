'use client';

import { Button } from '@/shared/components/spread_sheet_swarm/ui/button';
import { cn } from '@/shared/utils/cn';
import React, { useEffect, useState } from 'react';
import MonthPicker from './components/month-picker';
import { trpc } from '@/shared/utils/trpc/trpc';
import {
  OrganizationUsage as OrgUsage,
  UserUsage,
} from '@/shared/utils/api/usage';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import LoadingSpinner from '@/shared/components/loading-spinner';
import MonthlyChart from './components/monthy-usage';
import MonthlyPricing from './components/charts/costs/monthly-pricing';
import ModelUsage from './components/charts/costs/models-cost';
import CreditsUsage from './components/credits';
import ModelActivity from './components/charts/activity/models-activity';
import OrganizationUsage from './components/organization-usage';
import { useAuthContext } from '@/shared/components/ui/auth.provider';

type UsageTab = 'cost' | 'activity';
type UsageData = UserUsage | any;
type OrgUsageData = OrgUsage | null;

export default function Usage() {
  const [activeTab, setActiveTab] = useState<UsageTab>('cost');
  const [month, setMonth] = useState(new Date());
  const [usageData, setUsageData] = useState<UsageData>(null);
  const [organizationUsageData, setOrganizationUsageData] =
    useState<OrgUsageData>(null);
  const toast = useToast();
  const { user } = useAuthContext();

  const isCost = activeTab === 'cost';
  const isActivity = activeTab === 'activity';

  const handleTabChange = (tab: UsageTab) => setActiveTab(tab);

  const handleMonthChange = (newMonth: Date) => setMonth(newMonth);

  const usageMutation = trpc.panel.getUsageAPICluster.useMutation();
  const organizationUsageMutation =
    trpc.panel.getOrganizationUsage.useMutation();

  useEffect(() => {
    if (user) {
      Promise.all([
        usageMutation.mutateAsync({ month }),
        organizationUsageMutation.mutateAsync({ month }),
      ])
        .then(([usageData, organizationUsageData]) => {
          setUsageData(usageData as UserUsage);
          setOrganizationUsageData(organizationUsageData);
        })
        .catch((err) => {
          console.error(err);
          toast.toast({
            description: err?.message || 'Error fetching usage data',
            variant: 'destructive',
            duration: 5000,
          });
        });
    }
  }, [month, user]);

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
              isActivity &&
                'bg-primary text-white hover:text-white hover:bg-primary',
            )}
          >
            Activity
          </Button>
        </div>

        <MonthPicker month={month} onMonthChange={handleMonthChange} />
      </section>

      <section
        className={cn(
          'mt-8 md:mt-14 justify-center max-xl:flex-col gap-10 hidden',
          isCost && 'flex',
        )}
      >
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

      <section
        className={cn(
          'mt-8 justify-center max-xl:flex-col gap-10 hidden',
          isActivity && 'flex',
        )}
      >
        <div className="w-full">
          {usageMutation.isPending ? (
            <LoadingSpinner />
          ) : (
            <ModelActivity usageData={usageData} />
          )}
        </div>
        {organizationUsageData && (
          <div className="w-full xl:w-[45%]">
            <OrganizationUsage organizationUsage={organizationUsageData} />
          </div>
        )}
      </section>
    </article>
  );
}