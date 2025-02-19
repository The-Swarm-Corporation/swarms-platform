'use client';

import { useState, useEffect } from 'react';
import {
  Message,
  Conversation,
} from '@/shared/components/chat/types';
import { db } from '../mock/db';
import { trpc } from '@/shared/utils/trpc/trpc';

export function useConversations() {
  const { data: conversations, refetch, isLoading, error: chatError } = trpc.chat.getConversations.useQuery();
  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();
  const addMessageMutation = trpc.chat.addMessage.useMutation();

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (conversations && conversations?.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation]);

  const createConversation = async (name: string) => {
    const newConversation = await createConversationMutation.mutateAsync({ name });
    refetch();
    setActiveConversation(newConversation);
  };

  const switchConversation = (id: string) => {
    setActiveConversation(conversations?.find((c) => c.id === id) || null);
  };

  const deleteConversation = async (id: string) => {
    await deleteConversationMutation.mutateAsync({ id });
    refetch();
    if (activeConversation?.id === id) {
      setActiveConversation(conversations?.[0] || null);
    }
  };

  const addMessage = async (message: Omit<Message, 'id'>) => {
    if (!activeConversation) return;
    await addMessageMutation.mutateAsync({ conversationId: activeConversation.id, ...message });
    refetch();
  };

  const exportConversation = async (id: string) => {
    try {
      const json = await db.exportConversation(id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to export conversation'),
      );
      throw err;
    }
  };

  return {
    conversations,
    activeConversation,
    isLoading,
    error,
    chatError,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    exportConversation,
  };
}
