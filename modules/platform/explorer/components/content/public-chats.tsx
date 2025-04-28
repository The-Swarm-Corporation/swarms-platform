'use client';

import React from 'react';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';
import PublicChatCard from '../chat-card';
import { MessagesSquare } from 'lucide-react';

export default function PublicChats({
  isLoading,
  filteredPublicChats,
  usersMap,
}: any) {
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Public Chats</h1>
      </div>
      <div>
        {isLoading ? (
          <ExplorerSkeletonLoaders />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
              {filteredPublicChats.length > 0 ? (
                filteredPublicChats?.map((chat: any, index: number) => {
                  const url = `/platform/chat?conversationId=${chat?.id}&shareId=${chat?.share_id}`;
                  return (
                    <div
                      key={`${chat.id}-${index}`}
                      className="flex flex-col w-full h-full sm:w-full mb-11"
                    >
                      <PublicChatCard
                        usersMap={usersMap}
                        title={chat.name}
                        description={chat.description}
                        icon={<MessagesSquare />}
                        link={url}
                        agents={chat?.agents}
                        userId={chat.user_id}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="border p-4 rounded-md text-center">
                  No prompts found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
