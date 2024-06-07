'use client';

import LoadingSpinner from '@/shared/components/loading-spinner';
import { Button } from '@/shared/components/ui/Button';
import { makeUrl } from '@/shared/utils/helpers';
import Link from 'next/link';
import React from 'react';
import InfoCard from '../info-card';
import { Terminal } from 'lucide-react';
import { PUBLIC } from '@/shared/constants/links';

// TODO: Add types
export default function Prompts({
  allPrompts,
  filteredPrompts,
  setAddPromptModalOpen,
}: any) {

  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Prompts</h1>
        <Button onClick={() => setAddPromptModalOpen(true)}>Add Prompt</Button>
      </div>
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
        {allPrompts.isLoading ? (
          <LoadingSpinner size={24} />
        ) : filteredPrompts.length > 0 ? (
          filteredPrompts?.map((prompt: any) => (
            <div className='flex flex-col w-full h-[220px] sm:w-full mb-11' key={prompt.id}>
              {/* <Link
                key={prompt.id}
                className="w-full h-[220px] sm:w-full mb-11"
                href={makeUrl(PUBLIC.PROMPT, { id: prompt.id })}
              > */}
              <InfoCard
                title={prompt.name || ''}
                description={prompt.prompt || ''}
                icon={<Terminal />}
                className="w-full h-full"
                isRating={true}
                promptId={prompt.id}
                link={makeUrl(PUBLIC.PROMPT, { id: prompt.id })}
              />
              {/* </Link> */}
            </div>
          ))
        ) : (
          <div className="border p-4 rounded-md text-center">
            No prompts found
          </div>
        )}
      </div>
    </div>
  );
}