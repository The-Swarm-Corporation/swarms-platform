'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/shared/components/chat/types';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

export function useConversations() {
  const {
    data: conversations,
    refetch,
    isLoading,
    error: chatError,
  } = trpc.chat.getConversations.useQuery();
  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();
  const addMessageMutation = trpc.chat.addMessage.useMutation();

  const { toast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState('');

  const activeConversation =
    trpc.chat.getConversation.useQuery(activeConversationId);

  useEffect(() => {
    if (conversations?.length && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const createConversation = async (name: string) => {
    try {
      const newConversation = await createConversationMutation.mutateAsync({
        name,
      });
      setActiveConversationId(newConversation.id);
      refetch();
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    }
  };

  const switchConversation = (id: string) => {
    if (id !== activeConversationId) {
      setActiveConversationId(id);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await deleteConversationMutation.mutateAsync(id);

      if (id === activeConversationId) {
        const remainingConversation = conversations?.find((c) => c.id !== id);
        setActiveConversationId(remainingConversation?.id ?? '');
      }
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  };

  const addMessage = async (message: Omit<Message, 'id'>) => {
    if (!activeConversationId) {
      throw new Error('No active conversation');
    }

    try {
      await addMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        message,
      });
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to add message',
        variant: 'destructive',
      });
    }
  };

  const exportConversation = async () => {
    if (
      !activeConversation.data?.name ||
      activeConversation.data.messages.length === 0
    ) {
      toast({
        description: 'No active conversation to export',
        variant: 'destructive',
      });
    }

    try {
      const json = JSON.stringify(activeConversation, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${activeConversation.data?.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to export conversation',
        variant: 'destructive',
      });
    }
  };

  return {
    isLoading,
    chatError,
    conversations,
    activeConversation,
    activeConversationId,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    exportConversation,
  };
}
