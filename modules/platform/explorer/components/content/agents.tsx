'use client';

import { Button } from '@/shared/components/ui/button';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { MessageCircle, Plus, ChevronDown, Code, Database } from 'lucide-react';
import { PUBLIC } from '@/shared/utils/constants';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';
import PublicChatCard from '../chat-card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  
  async function handleAgentModal() {
    await checkUserSession();
    return setAddAgentModalOpen(true);
  }
  
  const handleRegistryClick = () => {
    router.push('/platform/registry');
    // Force scroll to top after navigation
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Code className="text-[#4ECDC4]" />
          Agents
        </h2>
        <div className="flex gap-3">
          <Button
            onClick={handleRegistryClick}
            disabled={isLoading}
            className="bg-[#6366f1]/20 border border-[#6366f1]/60 hover:bg-[#6366f1]/30 text-[#6366f1] hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-[#6366f1]/25 group"
          >
            <Database className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            View Registry
          </Button>
          <Button
            onClick={handleAgentModal}
            disabled={isLoading}
            className="bg-zinc-900/50 border border-zinc-700/50 hover:bg-zinc-700/30 text-zinc-300 hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-zinc-700/25 group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Add Agent
          </Button>
        </div>
      </div>
      <div>
        {isLoading && !isFetchingAgents ? (
          <ExplorerSkeletonLoaders itemType="agent" />
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
                      is_free={agent.is_free}
                      price_usd={agent.price_usd}
                      seller_wallet_address={agent.seller_wallet_address}
                      usecases={agent?.usecases}
                      requirements={agent?.requirements}
                      tags={agent?.tags?.split(',') || []}
                      itemType="agent"
                    />
                  ) : (
                    <PublicChatCard
                      usersMap={usersMap}
                      title={agent.name}
                      description={
                        agent.description ||
                        'Join this public conversation and explore AI-powered discussions with multiple agents.'
                      }
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
            <ExplorerSkeletonLoaders itemType="agent" />
          </div>
        )}

        {(hasMoreAgents || isFetchingAgents) &&
          !isLoading &&
          filteredAgents?.length > 0 && (
            <div className="flex justify-center mt-8 w-full">
              <Button
                onClick={loadMoreAgents}
                disabled={isFetchingAgents || isAgentLoading}
                className="bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-md shadow-lg hover:shadow-zinc-700/25 group"
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
