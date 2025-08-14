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
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Hammer className="text-[#FFD93D]" />
          Tools
        </h2>
        <Button
          onClick={handleToolModal}
          disabled={isLoading}
          className="bg-[#FFD93D]/20 border border-[#FFD93D]/60 hover:bg-[#FFD93D]/30 text-[#FFD93D] hover:text-black transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-[#FFD93D]/25 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
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
              <div className="border p-4 rounded-md text-center">
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
                <div className="flex justify-center mt-8 w-full">
                  <Button
                    onClick={loadMoreTools}
                    disabled={isFetchingTools || isToolLoading}
                    className="bg-green-500/20 border border-green-500/60 hover:bg-green-500/30 text-green-500 hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-green-500/25 group"
                  >
                    {isFetchingTools ? (
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
