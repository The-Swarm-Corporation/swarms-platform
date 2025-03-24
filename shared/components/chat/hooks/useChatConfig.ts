'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  Agent,
  SwarmArchitecture,
  SwarmConfig,
} from '@/shared/components/chat/types';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Tables } from '@/types_db';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

export function useConfig({
  activeConversationId,
}: {
  activeConversationId: string;
}) {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Tables<'swarms_cloud_chat_agents'>[]>(
    [],
  );
  const [swarmConfig, setSwarmConfig] = useState<SwarmConfig | null>(null);
  const [openAgentModal, setOpenAgentModal] = useState(false);

  const getAgentsQuery = trpc.chatAgent.getAgents.useQuery(
    activeConversationId,
    {
      enabled: !!activeConversationId,
      refetchOnWindowFocus: false,
    },
  );
  const getSwarmConfigQuery = trpc.swarmConfig.getSwarmConfig.useQuery(
    activeConversationId,
    { enabled: !!activeConversationId, refetchOnWindowFocus: false },
  );

  const createAgentMutation = trpc.chatAgent.addAgent.useMutation();
  const updateAgentMutation = trpc.chatAgent.updateAgent.useMutation();
  const deleteAgentMutation = trpc.chatAgent.removeAgent.useMutation();
  const toggleAgentMutation = trpc.chatAgent.toggleAgent.useMutation();
  const createAgentTemplate = trpc.chatAgent.createAgentTemplate.useMutation();
  const updateSwarmConfigMutation =
    trpc.swarmConfig.updateSwarmConfig.useMutation();
  const addAgentToChat = trpc.chatAgent.addAgentTemplateToChat.useMutation();
  const agentTemplatesQuery = trpc.chatAgent.getAgentTemplatesForChat.useQuery(
    activeConversationId,
    {
      enabled: !!activeConversationId,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (getAgentsQuery.data) {
      setAgents(getAgentsQuery.data);
    }
  }, [getAgentsQuery.data]);

  useEffect(() => {
    if (getSwarmConfigQuery.data) {
      setSwarmConfig(getSwarmConfigQuery.data);
    }
  }, [getSwarmConfigQuery.data]);

  const refetchQuery = () => {
    getAgentsQuery.refetch();
    getSwarmConfigQuery.refetch();
  };

  const addAgent = useCallback(
    async (agent: Omit<Agent, 'id'>) => {
      if (
        !activeConversationId ||
        createAgentTemplate.isPending ||
        createAgentMutation.isPending ||
        addAgentToChat.isPending
      )
        return;

      try {
        const template = await createAgentTemplate.mutateAsync({
          name: agent.name,
          description: agent.description,
          model: agent.model,
          temperature: agent.temperature,
          max_tokens: agent.maxTokens,
          system_prompt: agent.systemPrompt,
          auto_generate_prompt: agent.autoGeneratePrompt,
          max_loops: agent.maxLoops,
          role: agent.role,
        });

        const newAgent = await createAgentMutation.mutateAsync({
          ...agent,
          templateId: template.id,
          chatId: activeConversationId,
        });

        setAgents((prev) => [...prev, newAgent]);
        setOpenAgentModal(false);

        await addAgentToChat.mutateAsync({
          templateId: template.id,
          chatId: activeConversationId,
          overrides: {
            is_active: true,
          },
        });

        toast({
          description: `${agent.name} added successfully`,
        });
        refetchQuery();
        agentTemplatesQuery.refetch();
      } catch (error) {
        console.error('Error adding agent:', error);
        toast({
          description: 'Failed to create agent. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [swarmConfig, activeConversationId],
  );

  const updateSwarmArchitecture = useCallback(
    async (architecture: SwarmArchitecture) => {
      if (updateSwarmConfigMutation.isPending) return;

      try {
        if (!activeConversationId) return;

        const agentIds = swarmConfig?.agents?.map((a) => a.agent_id) || [];

        await updateSwarmConfigMutation.mutateAsync({
          chatId: activeConversationId,
          architecture,
          agentIds,
        });
        refetchQuery();
        toast({
          description: `Architecture updated to ${architecture}.`,
        });
      } catch (error) {
        console.error('Error updating architecture:', error);
        toast({
          description: 'Failed to update chat architecture. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [swarmConfig, activeConversationId],
  );

  const toggleAgent = useCallback(
    async (agentId: string) => {
      if (toggleAgentMutation.isPending) return;

      try {
        const updatedAgent = await toggleAgentMutation.mutateAsync({
          id: agentId,
        });

        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === agentId
              ? { ...agent, is_active: updatedAgent.is_active }
              : agent,
          ),
        );

        toast({
          description: `Agent status changed successfully`,
        });

        refetchQuery();
      } catch (error) {
        console.error('Error toggling agent:', error);
        toast({
          description: 'Failed to toggle agent. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [swarmConfig, activeConversationId],
  );

  return {
    agents,
    swarmConfig,
    openAgentModal,
    addAgent,
    setOpenAgentModal,
    updateAgent: updateAgentMutation.mutateAsync,
    removeAgent: deleteAgentMutation.mutateAsync,
    updateSwarmArchitecture,
    toggleAgent,
    agentsRefetch: getAgentsQuery.refetch,
    swarmConfigRefetch: getSwarmConfigQuery.refetch,
    isLoading:
      getAgentsQuery.isLoading ||
      getSwarmConfigQuery.isLoading ||
      updateSwarmConfigMutation.isPending,
    isCreateAgent:
      createAgentMutation.isPending || createAgentTemplate.isPending,
    isUpdateAgent: updateAgentMutation.isPending,
    isToggleAgent: toggleAgentMutation.isPending,
    isDeleteAgent: deleteAgentMutation.isPending,
    error: getAgentsQuery.error || getSwarmConfigQuery.error,
  };
}
