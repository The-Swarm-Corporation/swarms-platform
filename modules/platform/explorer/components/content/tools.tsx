'use client';

import { Button } from '@/shared/components/ui/Button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Hammer } from 'lucide-react';
import { PUBLIC } from '@/shared/constants/links';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';

// TODO: Add types
export default function Tools({
  isLoading,
  filteredTools,
  setAddToolModalOpen,
}: any) {
  async function handleToolModal() {
    await checkUserSession();
    return setAddToolModalOpen(true);
  }
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Tools</h1>
        <Button onClick={handleToolModal} disabled={isLoading}>
          Add tool
        </Button>
      </div>
      <div>
        {isLoading ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
            {filteredTools.length > 0 ? (
              filteredTools?.map((tool: any) => (
                <div
                  className="flex flex-col w-full h-[220px] sm:w-full mb-11"
                  key={tool.id}
                >
                  <InfoCard
                    id={tool.id || ''}
                    title={tool.name || ''}
                    description={tool.description || ''}
                    icon={<Hammer />}
                    className="w-full h-full"
                    link={makeUrl(PUBLIC.TOOL, { id: tool.id })}
                    userId={tool.user_id}
                  />
                </div>
              ))
            ) : (
              <div className="border p-4 rounded-md text-center">
                No tools found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
