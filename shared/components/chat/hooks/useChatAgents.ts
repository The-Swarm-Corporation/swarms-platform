'use client';

import { useState, useCallback } from 'react';
import type { Agent, SwarmArchitecture, SwarmConfig } from '@/shared/components/chat/types';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [swarmConfig, setSwarmConfig] = useState<SwarmConfig>({
    architecture: 'sequential',
    agents: [],
  });

  const addAgent = useCallback((agent: Omit<Agent, 'id' | 'isActive'>) => {
    const newAgent: Agent = {
      ...agent,
      id: crypto.randomUUID(),
      isActive: true,
    };
    setAgents((prev) => [...prev, newAgent]);
    setSwarmConfig((prev) => ({
      ...prev,
      agents: [...prev.agents, newAgent],
    }));
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, ...updates } : agent)),
    );
    setSwarmConfig((prev) => ({
      ...prev,
      agents: prev.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent,
      ),
    }));
  }, []);

  const removeAgent = useCallback((id: string) => {
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
    setSwarmConfig((prev) => ({
      ...prev,
      agents: prev.agents.filter((agent) => agent.id !== id),
    }));
  }, []);

  const updateSwarmArchitecture = useCallback(
    (architecture: SwarmArchitecture) => {
      setSwarmConfig((prev) => ({ ...prev, architecture }));
    },
    [],
  );

  const toggleAgent = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, isActive: !agent.isActive } : agent,
      ),
    );
    setSwarmConfig((prev) => ({
      ...prev,
      agents: prev.agents.map((agent) =>
        agent.id === id ? { ...agent, isActive: !agent.isActive } : agent,
      ),
    }));
  }, []);

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
