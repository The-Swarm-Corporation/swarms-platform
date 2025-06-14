'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Brain, NotepadText } from 'lucide-react';
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Brain className="text-red-500" />
          Prompts
        </h2>
        <Button onClick={handlePromptModal} disabled={isLoading}>
          Add Prompt
        </Button>
      </div>
      <div>
        {isLoading && !isFetchingPrompts ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <>
            {filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPrompts?.map((prompt: any, index: number) => (
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
                      icon={<Brain className="w-6 h-6" />}
                      className="w-full h-full"
                      link={makeUrl(PUBLIC.PROMPT, { id: prompt.id })}
                      userId={prompt.user_id}
                      is_free={prompt.is_free}
                      usecases={prompt?.usecases}
                        requirements={prompt?.requirements}
                      variant="prompts"
                      tags={prompt?.tags?.split(',') || []}
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
                  No prompts found
                </div>
              </div>
            )}

            {isFetchingPrompts && (
              <div className="mt-4">
                <ExplorerSkeletonLoaders />
              </div>
            )}

            {(hasMorePrompts || isFetchingPrompts) && !isLoading && filteredPrompts?.length > 0 && (
              <div className="w-full flex justify-center mt-4 md:mt-6">
                <button
                  onClick={loadMorePrompts}
                  disabled={isFetchingPrompts || isPromptLoading}
                  className="uppercase bg-gradient-to-r from-red-700/50 to-red-600/30 hover:from-red-700/80 hover:to-red-600/60 flex justify-center p-4 font-mono relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] max-w-sm w-full disabled:pointer-events-none disabled:opacity-50"
                  style={{
                    clipPath:
                      'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  }}
                >
                  Get more prompts
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
