'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Bot, MessagesSquare } from 'lucide-react';
import { PUBLIC } from '@/shared/utils/constants';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';
import PublicChatCard from '../chat-card';

// TODO: Add types
export default function Agents({
  isLoading,
  filteredAgents,
  setAddAgentModalOpen,
  usersMap,
  reviewsMap,
  loadMoreAgents,
  isFetchingAgents,
  hasMoreAgents,
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
        {isLoading && !isFetchingAgents ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
            {filteredAgents.length > 0 ? (
              filteredAgents?.map((agent: any, index: number) => (
                <div
                  className="flex flex-col w-full h-[220px] sm:w-full mb-11"
                  key={`${agent?.id}-${index}`}
                >
                  {agent?.statusType === 'agent' ? (
                    <InfoCard
                      id={agent.id || ''}
                      title={agent.name || ''}
                      usersMap={usersMap}
                      reviewsMap={reviewsMap}
                      description={agent.description || ''}
                      icon={<Bot />}
                      className="w-full h-full"
                      link={makeUrl(PUBLIC.AGENT, { id: agent.id })}
                      userId={agent.user_id}
                    />
                  ) : (
                    <PublicChatCard
                      usersMap={usersMap}
                      title={agent.name}
                      description={agent.description}
                      icon={<MessagesSquare />}
                      link={`/platform/chat?conversationId=${agent?.id}&shareId=${agent?.share_id}`}
                      agents={agent?.agents}
                      userId={agent.user_id}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="border p-4 rounded-md text-center">
                No agents found
              </div>
            )}
          </div>
        )}

        {isFetchingAgents && (
          <div className="mt-4">
            <ExplorerSkeletonLoaders />
          </div>
        )}

        {(hasMoreAgents || isFetchingAgents) && (
          <div className="flex justify-center mt-3 w-full">
            <Button
              variant="destructive"
              className="w-36 md:w-40"
              onClick={loadMoreAgents}
              disabled={isFetchingAgents}
            >
              Get more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
