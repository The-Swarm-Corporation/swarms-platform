'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Plus, ChevronDown, MessageSquare } from 'lucide-react';
import { PUBLIC } from '@/shared/utils/constants';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';

// TODO: Add types
export default function Prompts({
  isLoading,
  filteredPrompts,
  isFetchingPrompts,
  loadMorePrompts,
  hasMorePrompts,
  setAddPromptModalOpen,
  usersMap,
  reviewsMap,
  isPromptLoading,
}: any) {
  async function handlePromptModal() {
    await checkUserSession();
    return setAddPromptModalOpen(true);
  }

  return (
    <div className="flex flex-col min-h-1/2 gap-2 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Prompts</h1>
        <Button
          onClick={handlePromptModal}
          disabled={isLoading}
          className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/60 hover:bg-[#FF6B6B]/30 text-[#FF6B6B] hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-[#FF6B6B]/25 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Add Prompt
        </Button>
      </div>
      <div>
        {isLoading && !isFetchingPrompts ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.length > 0 ? (
              filteredPrompts?.map((prompt: any, index: number) => (
                <div
                  className="flex flex-col w-full"
                  key={`${prompt?.id}-${index}`}
                >
                  <InfoCard
                    id={prompt.id ?? ''}
                    title={prompt.name || ''}
                    usersMap={usersMap}
                    reviewsMap={reviewsMap}
                    imageUrl={prompt.image_url || ''}
                    description={prompt.description || ''}
                    icon={<MessageSquare />}
                    className="w-full h-full"
                    link={makeUrl(PUBLIC.PROMPT, { id: prompt.id })}
                    userId={prompt.user_id}
                    itemType="prompt"
                  />
                </div>
              ))
            ) : (
              <div className="border p-4 rounded-md text-center">
                No prompts found
              </div>
            )}
          </div>
        )}

        {isFetchingPrompts && (
          <div className="mt-4">
            <ExplorerSkeletonLoaders />
          </div>
        )}

        {(hasMorePrompts || isFetchingPrompts) && !isLoading && filteredPrompts?.length > 0 && (
          <div className="flex justify-center mt-8 w-full">
            <Button
              onClick={loadMorePrompts}
              disabled={isFetchingPrompts || isPromptLoading}
              className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/60 hover:bg-[#FF6B6B]/30 text-[#FF6B6B] hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-[#FF6B6B]/25 group"
            >
              {isFetchingPrompts ? (
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
      </div>
    </div>
  );
}
