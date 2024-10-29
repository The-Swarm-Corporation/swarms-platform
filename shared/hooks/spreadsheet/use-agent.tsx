import { useState } from 'react';
import { SwarmAgent, AgentStatus, NewAgent } from '@/shared/types/spreadsheet';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

export const useAgent = (sessionId: string) => {
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(null);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [newAgent, setNewAgent] = useState<any>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<any[]>([]);

  const toast = useToast();

  const mutations = {
    add: trpc.panel.addAgent.useMutation(),
    delete: trpc.panel.deleteAgent.useMutation(),
    updateAgentStatus: trpc.panel.updateAgentStatus.useMutation(),
  };

  const getDuplicateCountQuery = trpc.panel.getDuplicateCount.useQuery(
    {
      original_agent_id:
        selectedAgent?.original_agent_id || selectedAgent?.id || '',
    },
    {
      enabled: !!selectedAgent,
    },
  );

  const addAgent = async (agent: NewAgent) => {
    try {
      await mutations.add.mutateAsync({
        session_id: sessionId,
        name: agent.name,
        description: agent.description,
        system_prompt: agent.system_prompt,
        llm: agent.llm,
      });
    } catch (error) {
      console.error('Failed to add agent:', error);
      toast.toast({
        description: 'Failed to add agent',
        variant: 'destructive',
      });
    }
  };

  const deleteAgent = async (agent: SwarmAgent) => {
    try {
      await mutations.delete.mutateAsync({
        agent_id: agent.id,
      });
      toast.toast({
        description: 'Deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast.toast({
        description: 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  const duplicateAgent = async (agent: SwarmAgent) => {
    if (!sessionId || !agent) return;

    const duplicateCount = await getDuplicateCountQuery.refetch();

    if (duplicateCount.data !== undefined && duplicateCount.data >= 5) {
      toast.toast({
        description: 'Maximum number of duplicates reached for this agent.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mutations.add.mutateAsync({
        session_id: sessionId,
        name: `${agent.name} (Copy)`,
        description: agent.description || '',
        system_prompt: agent.system_prompt || '',
        llm: agent.llm || '',
        original_agent_id: agent.original_agent_id || agent.id,
      });
    } catch (error) {
      console.error('Failed to duplicate agent:', error);
      toast.toast({
        description: 'Failed to duplicate agent',
        variant: 'destructive',
      });
    }
  };

  const updateAgentStatus = async (
    agentId: string,
    status: AgentStatus,
    output?: string,
  ) => {
    try {
      await mutations.updateAgentStatus.mutateAsync({
        agent_id: agentId,
        status,
        output,
      });
    } catch (error) {
      console.error('Failed to update agent status:', error);
    }
  };

  return {
    selectedAgent,
    setSelectedAgent,
    isAddAgentOpen,
    setIsAddAgentOpen,
    newAgent,
    setNewAgent,
    isOptimizing,
    setIsOptimizing,
    draggedFiles,
    setDraggedFiles,
    addAgent,
    deleteAgent,
    duplicateAgent,
    updateAgentStatus,
    isAddingAgent: mutations.add.isPending,
    isDeletingAgent: mutations.delete.isPending,
    isUpdatingStatus: mutations.updateAgentStatus.isPending,
    getDuplicateCount: getDuplicateCountQuery,
  };
};
