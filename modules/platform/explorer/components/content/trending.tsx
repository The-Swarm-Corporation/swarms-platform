'use client';

import { Button } from '@/shared/components/ui/button';
import React from 'react';
import InfoCard from '../info-card';
import {
  NotepadText,
  ChevronDown,
  Zap,
  Hammer,
  Code,
  MessageSquare,
} from 'lucide-react';
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
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
          <Zap className="text-[#9A8572]" />
          Trending
        </h2>
      </div>
      <div>
        {isLoading && !isFetchingTrending ? (
          <ExplorerSkeletonLoaders itemType="trending" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingModels.length > 0 ? (
                trendingModels?.map((trend: any, index: number) => {
                  const itemType = trend?.itemType || trend?.type || 'prompt';
                  const getIcon = () => {
                    switch (itemType) {
                      case 'agent':
                        return <Code />;
                      case 'tool':
                        return <Hammer />;
                      default:
                        return <MessageSquare />;
                    }
                  };

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
                        icon={<NotepadText />}
                        className="w-full h-full"
                        link={trend?.link}
                        userId={trend?.user_id}
                        is_free={
                          typeof trend?.is_free === 'boolean'
                            ? trend?.is_free
                            : true
                        }
                        price_usd={trend.price_usd}
                        seller_wallet_address={trend.seller_wallet_address}
                        itemType={itemType}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="border p-4 rounded-md text-center">
                  No trending items found
                </div>
              )}
            </div>

            {isFetchingTrending && (
              <div className="mt-4">
                <ExplorerSkeletonLoaders itemType="trending" />
              </div>
            )}

            {(hasMoreTrending || isFetchingTrending) &&
              !isLoading &&
              trendingModels?.length > 0 && (
                <div className="flex justify-center mt-8 w-full">
                  <Button
                    onClick={loadMoreTrending}
                    disabled={isFetchingTrending}
                    className="bg-green-500/20 border border-green-500/60 hover:bg-green-500/30 text-green-500 hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-green-500/25 group"
                  >
                    {isFetchingTrending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <span>Load More</span>
                        <ChevronDown className="h-4 w-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
