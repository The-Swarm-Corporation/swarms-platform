'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Wrench } from 'lucide-react';
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
        <h2 className="text-xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Wrench className="text-red-500" />
          Tools
        </h2>
        <Button onClick={handleToolModal} disabled={isLoading}>
          Add tool
        </Button>
      </div>
      <div>
        {isLoading && !isFetchingTools ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <>
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTools?.map((tool: any, index: number) => (
                  <div
                    className="flex flex-col w-full"
                    key={`${tool?.id}-${index}`}
                  >
                    <InfoCard
                      id={tool.id || ''}
                      title={tool.name || ''}
                      usersMap={usersMap}
                      reviewsMap={reviewsMap}
                      imageUrl={tool.image_url || ''}
                      description={tool.description || ''}
                      icon={<Wrench className="w-6 h-6" />}
                      className="w-full h-full"
                      link={makeUrl(PUBLIC.TOOL, { id: tool.id })}
                      userId={tool.user_id}
                      is_free={tool.is_free}
                      variant="tools"
                      tags={tool?.tags?.split(',') || []}
                    />
                  </div>
                ))}
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
                  No tools found
                </div>
              </div>
            )}

            {isFetchingTools && (
              <div className="mt-4">
                <ExplorerSkeletonLoaders />
              </div>
            )}

            {(hasMoreTools || isFetchingTools) && !isLoading && (
              <div className="w-full flex justify-center mt-4 md:mt-6">
                <button
                  onClick={loadMoreTools}
                  disabled={isFetchingTools || isToolLoading}
                  className="uppercase bg-gradient-to-r from-red-700/50 to-red-600/30 hover:from-red-700/80 hover:to-red-600/60 flex justify-center p-4 font-mono relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] max-w-sm w-full disabled:pointer-events-none disabled:opacity-50"
                  style={{
                    clipPath:
                      'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  }}
                >
                  Get more tools
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
