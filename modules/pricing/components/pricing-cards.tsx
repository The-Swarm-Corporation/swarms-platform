'use client';

import pricingData from '@/shared/data/pricing.json';
import { cn } from '@/shared/utils/cn';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import PricingCard, { PricingCardProps } from './card';
import { Sparkles, Zap, Crown } from 'lucide-react';

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
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-black">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white/80 mb-6">
          <Sparkles className="w-4 h-4 text-white" />
          Choose Your Plan
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Pricing Plans
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          Lower Operational Costs, Increase Productivity, and Automate Your Organization with Swarms.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center justify-center mb-16">
        <div className="relative p-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md shadow-2xl">
          <div className="flex items-center gap-1">
            <Button
              onClick={() => handleTabChange('monthly')}
              className={cn(
                'relative px-8 py-3 h-12 text-sm font-semibold transition-all duration-300',
                'bg-transparent text-white/70 hover:text-white border-0',
                'focus:outline-none focus:ring-0',
                activeTab === 'monthly' && 'text-white bg-white/10',
                activeTab !== 'monthly' && 'hover:bg-white/5'
              )}
            >
              Monthly
            </Button>
            <Button
              onClick={() => handleTabChange('annually')}
              className={cn(
                'relative px-8 py-3 h-12 text-sm font-semibold transition-all duration-300',
                'bg-transparent text-white/70 hover:text-white border-0',
                'focus:outline-none focus:ring-0',
                activeTab === 'annually' && 'text-white bg-white/10',
                activeTab !== 'annually' && 'hover:bg-white/5'
              )}
            >
              <span className="relative z-10">Annually</span>
              <span className="relative z-10 ml-2 bg-red-500 px-2 py-0.5 text-xs text-white rounded-full">
                -15%
              </span>
            </Button>
            <Button
              onClick={() => handleTabChange('lifetime')}
              className={cn(
                'relative px-8 py-3 h-12 text-sm font-semibold transition-all duration-300',
                'bg-transparent text-white/70 hover:text-white border-0',
                'focus:outline-none focus:ring-0',
                activeTab === 'lifetime' && 'text-white bg-white/10',
                activeTab !== 'lifetime' && 'hover:bg-white/5'
              )}
            >
              <span className="relative z-10">Lifetime</span>
              <span className="relative z-10 ml-2 bg-white px-2 py-0.5 text-xs text-black rounded-full">
                <Crown className="w-3 h-3" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
        {pricingData.map((item, index) => (
          <div key={item.title} className="relative group">
            {/* Card Glow Effect */}
            <div className={cn(
              "absolute -inset-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              index === 1 ? "bg-red-500/10" : "bg-white/5"
            )} />
            
            <PricingCard
              {...(item as unknown as PricingCardProps)}
              isAnnually={isAnnually}
              index={index}
              page={page}
              isLifetime={isLifetime}
            />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <Zap className="w-5 h-5 text-white" />
          <span className="text-white/80 font-medium">
            All plans include 24/7 support and 99.9% uptime guarantee
          </span>
        </div>
      </div>
    </div>
  );
}
