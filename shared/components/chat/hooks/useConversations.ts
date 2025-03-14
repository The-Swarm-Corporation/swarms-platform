'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/shared/components/chat/types';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useConversations() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeConversationId = searchParams?.get('conversationId') || '';

  const {
    data: conversations,
    refetch,
    isLoading,
    error: chatError,
  } = trpc.chat.getConversations.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const updateConversationMutation = trpc.chat.updateConversation.useMutation();
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();
  const addMessageMutation = trpc.chat.addMessage.useMutation();
  const editMessageMutation = trpc.chat.editMessage.useMutation();
  const { toast } = useToast();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replaceMode, setReplaceMode] = useState<
    'replaceAll' | 'replaceOriginal'
  >('replaceAll');

  const activeConversation = trpc.chat.getConversation.useQuery(
    activeConversationId,
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (conversations?.length && !activeConversationId) {
      const firstConversation =
        conversations.find((chat) => chat.is_active) || conversations[0];
      if (firstConversation) {
        updateQueryParams(firstConversation.id);
      }
    }
  }, [conversations, activeConversationId]);

  const updateQueryParams = (conversationId: string) => {
    const newSearchParams = new URLSearchParams(searchParams ?? '');
    newSearchParams.set('conversationId', conversationId);

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const setActiveConversation = (id: string) => {
    updateQueryParams(id);
  };

  const startEditingMessage = (messageId: string) => {
    setEditingMessageId(messageId);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
  };

  const createConversation = async (name: string) => {
    try {
      const newConversation = await createConversationMutation.mutateAsync({
        name,
        isActive: true,
      });
      setActiveConversation(newConversation.id);
      refetch();
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    }
  };

  const switchConversation = async (id: string) => {
    if (id !== activeConversationId) {
      setActiveConversation(id);

      try {
        await updateConversationMutation.mutateAsync({
          id,
          is_active: true,
        });
        refetch();
      } catch (err) {
        console.error(err);
        toast({
          description: 'Failed to switch conversation',
          variant: 'destructive',
        });
      }
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await deleteConversationMutation.mutateAsync(id);
      if (id === activeConversationId) {
        const remainingConversation = conversations?.find((c) => c.id !== id);
        setActiveConversation(remainingConversation?.id ?? '');
      }
      refetch();
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
      toast({
        description: 'No active conversation',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        message,
      });
    } catch (err) {
      console.error(err);
      toast({ description: 'Failed to add message', variant: 'destructive' });
    }
  };

  const editMessage = async (
    messageId: string,
    newContent: string,
    replaceAll: boolean = true,
  ) => {
    if (!activeConversationId) {
      toast({
        description: 'No active conversation',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedMessage = await editMessageMutation.mutateAsync({
        messageId,
        newContent,
        chatId: activeConversationId,
        replaceAll,
      });

      setEditingMessageId(null);

      if (activeConversation && activeConversation.refetch) {
        activeConversation.refetch();
      }

      return updatedMessage;
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to edit message',
        variant: 'destructive',
      });
      return null;
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
    refetch,
    refetchActiveChat: activeConversation.refetch,
    isActiveLoading: activeConversation.isLoading,
    isCreatePending: createConversationMutation.isPending,
    isDeletePending: deleteConversationMutation.isPending,
    isUpdatePending: updateConversationMutation.isPending,
    createConversation,
    updateConversation: updateConversationMutation.mutateAsync,
    switchConversation,
    deleteConversation,
    addMessage,
    editingMessageId,
    replaceMode,
    setReplaceMode,
    startEditingMessage,
    cancelEditingMessage,
    editMessage,
    exportConversation,
  };
}
