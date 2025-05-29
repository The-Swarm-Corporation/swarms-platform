'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/shared/components/chat/types';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import useChatQuery from './useChatQuery';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../ui/auth.provider';
import { Tables } from '@/types_db';

export function useConversations() {
  const {
    activeConversationId,
    sharedConversationId,
    isSharedConversation,
    sharedConversation,
    sharedConversations,
    updateQueryParams,
  } = useChatQuery();

  const {
    data: chatConversations,
    refetch,
    isLoading,
    error: chatError,
  } = trpc.chat.getConversations.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const updateConversationMutation = trpc.chat.updateConversation.useMutation();
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();
  const cloneConversationMutation =
    trpc.chat.addSharedConversation.useMutation();
  const togglePublicConversationMutation =
    trpc.chat.togglePublicConversation.useMutation();

  const addMessageMutation = trpc.chat.addMessage.useMutation();
  const editMessageMutation = trpc.chat.editMessage.useMutation();
  const deleteMessageMutation = trpc.chat.deleteMessage.useMutation();

  const { user } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replaceMode, setReplaceMode] = useState<
    'replaceAll' | 'replaceOriginal'
  >('replaceAll');
  const [openCloneModal, setOpenCloneModal] = useState(false);
  const [openTogglePublicModal, setOpenTogglePublicModal] = useState(false);

  const chatConversation = trpc.chat.getConversation.useQuery(
    activeConversationId,
    { enabled: !isSharedConversation, refetchOnWindowFocus: false },
  );

  const conversations = isSharedConversation
    ? sharedConversations
    : chatConversations;

  const activeConversation = isSharedConversation
    ? sharedConversation
    : chatConversation;

  useEffect(() => {
    if (conversations?.length && !activeConversationId) {
      const firstConversation =
        conversations.find((chat) => chat?.is_active) || conversations[0];
      if (firstConversation) {
        updateQueryParams(firstConversation.id);
      }
    }
  }, [conversations, activeConversationId]);

  const setActiveConversation = (id: string) => {
    updateQueryParams(id);
  };

  const startEditingMessage = (messageId: string) => {
    setEditingMessageId(messageId);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
  };

  const handleCloseCloneModal = () => setOpenCloneModal(false);
  const handleCloseTogglePublicModal = () => setOpenTogglePublicModal(false);

  const createConversation = async (name: string) => {
    if (!user) {
      toast({
        description: 'Log in to perform this action',
        variant: 'destructive',
      });
      router.push('/signin');
      return;
    }

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

  const togglePublicConversation = async () => {
    if (!user) {
      toast({
        description: 'Log in to perform this action',
        variant: 'destructive',
      });
      router.push('/signin');
      return;
    }

    const isPublic = activeConversation?.data?.is_public;
    const assistantReplies =
      activeConversation?.data?.messages?.filter(
        (msg) => msg.role === 'assistant',
      ) ?? [];

    if (!isPublic && assistantReplies.length < 2) {
      toast({
        description:
          'You need at least two responses from your agents before making this conversation public',
        variant: 'destructive',
      });
      return;
    }

    try {
      await togglePublicConversationMutation.mutateAsync({
        id: activeConversationId,
      });

      const isNowPublic = !activeConversation?.data?.is_public;

      toast({
        description: isNowPublic
          ? 'Conversation made public'
          : 'Conversation made private',
      });

      refetch();
      activeConversation?.refetch();
      handleCloseTogglePublicModal();
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to toggle public conversation',
        variant: 'destructive',
      });
    }
  };

  const cloneSharedConversation = async () => {
    if (!isSharedConversation) {
      toast({
        description: 'No shared conversation selected',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        description: 'Log in to perform this action',
        variant: 'destructive',
      });
      router.push('/signin');
      return;
    }

    try {
      const newChat = await cloneConversationMutation.mutateAsync({
        conversationId: activeConversationId,
        shareId: sharedConversationId,
      });

      toast({ description: 'Chat cloned successfully!' });
      setActiveConversation(newChat.id);
      refetch();
      setOpenCloneModal(false);
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to clone shared chat',
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
    const conversation = conversations?.find((c) => c?.id === id);

    if (conversation?.is_public) {
      toast({
        description: 'Please make the conversation private before deleting it.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteConversationMutation.mutateAsync(id);
      if (id === activeConversationId) {
        const remainingConversation = conversations?.find((c) => c?.id !== id);
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
  ): Promise<Tables<'swarms_cloud_chat_messages'> | null> => {
    if (!activeConversationId) {
      toast({
        description: 'No active conversation',
        variant: 'destructive',
      });
      return null;
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

  const deleteMessage = async (messageId: string | null) => {
    if (!messageId) {
      toast({
        description: 'No message to delete',
        variant: 'destructive',
      });
      return;
    }

    if (!activeConversationId) {
      toast({
        description: 'No active conversation',
        variant: 'destructive',
      });
      return;
    }

    if (activeConversation?.data?.is_public) {
      const messages = activeConversation.data.messages ?? [];
      const messagesAfterDelete = messages.filter(
        (msg) => msg.id !== messageId,
      );
      const assistantCount = messagesAfterDelete.filter(
        (m) => m.role === 'assistant',
      ).length;
      const userCount = messagesAfterDelete.filter(
        (m) => m.role === 'user',
      ).length;

      if (assistantCount < 2 || userCount < 2) {
        toast({
          description:
            'You must retain at least some messages and responses in a public conversation.',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      const updatedMessage = await deleteMessageMutation.mutateAsync({
        messageId: messageId ?? '',
      });

      if (activeConversation && activeConversation.refetch) {
        activeConversation.refetch();
      }

      toast({
        description: 'Message deleted successfully',
        variant: 'destructive',
      });
      return updatedMessage;
    } catch (err) {
      console.error(err);
      toast({
        description: 'Failed to delete message',
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
    isDeleteMessage: deleteMessageMutation.isPending,
    setReplaceMode,
    startEditingMessage,
    cancelEditingMessage,
    editMessage,
    deleteMessage,
    exportConversation,
    cloneSharedConversation,
    isClonePending: cloneConversationMutation.isPending,
    togglePublicConversation,
    isTogglePublicPending: togglePublicConversationMutation.isPending,
    openCloneModal,
    setOpenCloneModal,
    handleCloseCloneModal,
    openTogglePublicModal,
    setOpenTogglePublicModal,
    handleCloseTogglePublicModal,
  };
}
