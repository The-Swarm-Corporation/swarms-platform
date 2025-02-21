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

export function useAgents({
  activeConversationId,
}: {
  activeConversationId: string;
}) {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Tables<'swarms_cloud_chat_agents'>[]>(
    [],
  );
  const [swarmConfig, setSwarmConfig] = useState<SwarmConfig | null>(null);

  const getAgentsQuery = trpc.chatAgent.getAgents.useQuery();
  const getSwarmConfigQuery = trpc.swarmConfig.getSwarmConfig.useQuery(
    activeConversationId,
    { enabled: !!activeConversationId },
  );

  const createAgentMutation = trpc.chatAgent.addAgent.useMutation();
  const updateAgentMutation = trpc.chatAgent.updateAgent.useMutation();
  const deleteAgentMutation = trpc.chatAgent.removeAgent.useMutation();
  const toggleAgentMutation = trpc.chatAgent.toggleAgent.useMutation();
  const updateSwarmConfigMutation =
    trpc.swarmConfig.updateSwarmConfig.useMutation();

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

  const addAgent = useCallback(
    async (agent: Omit<Agent, 'id'>) => {
      try {
        // Create new agent
        const newAgent = await createAgentMutation.mutateAsync(agent);
        setAgents((prev) => [...prev, newAgent]);

        if (!swarmConfig || !activeConversationId) return;

        const updatedAgentIds = [
          ...swarmConfig.agents.map((a) => a.agent_id),
          newAgent.id,
        ];

        await updateSwarmConfigMutation.mutateAsync({
          chatId: activeConversationId,
          architecture: swarmConfig.architecture,
          agentIds: updatedAgentIds,
        });
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
      try {
        if (!swarmConfig || !activeConversationId) return;

        const agentIds = swarmConfig.agents.map((a) => a.agent_id);

        await updateSwarmConfigMutation.mutateAsync({
          chatId: activeConversationId,
          architecture,
          agentIds,
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

        if (!swarmConfig || !activeConversationId) return;

        const currentAgentIds = swarmConfig.agents.map((a) => a.agent_id);
        const updatedAgentIds = currentAgentIds.includes(agentId)
          ? currentAgentIds.filter((id) => id !== agentId)
          : [...currentAgentIds, agentId];

        await updateSwarmConfigMutation.mutateAsync({
          chatId: activeConversationId,
          architecture: swarmConfig.architecture,
          agentIds: updatedAgentIds,
        });
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
    addAgent,
    updateAgent: updateAgentMutation.mutateAsync,
    removeAgent: deleteAgentMutation.mutateAsync,
    updateSwarmArchitecture,
    toggleAgent,
    isLoading: getAgentsQuery.isLoading || getSwarmConfigQuery.isLoading,
    error: getAgentsQuery.error || getSwarmConfigQuery.error,
  };
}
