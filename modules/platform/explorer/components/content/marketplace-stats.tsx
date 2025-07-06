'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import { Card } from '@/shared/components/ui/card';
import { Loader2, AlertCircle, Box, Users, Wrench } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const MarketplaceStats = () => {
  const { data: stats, isLoading, error } = trpc.explorer.getMarketplaceStats.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      retry: 2,
      cacheTime: 5 * 60 * 1000,
      staleTime: 4 * 60 * 1000,
    }
  );

  if (error) {
    return (
      <div className="flex justify-center items-center h-12 text-red-500 gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load marketplace statistics</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Prompts',
      count: stats?.prompts ?? '-',
      description: 'Available prompts in marketplace',
      icon: Box,
      iconColor: 'text-blue-400'
    },
    {
      title: 'Total Agents',
      count: stats?.agents ?? '-',
      description: 'Active agents ready to use',
      icon: Users,
      iconColor: 'text-purple-400'
    },
    {
      title: 'Total Tools',
      count: stats?.tools ?? '-',
      description: 'Tools in the marketplace',
      icon: Wrench,
      iconColor: 'text-green-400'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={cn(
              'relative overflow-hidden bg-transparent',
              'border border-gray-700/50',
              'hover:border-gray-600/70 hover:bg-white/[0.02] transition-all duration-300'
            )}
          >
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/90">{stat.title}</h3>
                <Icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                      <span className="text-sm text-white/70">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl font-bold tracking-tight text-white">{stat.count}</span>
                      <span className="text-sm text-white/70">total</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-white/70">{stat.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MarketplaceStats; 