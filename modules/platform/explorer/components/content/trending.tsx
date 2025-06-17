'use client';

import { Button } from '@/shared/components/ui/button';
import React from 'react';
import InfoCard from '../info-card';
import { NotepadText, Zap } from 'lucide-react';
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
          <Zap className="text-red-500" />
          Trending
        </h2>
      </div>
      <div>
        {isLoading && !isFetchingTrending ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
              {trendingModels.length > 0 ? (
                trendingModels?.map((trend: any, index: number) => (
                  <div
                    className="flex flex-col w-full h-[220px] sm:w-full mb-11"
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
                      price={trend.price}
                      seller_wallet_address={trend.seller_wallet_address}
                      type="prompt"
                    />
                  </div>
                ))
              ) : (
                <div className="border p-4 rounded-md text-center">
                  No prompts found
                </div>
              )}
            </div>

            {isFetchingTrending && (
              <div className="mt-4">
                <ExplorerSkeletonLoaders />
              </div>
            )}

            {(hasMoreTrending || isFetchingTrending) &&
              !isLoading &&
              trendingModels?.length > 0 && (
                <div className="flex justify-center mt-3 w-full">
                  <Button
                    variant="destructive"
                    className="w-36 md:w-40"
                    onClick={loadMoreTrending}
                    disabled={isFetchingTrending}
                  >
                    Get more
                  </Button>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
