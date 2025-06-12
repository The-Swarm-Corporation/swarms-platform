'use client';

import { Button } from '@/shared/components/ui/button';
import React from 'react';
import InfoCard from '../info-card';
import { Brain, Code, NotepadText, Wrench, Zap } from 'lucide-react';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';

export default function Trending({
  isLoading,
  trendingModels,
  isFetchingTrending,
  loadMoreTrending,
  hasMoreTrending,
  usersMap,
  reviewsMap,
}: any) {
  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'prompt':
        return <Brain className="w-6 h-6" />;
      case 'agent':
        return <Code className="w-6 h-6" />;
      case 'tool':
        return <Wrench className="w-6 h-6" />;
      default:
        return <NotepadText className="w-6 h-6" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'prompt':
        return 'prompts';
      case 'agent':
        return 'agents';
      case 'tool':
        return 'tools';
      default:
        return 'chat';
    }
  };

  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Zap className="text-red-500" />
        Trending
      </h2>
      <div>
        {isLoading && !isFetchingTrending ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <>
            {trendingModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {trendingModels?.map((trend: any, index: number) => {
                  const icon = getIcon(trend?.type);
                  const variant = getVariant(trend?.type);
                  return (
                    <div
                      className="flex flex-col w-full"
                      key={`${trend.id}-${index}`}
                    >
                      <InfoCard
                        id={trend.id ?? ''}
                        title={trend.name || ''}
                        usersMap={usersMap}
                        reviewsMap={reviewsMap}
                        imageUrl={trend.image_url || ''}
                        description={trend.description || ''}
                        icon={icon}
                        className="w-full h-full"
                        link={trend?.link}
                        userId={trend?.user_id}
                        variant={variant}
                        is_free={trend?.is_free}
                        tags={trend?.tags?.split(',') || []}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div
                  className="bg-gradient-to-r from-red-700/30 to-red-600/10 flex justify-center p-4 font-mono relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] max-w-sm w-full"
                  style={{
                    clipPath:
                      'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  }}
                >
                  No data found
                </div>
              </div>
            )}

            {isFetchingTrending && (
              <div className="mt-4">
                <ExplorerSkeletonLoaders />
              </div>
            )}

            {(hasMoreTrending || isFetchingTrending) && (
              <div className="w-full flex justify-center mt-4 md:mt-6">
                <button
                  onClick={loadMoreTrending}
                  disabled={isFetchingTrending || isLoading}
                  className="uppercase bg-gradient-to-r from-red-700/50 to-red-600/30 hover:from-red-700/80 hover:to-red-600/60 flex justify-center p-4 font-mono relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] max-w-sm w-full disabled:pointer-events-none disabled:opacity-50"
                  style={{
                    clipPath:
                      'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  }}
                >
                  Get more trends
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
