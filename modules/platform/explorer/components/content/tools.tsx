'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Hammer, Wrench } from 'lucide-react';
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
              <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
                {filteredTools?.map((tool: any, index: number) => (
                  <div
                    className="flex flex-col w-full h-[220px] sm:w-full mb-11"
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
                      is_free
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
                <ExplorerSkeletonLoaders />
              </div>
            )}

            {(hasMoreTools || isFetchingTools) &&
              !isLoading &&
              filteredTools?.length > 0 && (
                <div className="flex justify-center mt-3 w-full">
                  <Button
                    variant="destructive"
                    className="w-36 md:w-40"
                    onClick={loadMoreTools}
                    disabled={isFetchingTools || isToolLoading}
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
