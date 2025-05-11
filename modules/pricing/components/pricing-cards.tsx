'use client';

import pricingData from '@/shared/data/pricing.json';
import { cn } from '@/shared/utils/cn';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import PricingCard, { PricingCardProps } from './card';
import { Sparkles } from 'lucide-react';

type PricingTab = 'annually' | 'monthly' | 'lifetime';

export default function PricingCards({
  page,
}: {
  page?: 'pricing' | 'account';
}) {
  const [activeTab, setActiveTab] = useState<PricingTab>('annually');

  const isAnnually = activeTab === 'annually';
  const isLifetime = activeTab === 'lifetime';
  const handleTabChange = (tab: PricingTab) => setActiveTab(tab);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center mt-6 p-1 bg-secondary rounded-md">
        <Button
          onClick={() => handleTabChange('monthly')}
          className={cn(
            'px-6 py-0 h-8 w-28 lg:w-32 text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-black dark:text-white',
            'hover:bg-transparent, hover:text-primary rounded-md shadow-md',
            activeTab === 'monthly' &&
              'bg-primary text-white hover:text-white hover:bg-primary',
          )}
        >
          Monthly
        </Button>
        <Button
          onClick={() => handleTabChange('annually')}
          className={cn(
            'px-6 py-0 h-8 w-28 lg:w-32 text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-black dark:text-white',
            'hover:bg-transparent, hover:text-primary rounded-md shadow-md',
            activeTab === 'annually' &&
              'bg-primary text-white hover:text-white hover:bg-primary',
          )}
        >
          Annually{' '}
          <span className="ml-2 bg-black p-1 px-2 text-xs text-white rounded-sm shadow-sm">
            -1.5%
          </span>
        </Button>
        <Button
          onClick={() => handleTabChange('lifetime')}
          className={cn(
            'px-6 py-0 h-8 w-28 lg:w-32 text-sm font-medium capitalize focus:outline-none focus-visible:outline-black bg-transparent text-black dark:text-white',
            'hover:bg-transparent, hover:text-primary rounded-md shadow-md',
            activeTab === 'lifetime' &&
              'bg-primary text-white hover:text-white hover:bg-primary',
          )}
        >
          Lifetime{' '}
          <span className="ml-2 bg-black p-1 px-2 rounded-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-600" />
          </span>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8 mt-12 lg:gap-2 lg:grid-cols-3">
        {pricingData.map((item, index) => (
          <PricingCard
            key={item.title}
            {...(item as unknown as PricingCardProps)}
            isAnnually={isAnnually}
            index={index}
            page={page}
            isLifetime={isLifetime}
          />
        ))}
      </div>
    </div>
  );
}
