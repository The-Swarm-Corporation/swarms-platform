'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { useConfig } from './useChatConfig';
import { useConversations } from './useConversations';
import { Tables } from '@/types_db';
import { SwarmsApiClient } from '@/shared/utils/api/swarms';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useFileUpload } from './useFileUpload';
import { trpc } from '@/shared/utils/trpc/trpc';
import {
  extractContentAsString,
  isConversationDefaultName,
  parseJSON,
  transformEditMessages,
  transformMessages,
} from '../helper';
import useChatQuery from './useChatQuery';

export default function useSwarmsChat() {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [isFetching, setIsFetching] = useState(true);
  const [messages, setMessages] = useState<
    Omit<Tables<'swarms_cloud_chat_messages'>, 'is_deleted'>[]
  >([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [loadingAfterMessageId, setLoadingAfterMessageId] = useState<
    string | null
  >(null);
  const [models, setModels] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);
  const isCreatingConversation = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { isSharedConversation } = useChatQuery();

  const isCreatingApiKey = useRef(false);

  const apiKeyQuery = trpc.apiKey.getValidApiKey.useQuery(
    { isShareId: !!isSharedConversation },
    {
      refetchOnWindowFocus: false,
    },
  );

  const createApiKeyMutation = trpc.apiKey.createDefaultApiKey.useMutation({
    onSuccess: () => {
      apiKeyQuery.refetch();
      isCreatingApiKey.current = false;
      setCreationError(null);
    },
    onError: (error) => {
      isCreatingApiKey.current = false;
      setCreationError(error.message);
      setIsInitializing(false);
    },
    onSettled: () => {
      // Only update initialization state if we're no longer creating an API key
      if (!isCreatingApiKey.current) {
        setIsInitializing(false);
      }
    },
  });

  const swarmsApi = useRef<SwarmsApiClient | null>(null);

  useEffect(() => {
    if (!apiKeyQuery.isLoading) {
      if (!apiKeyQuery.data && !isCreatingApiKey.current) {
        isCreatingApiKey.current = true;
        createApiKeyMutation.mutate();
      }
    }
  }, [apiKeyQuery.isLoading, apiKeyQuery.data]);

  useEffect(() => {
    if (apiKeyQuery.data?.key && isInitializing) {
      swarmsApi.current = new SwarmsApiClient(apiKeyQuery.data.key);

      const fetchModels = async () => {
        try {
          const data = await swarmsApi.current!.getModels();
          setModels(
            data?.models || [
              'gpt-4o',
              'gpt-4o-mini',
              'gpt-3.5-turbo',
              'openai/gpt-4o',
            ],
          );
        } catch (error) {
          console.error('Error fetching models:', error);
        } finally {
          setIsInitializing(false);
        }
      };

      fetchModels();
    }
  }, [apiKeyQuery.data, isInitializing]);

  const {
    conversations,
    activeConversation,
    activeConversationId,
    isActiveLoading,
    isDeleteMessage,
    editingMessageId,
    isLoading: isLoadingConversations,
    isCreatePending,
    isDeletePending,
    isUpdatePending,
    replaceMode,
    isTogglePublicPending,
    openCloneModal,
    isClonePending,
    openTogglePublicModal,
    editMessage,
    deleteMessage,
    startEditingMessage,
    cancelEditingMessage,
    setReplaceMode,
    refetch,
    createConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    exportConversation,
    cloneSharedConversation,
    togglePublicConversation,
    setOpenCloneModal,
    handleCloseCloneModal,
    setOpenTogglePublicModal,
    handleCloseTogglePublicModal,
  } = useConversations();
  const {
    agents,
    swarmConfig,
    openAgentModal,
    isCreateAgent,
    isUpdateAgent,
    isToggleAgent,
    isDeleteAgent,
    isLoading: isLoadingAgents,
    setOpenAgentModal,
    agentsRefetch,
    addAgent,
    updateAgent,
    removeAgent,
    updateSwarmArchitecture,
    toggleAgent,
  } = useConfig({
    activeConversationId,
  });
  const {
    imageUrl,
    image,
    filePath,
    isDeleteFile,
    uploadStatus,
    uploadProgress,
    deleteImage,
    setImage,
    setImageUrl,
    uploadImage,
  } = useFileUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading || isActiveLoading || uploadStatus === 'uploading') return;

    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file, activeConversationId);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (isLoading || isActiveLoading || uploadStatus === 'uploading') return;

    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (file) await uploadImage(file, activeConversationId);
  };

  const handleTogglePublicModal = (open: boolean) => {
    const conversationName = activeConversation?.data?.name;

    if (isConversationDefaultName(conversationName)) {
      toast({
        description: 'Please give your conversation a better name',
        variant: 'destructive',
      });
      setActiveChatId(activeConversationId);
      setIsEditModalOpen(true);
      return;
    }

    setOpenTogglePublicModal(open);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;

        recognition.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');

          setInput(transcript);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [messages]);

  useEffect(() => {
    if (
      !isLoadingConversations &&
      conversations?.length === 0 &&
      !isCreatingConversation.current
    ) {
      isCreatingConversation.current = true;
      createConversation('New Chat').finally(() => {
        isCreatingConversation.current = false;
      });
    }
  }, [isLoadingConversations]);

  useEffect(() => {
    if (activeConversation?.data?.messages) {
      setMessages(activeConversation.data.messages);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.data?.messages]);

  const toggleListening = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading || !activeConversation) return;
    if (activeConversation.data?.id !== activeConversationId) return;

    setReplaceMode('replaceAll');

    const userMessage = input.trim();
    const timestamp = new Date().toISOString();

    const userMessageObj = {
      id: crypto.randomUUID(),
      chat_id: activeConversation?.data?.id ?? '',
      role: 'user',
      content: JSON.stringify([{ role: 'user', content: userMessage }]),
      structured_content: null,
      timestamp,
      user_id: user?.id || null,
      agent_id: '',
      metadata: null,
      img: imageUrl || '',
      is_edited: false,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const activeAgents = agents.filter((agent) => agent.is_active);

    if (!swarmConfig?.architecture) {
      toast({
        description: 'No active swarm architecture selected',
        variant: 'destructive',
      });
      return;
    }

    if (activeAgents.length < 2) {
      toast({
        description: 'A swarm must have at least two active agents.',
        variant: 'destructive',
      });
      return;
    }

    setMessages((prev) => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);

    try {
      const dbWritePromise = addMessage({
        content: userMessageObj.content,
        role: 'user',
        timestamp: userMessageObj.timestamp,
        imageUrl: userMessageObj.img,
        agentId: agents?.[0]?.id,
      });

      const apiAgents = SwarmsApiClient.convertAgentsToApiFormat(
        activeAgents,
        swarmConfig.architecture,
      );
      const swarmType = SwarmsApiClient.getSwarmType(swarmConfig.architecture);

      const messages = transformMessages(activeConversation?.data?.messages);

      const extractedTask = extractContentAsString(messages, userMessage);

      const swarmRequest = {
        name: activeConversation.data?.name || 'Chat Session',
        description:
          activeConversation.data?.description || 'Chat Session Description',
        agents: apiAgents,
        swarm_type: swarmType,
        task: extractedTask,
        max_loops: activeConversation.data?.max_loops || 1,
        img: imageUrl || '',
        messages,
      };

      const swarmPromise = swarmsApi?.current?.executeSwarm(swarmRequest);

      const [, response] = await Promise.all([dbWritePromise, swarmPromise]);

      const aiResponseObj = {
        id: crypto.randomUUID(),
        chat_id: activeConversation?.data?.id ?? '',
        role: 'assistant',
        content: JSON.stringify(response?.output),
        structured_content: response?.output
          ? JSON.stringify(response?.output)
          : null,
        timestamp: new Date().toISOString(),
        user_id: null,
        img: imageUrl || null,
        agent_id: activeAgents[0]?.id || '',
        metadata: response?.metadata ? JSON.stringify(response.metadata) : null,
        is_edited: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiResponseObj]);
      setIsLoading(false);
      setImage(null);
      setImageUrl(null);

      await addMessage({
        content: aiResponseObj.content,
        role: 'assistant',
        timestamp: aiResponseObj.timestamp,
        agentId: aiResponseObj.agent_id,
      });
      activeConversation.refetch();
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      toast({
        description: 'An error occurred while processing your request.',
        variant: 'destructive',
      });
    }
  };

  const handleMessageEdit = async (
    updatedMessage: Tables<'swarms_cloud_chat_messages'>,
    replaceAll: boolean,
  ) => {
    setIsEditLoading(true);
    setIsLoading(true);

    setLoadingAfterMessageId(updatedMessage.id);

    try {
      const messageContent = parseJSON(updatedMessage.content);
      const userMessage =
        typeof messageContent === 'string'
          ? messageContent
          : Array.isArray(messageContent)
            ? messageContent[0]?.content
            : messageContent?.content || '';

      setMessages((prevMessages) => {
        const editedMsgIndex = prevMessages.findIndex(
          (msg) => msg.id === updatedMessage.id,
        );
        if (editedMsgIndex === -1) return prevMessages;

        const newMessages = [...prevMessages];
        newMessages[editedMsgIndex] = updatedMessage;

        if (replaceAll) {
          setReplaceMode('replaceAll');
          return newMessages.slice(0, editedMsgIndex + 1);
        } else {
          setReplaceMode('replaceOriginal');
          if (
            editedMsgIndex + 1 < newMessages.length &&
            newMessages[editedMsgIndex + 1].role === 'assistant'
          ) {
            newMessages.splice(editedMsgIndex + 1, 1);
          }
          return newMessages;
        }
      });

      if (!userMessage.trim()) {
        return;
      }

      const activeAgents = agents.filter((agent) => agent.is_active);

      if (!swarmConfig?.architecture) {
        toast({
          description: 'No active swarm architecture selected',
          variant: 'destructive',
        });
        return;
      }

      if (activeAgents.length < 2) {
        toast({
          description: 'A swarm must have at least two active agents.',
          variant: 'destructive',
        });
        return;
      }

      const apiAgents = SwarmsApiClient.convertAgentsToApiFormat(
        activeAgents,
        swarmConfig.architecture,
      );
      const swarmType = SwarmsApiClient.getSwarmType(swarmConfig.architecture);

      const messages = transformEditMessages(
        activeConversation?.data?.messages,
        updatedMessage,
      );

      const extractedTask = extractContentAsString(messages, userMessage);

      const swarmRequest = {
        name: activeConversation.data?.name || 'Chat Session',
        description:
          activeConversation.data?.description || 'Chat Session Description',
        agents: apiAgents,
        swarm_type: swarmType,
        task: extractedTask,
        max_loops: activeConversation.data?.max_loops || 1,
        messages: messages || [],
      };

      const response = await swarmsApi?.current?.executeSwarm(swarmRequest);

      const aiResponseObj = {
        id: crypto.randomUUID(),
        chat_id: activeConversationId ?? '',
        role: 'assistant',
        content: JSON.stringify(response?.output),
        structured_content: response?.output
          ? JSON.stringify(response?.output)
          : null,
        timestamp: new Date().toISOString(),
        user_id: null,
        img: null,
        agent_id: activeAgents[0]?.id || '',
        metadata: response?.metadata ? JSON.stringify(response.metadata) : null,
        is_edited: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const insertIndex = prevMessages.findIndex(
          (msg) => msg.id === updatedMessage.id,
        );

        if (insertIndex !== -1) {
          newMessages.splice(insertIndex + 1, 0, aiResponseObj);
          return newMessages;
        } else {
          return [...prevMessages, aiResponseObj];
        }
      });
      setIsLoading(false);
      setIsEditLoading(false);
      setLoadingAfterMessageId(null);

      await addMessage({
        content: aiResponseObj.content,
        role: 'assistant',
        timestamp: aiResponseObj.timestamp,
        agentId: aiResponseObj.agent_id,
        afterMessageId: replaceAll ? '' : updatedMessage.id,
      });

      if (activeConversation && activeConversation.refetch) {
        activeConversation.refetch();
      }
    } catch (error) {
      console.error('Error processing edited message:', error);
      toast({
        description: 'Failed to process edited message',
        variant: 'destructive',
      });
      setIsLoading(false);
      setIsEditLoading(false);
      setLoadingAfterMessageId(null);
    }
  };

  return {
    input,
    apiKeyQuery,
    isCreatingApiKey,
    isInitializing,
    activeChatId,
    creationError,
    isFetching,
    isSharedConversation,
    user,
    messages,
    isLoading,
    messagesEndRef,
    isListening,
    activeConversation,
    activeConversationId,
    isEditModalOpen,
    loadingAfterMessageId,
    isEditLoading,
    isActiveLoading,
    openCloneModal,
    isClonePending,
    openTogglePublicModal,
    isTogglePublicPending,
    replaceMode,
    imageUrl,
    image,
    filePath,
    isDeleteFile,
    uploadStatus,
    uploadProgress,
    isUpdatePending,
    models,
    agents,
    isLoadingAgents,
    swarmConfig,
    openAgentModal,
    conversations,
    isLoadingConversations,
    isCreatePending,
    isDeletePending,
    isCreateAgent,
    isUpdateAgent,
    isToggleAgent,
    isDeleteAgent,
    isDeleteMessage,
    editingMessageId,
    editMessage,
    deleteMessage,
    startEditingMessage,
    cancelEditingMessage,
    setIsFetching,
    setInput,
    handleSubmit,
    toggleListening,
    handleTogglePublicModal,
    setActiveChatId,
    setIsEditModalOpen,
    handleMessageEdit,
    setOpenAgentModal,
    agentsRefetch,
    addAgent,
    updateAgent,
    removeAgent,
    updateSwarmArchitecture,
    toggleAgent,
    updateConversation,
    refetch,
    deleteImage,
    uploadImage,
    handleDrop,
    handleFileSelect,
    handleCloseTogglePublicModal,
    cloneSharedConversation,
    setOpenCloneModal,
    handleCloseCloneModal,
    togglePublicConversation,
    setReplaceMode,
    createConversation,
    deleteConversation,
    addMessage,
    exportConversation,
    setOpenTogglePublicModal,
  };
}
