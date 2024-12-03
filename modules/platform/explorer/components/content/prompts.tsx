'use client';

import { Button } from '@/shared/components/spread_sheet_swarm/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { NotepadText } from 'lucide-react';
import { PUBLIC } from '@/shared/constants/links';
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
}: any) {
  async function handlePromptModal() {
    await checkUserSession();
    return setAddPromptModalOpen(true);
  }

  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Prompts</h1>
        <Button onClick={handlePromptModal} disabled={isLoading}>
          Add Prompt
        </Button>
      </div>
      <div>
        {isLoading && !isFetchingPrompts ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
            {filteredPrompts.length > 0 ? (
              filteredPrompts?.map((prompt: any) => (
                <div
                  className="flex flex-col w-full h-[220px] sm:w-full mb-11"
                  key={prompt.id}
                >
                  <InfoCard
                    id={prompt.id ?? ''}
                    title={prompt.name || ''}
                    description={prompt.description || ''}
                    icon={<NotepadText />}
                    className="w-full h-full"
                    link={makeUrl(PUBLIC.PROMPT, { id: prompt.id })}
                    userId={prompt.user_id}
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

        {(hasMorePrompts || isFetchingPrompts) && (
          <div className="flex justify-center mt-3 w-full">
            <Button
              variant="destructive"
              className="w-36 md:w-40"
              onClick={loadMorePrompts}
              disabled={isFetchingPrompts}
            >
              Get more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
