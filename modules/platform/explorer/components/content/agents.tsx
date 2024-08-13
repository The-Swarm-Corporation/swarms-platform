'use client';

import LoadingSpinner from '@/shared/components/loading-spinner';
import { Button } from '@/shared/components/ui/Button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Bot } from 'lucide-react';
import { PUBLIC } from '@/shared/constants/links';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';

// TODO: Add types
export default function Agents({
  isLoading,
  filteredAgents,
  setAddAgentModalOpen,
}: any) {
  async function handleAgentModal() {
    await checkUserSession();
    return setAddAgentModalOpen(true);
  }
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Agents</h1>
        <Button onClick={handleAgentModal} disabled={isLoading}>
          Add Agent
        </Button>
      </div>
      <div>
        {isLoading ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
            {filteredAgents.length > 0 ? (
              filteredAgents?.map((agent: any) => (
                <div
                  className="flex flex-col w-full h-[220px] sm:w-full mb-11"
                  key={agent.id}
                >
                  <InfoCard
                    id={agent.id || ''}
                    title={agent.name || ''}
                    description={agent.description || ''}
                    icon={<Bot />}
                    className="w-full h-full"
                    link={makeUrl(PUBLIC.AGENT, { id: agent.id })}
                    userId={agent.user_id}
                  />
                </div>
              ))
            ) : (
              <div className="border p-4 rounded-md text-center">
                No agents found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
