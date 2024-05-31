'use client';

import { Button } from '@/shared/components/ui/Button';
import pricingData from '@/shared/data/pricing.json';
import { cn } from '@/shared/utils/cn';
import { useState } from 'react';
import PricingCard, { PricingCardProps } from './components/card';

type PricingTab = 'annually' | 'monthly';

const Pricing = () => {
  const [activeTab, setActiveTab] = useState<PricingTab>('annually');

  const isAnnually = activeTab === 'annually';
  const handleTabChange = (tab: PricingTab) => setActiveTab(tab);

  return (
    <section className="relative overflow-hidden" id='pricing'>
      <div className="relative flex flex-col items-center justify-center max-w-6xl px-8 py-12 mx-auto lg:py-24">
        <div>
          <span className="text-6xl font-bold tracking-wide capitalize">
            Pricing
          </span>
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-center mt-6 p-1 bg-secondary rounded-md">
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
                -15%
              </span>
            </Button>
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
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 mt-12 lg:ap-2 lg:grid-cols-3">
          {pricingData.map((item) => (
            <PricingCard
              key={item.title}
              {...(item as unknown as PricingCardProps)}
              isAnnually={isAnnually}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
