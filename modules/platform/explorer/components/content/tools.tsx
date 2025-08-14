'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { ChevronDown, Hammer, Plus } from 'lucide-react';
import { PUBLIC } from '@/shared/utils/constants';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';

// TODO: Add types
export default function Tools({
  isLoading,
  filteredTools,
  setAddToolModalOpen,
  usersMap,
  reviewsMap,
  loadMoreTools,
  isFetchingTools,
  hasMoreTools,
  isToolLoading,
}: any) {
  async function handleToolModal() {
    await checkUserSession();
    return setAddToolModalOpen(true);
  }
  return (
    <div className="flex flex-col gap-2 py-8 min-h-1/2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-xl font-bold md:text-3xl text-foreground">
          <Hammer className="text-[#FFD93D]" />
          Tools
        </h2>
        <Button
          onClick={handleToolModal}
          disabled={isLoading}
          className="bg-[#FFD93D]/20 border border-[#FFD93D]/60 hover:bg-[#FFD93D]/30 text-[#FFD93D] hover:text-black transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-[#FFD93D]/25 group"
        >
          <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
          Add Tool
        </Button>
      </div>
      <div>
        {isLoading && !isFetchingTools ? (
          <ExplorerSkeletonLoaders itemType="tool" />
        ) : (
          <>
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
                {filteredTools?.map((tool: any, index: number) => (
                  <div
                    className="flex flex-col w-full mb-11"
                    key={`${tool?.id}-${index}`}
                  >
                    <InfoCard
                      id={tool.id || ''}
                      title={tool.name || ''}
                      usersMap={usersMap}
                      reviewsMap={reviewsMap}
                      imageUrl={tool.image_url || ''}
                      description={tool.description || ''}
                      icon={<Hammer />}
                      className="w-full h-full"
                      link={makeUrl(PUBLIC.TOOL, { id: tool.id })}
                      userId={tool.user_id}
                      usecases={tool?.usecases}
                      requirements={tool?.requirements}
                      is_free={tool.is_free}
                      price_usd={tool.price_usd}
                      seller_wallet_address={tool.seller_wallet_address}
                      itemType="tool"
                      tags={tool?.tags?.split(',') || []}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center border rounded-md">
                No tools found
              </div>
            )}

            {isFetchingTools && (
              <div className="mt-4">
                <ExplorerSkeletonLoaders itemType="tool" />
              </div>
            )}

            {(hasMoreTools || isFetchingTools) &&
              !isLoading &&
              filteredTools?.length > 0 && (
                <div className="flex justify-center w-full mt-8">
                  <Button
                    onClick={loadMoreTools}
                    disabled={isFetchingTools || isToolLoading}
                    className="bg-[#FFD93D]/20 border border-[#FFD93D]/60 hover:bg-[#FFD93D]/30 text-[#FFD93D] hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-[#FFD93D]/25 group"
                  >
                    {isFetchingTools ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current rounded-full animate-spin border-t-transparent" />
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