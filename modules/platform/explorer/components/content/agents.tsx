'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { MessageCircle, Plus, ChevronDown, Code } from 'lucide-react';
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
  isAgentLoading,
}: any) {
  async function handleAgentModal() {
    await checkUserSession();
    return setAddAgentModalOpen(true);
  }
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Agents</h1>
        <Button
          onClick={handleAgentModal}
          disabled={isLoading}
          className="bg-[#4ECDC4]/20 border border-[#4ECDC4]/60 hover:bg-[#4ECDC4]/30 text-[#4ECDC4] hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-[#4ECDC4]/25 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Add Agent
        </Button>
      </div>
      <div>
        {isLoading && !isFetchingAgents ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.length > 0 ? (
              filteredAgents?.map((agent: any, index: number) => (
                <div
                  className="flex flex-col w-full"
                  key={`${agent?.id}-${index}`}
                >
                  {agent?.statusType === 'agent' ? (
                    <InfoCard
                      id={agent.id || ''}
                      title={agent.name || ''}
                      usersMap={usersMap}
                      reviewsMap={reviewsMap}
                      imageUrl={agent.image_url || ''}
                      description={agent.description || ''}
                      icon={<Code />}
                      className="w-full h-full"
                      link={makeUrl(PUBLIC.AGENT, { id: agent.id })}
                      userId={agent.user_id}
                      itemType="agent"
                    />
                  ) : (
                    <PublicChatCard
                      usersMap={usersMap}
                      title={agent.name}
                      description={agent.description || 'Join this public conversation and explore AI-powered discussions with multiple agents.'}
                      icon={<MessageCircle />}
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

        {(hasMoreAgents || isFetchingAgents) && !isLoading && filteredAgents?.length > 0 && (
          <div className="flex justify-center mt-8 w-full">
            <Button
              onClick={loadMoreAgents}
              disabled={isFetchingAgents || isAgentLoading}
              className="bg-[#4ECDC4]/20 border border-[#4ECDC4]/60 hover:bg-[#4ECDC4]/30 text-[#4ECDC4] hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-[#4ECDC4]/25 group"
            >
              {isFetchingAgents ? (
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
