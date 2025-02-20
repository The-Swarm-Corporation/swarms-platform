'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  Agent,
  SwarmArchitecture,
  SwarmConfig,
  Conversation,
} from '@/shared/components/chat/types';
import { trpc } from '@/shared/utils/trpc/trpc';

export function useAgents({
  activeConversation,
}: {
  activeConversation: Conversation;
}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [swarmConfig, setSwarmConfig] = useState<SwarmConfig | null>(null);

  const getAgentsQuery = trpc.chatAgent.getAgents.useQuery();
  const getSwarmConfigQuery = trpc.swarmConfig.getSwarmConfig.useQuery(
    activeConversation?.id,
    {
      enabled: !!activeConversation?.id,
    },
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

  const addAgent = useCallback(async (agent: Omit<Agent, 'id' | 'isActive'>) => {
    const newAgent = await createAgentMutation.mutateAsync(agent);
    setAgents((prev) => [...prev, newAgent]);

    if (swarmConfig) {
      const updatedConfig = { 
        ...swarmConfig, 
        agents: [...swarmConfig.agents, newAgent.id] // Store only ID
      };
      setSwarmConfig(updatedConfig);
      await updateSwarmConfigMutation.mutateAsync({ chatId: activeConversation.id, config: updatedConfig });
    }
  }, [swarmConfig, activeConversation.id]);

  const updateAgent = useCallback(
    async (id: string, updates: Partial<Agent>) => {
      await updateAgentMutation.mutateAsync({ id, updates });
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === id ? { ...agent, ...updates } : agent,
        ),
      );
    },
    [],
  );

  const removeAgent = useCallback(async (id: string) => {
    await deleteAgentMutation.mutateAsync(id);
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
  }, []);

  const updateSwarmArchitecture = useCallback(async (architecture: SwarmArchitecture) => {
    if (swarmConfig) {
      const updatedConfig = { ...swarmConfig, architecture };
      setSwarmConfig(updatedConfig);
      await updateSwarmConfigMutation.mutateAsync({ chatId: activeConversation.id, config: updatedConfig });
    }
  }, [swarmConfig, activeConversation.id]);

  const toggleAgent = useCallback(
    async (id: string) => {
      const updatedAgent = await toggleAgentMutation.mutateAsync({ id });

      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === id
            ? { ...agent, isActive: updatedAgent.isActive }
            : agent,
        ),
      );

      if (swarmConfig) {
        const updatedConfig = {
          ...swarmConfig,
          agents: swarmConfig.agents.map(
            (agentId) => (agentId === id ? id : agentId), // Ensure IDs are stored correctly
          ),
        };
        setSwarmConfig(updatedConfig);
        await updateSwarmConfigMutation.mutateAsync({
          chatId: activeConversation.id,
          config: updatedConfig,
        });
      }
    },
    [swarmConfig, activeConversation.id],
  );

  return {
    agents,
    swarmConfig,
    addAgent,
    updateAgent,
    removeAgent,
    updateSwarmArchitecture,
    toggleAgent,
  };
}
