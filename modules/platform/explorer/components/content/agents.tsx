'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { Bot, Code, MessagesSquare } from 'lucide-react';
import { PUBLIC } from '@/shared/utils/constants';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Code className="text-red-500" />
          Agents
        </h2>
        <Button onClick={handleAgentModal} disabled={isLoading}>
          Add Agent
        </Button>
      </div>
      <div>
        {isLoading && !isFetchingAgents ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <>
            {filteredAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAgents?.map((agent: any, index: number) => {
                  const isChat = agent?.statusType === 'publicChat';
                  const url = isChat
                    ? `/platform/chat?conversationId=${agent?.id}&shareId=${agent?.share_id}`
                    : makeUrl(PUBLIC.AGENT, { id: agent.id });
                  const variant = isChat ? 'chat' : 'agents';
                  const icon = isChat ? (
                    <MessagesSquare className="w-6 h-6" />
                  ) : (
                    <Code className="w-6 h-6" />
                  );
                  return (
                    <div
                      className="flex flex-col w-full"
                      key={`${agent?.id}-${index}`}
                    >
                      <InfoCard
                        id={agent.id || ''}
                        title={agent.name || ''}
                        usersMap={usersMap}
                        reviewsMap={reviewsMap}
                        imageUrl={agent.image_url || ''}
                        description={agent.description || ''}
                        usecases={agent?.usecases}
                        requirements={agent?.requirements}
                        icon={icon}
                        className="w-full h-full"
                        link={url}
                        agents={agent?.agents}
                        userId={agent.user_id}
                        is_free={agent.is_free}
                        variant={variant}
                        tags={agent?.tags?.split(',') || []}
                      />
                    </div>
                  );
                })}
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
                  No agents found
                </div>
              </div>
            )}

            {isFetchingAgents && (
              <div className="mt-4">
                <ExplorerSkeletonLoaders />
              </div>
            )}

            {(hasMoreAgents || isFetchingAgents) && !isLoading && filteredAgents?.length > 0 && (
              <div className="w-full flex justify-center mt-4 md:mt-6">
                <button
                  onClick={loadMoreAgents}
                  disabled={isFetchingAgents || isAgentLoading}
                  className="uppercase bg-gradient-to-r from-red-700/50 to-red-600/30 hover:from-red-700/80 hover:to-red-600/60 flex justify-center p-4 font-mono relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] max-w-sm w-full disabled:pointer-events-none disabled:opacity-50"
                  style={{
                    clipPath:
                      'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  }}
                >
                  Get more agents
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
