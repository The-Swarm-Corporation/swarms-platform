'use client';

import { useState, useEffect } from 'react';

import { generateText } from 'ai';

import { registry } from '@/shared/utils/registry';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import {
  createQueryString,
  isEmpty,
  estimateTokensAndCost,
  CostEstimate,
} from '@/shared/utils/helpers';
import { PLATFORM } from '@/shared/utils/constants';
import { useAuthContext } from '../ui/auth.provider';
import { Tables } from '@/types_db';

export interface DraggedFile {
  name: string;
  content: string;
  type: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  llm: string;
  status: 'idle' | 'running' | 'completed';
  output: string;
  original_agent_id?: string;
  attachments?: DraggedFile[];
}

export default function useSpreadsheet() {
  const { user, setIsAuthModalOpen } = useAuthContext();

  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<DraggedFile[]>([]);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [task, setTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAgentOutput, setIsAgentOutput] = useState(false);
  const [agentId, setAgentId] = useState('');
  const [isEditAgentOpen, setIsEditAgentOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Partial<Agent>>({});

  const updateAgentMutation = trpc.panel.updateAgent.useMutation();

  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isShareModalOpen) {
      setTimeout(() => {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('pointer-events');
      }, 500);
    }
  }, [isShareModalOpen]);

  const createSessionMutation = trpc.panel.createSession.useMutation();
  const addAgentMutation = trpc.panel.addAgent.useMutation();
  const updateAgentStatusMutation = trpc.panel.updateAgentStatus.useMutation();
  const updateSessionTaskMutation = trpc.panel.updateSessionTask.useMutation();
  const updateSessionOutputMutation =
    trpc.panel.updateSessionOutput.useMutation();
  const setCurrentSessionMutation = trpc.panel.setCurrentSession.useMutation();

  const updateSessionMetricsMutation =
    trpc.panel.updateSessionMetrics.useMutation();
  const deleteAgentMutation = trpc.panel.deleteAgent.useMutation();

  const getSubscription = trpc.payment.getSubscriptionStatus.useQuery();
  const cardManager = trpc.payment.getUserPaymentMethods.useQuery();
  const userCredit = trpc.panel.getUserCredit.useQuery();
  const [selectedAgent, setSelectedAgent] =
    useState<Tables<'swarms_spreadsheet_session_agents'> | null>(null);

  const getDuplicateCountQuery = trpc.panel.getDuplicateCount.useQuery(
    {
      original_agent_id:
        selectedAgent?.original_agent_id || selectedAgent?.id || '',
    },
    {
      enabled: !!selectedAgent,
    },
  );

  const sessionData = trpc.panel.getSessionWithAgents.useQuery(
    { session_id: currentSessionId },
    { enabled: !!currentSessionId },
  );

  const isAddAgentLoader =
    addAgentMutation.isPending || createSessionMutation.isPending;
  const isRunAgentLoader =
    updateSessionTaskMutation.isPending ||
    updateAgentStatusMutation.isPending ||
    updateSessionMetricsMutation.isPending;
  const isDuplicateLoader =
    getDuplicateCountQuery.isLoading || addAgentMutation.isPending;
  const deductCredit = trpc.explorer.deductCredit.useMutation();

  const allSessions = trpc.panel.getAllSessions.useQuery();
  const allSessionsAgents = trpc.panel.getAllSessionsWithAgents.useQuery();

  const currentSession = sessionData?.data;

  useEffect(() => {
    if (allSessions?.data) {
      setCurrentSessionId(allSessions.data[0]?.id);
    }
  }, [allSessions?.data]);

  useEffect(() => {
    if (sessionData.data?.task) {
      setTask(sessionData.data.task);
    }
  }, [sessionData.data]);

  const handleTaskChange = async (newTask: string) => {
    if (currentSessionId) {
      try {
        const task = await updateSessionTaskMutation.mutateAsync({
          session_id: currentSessionId,
          task: newTask,
        });
        return true;
      } catch (error) {
        console.log({ error });
      }
    }
  };

  const updateURL = (sessionId: string) => {
    if (typeof window === 'undefined') return; // Guard against server-side execution

    const params = new URLSearchParams(searchParams?.toString());
    params.set('session', sessionId);

    // Use replace to avoid adding to history stack
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Update handleSessionSelect to include URL update
  const getShareablePath = () => {
    if (!currentSessionId) return '';
    // Ensure we have the correct pathname
    return `${pathname}?session=${currentSessionId}`;
  };

  useEffect(() => {
    const handleInitialSession = async () => {
      const sessionId = searchParams?.get('session');

      if (sessionId) {
        setCurrentSessionId(sessionId);
        await handleSessionSelect(sessionId);
      } else if (allSessions?.data?.[0]?.id) {
        const newSessionId = allSessions.data[0].id;
        setCurrentSessionId(newSessionId);
        updateURL(newSessionId);
      }
    };

    handleInitialSession();
  }, [allSessions?.data, searchParams]);

  // Update the shareSwarm function to use the new shareSession
  const shareSwarm = () => {
    if (!currentSessionId) {
      toast.toast({
        description: 'No session selected',
        variant: 'destructive',
      });
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleSessionSelect = async (sessionId: string) => {
    try {
      await setCurrentSessionMutation.mutateAsync({ session_id: sessionId });
      setCurrentSessionId(sessionId);
      updateURL(sessionId);
    } catch (error) {
      console.error('Failed to select session:', error);
      toast.toast({
        description: 'Failed to select session',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (
    agent: Tables<'swarms_spreadsheet_session_agents'>,
  ) => {
    if (redirectStatus()) return;

    setEditingAgent({
      id: agent.id,
      name: agent.name,
      description: agent.description || '',
      systemPrompt: agent.system_prompt || '',
      llm: agent.llm || '',
    });
    setIsEditAgentOpen(true);
  };

  // Function to handle saving edited agent
  const saveEditedAgent = async () => {
    if (
      !editingAgent.id ||
      !editingAgent.name ||
      !editingAgent.description ||
      !editingAgent.systemPrompt ||
      !editingAgent.llm
    )
      return;

    try {
      await updateAgentMutation.mutateAsync({
        agent_id: editingAgent.id,
        name: editingAgent.name,
        description: editingAgent.description,
        system_prompt: editingAgent.systemPrompt,
        llm: editingAgent.llm,
      });

      setIsEditAgentOpen(false);
      setEditingAgent({});
      sessionData.refetch();

      toast.toast({
        description: 'Agent updated successfully',
      });
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast.toast({
        description: 'Failed to update agent',
        variant: 'destructive',
      });
    }
  };

  const createNewSession = async (
    newTask: string,
    output?: any,
    tasks_executed?: any,
    time_saved?: any,
  ) => {
    try {
      const newSession = await createSessionMutation.mutateAsync({
        task: newTask,
        tasks_executed,
        output,
        time_saved,
      });
      setCurrentSessionId(newSession.id);
      updateURL(newSession.id);
      allSessions.refetch();
      return newSession.id;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  const redirectStatus = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return true;
    }

    if (isEmpty(cardManager?.data)) {
      const params = createQueryString({
        card_available: 'false',
      });
      router.push(PLATFORM.ACCOUNT + '?' + params);
    }

    if (getSubscription.data && getSubscription.data.status !== 'active') {
      toast.toast({
        description: 'Please subscribe to use this feature.',
      });

      const params = createQueryString({
        subscription_status: 'null',
      });

      router.push(PLATFORM.ACCOUNT + '?' + params);
      return true;
    }

    return false;
  };

  const addAgent = async () => {
    if (redirectStatus()) return;

    if (
      !newAgent.name ||
      !newAgent.description ||
      !newAgent.systemPrompt ||
      !newAgent.llm
    )
      return;

    try {
      if (!currentSessionId) {
        await createNewSession(task);
      }

      await addAgentMutation.mutateAsync({
        session_id: currentSessionId,
        name: newAgent.name,
        description: newAgent.description,
        system_prompt: newAgent.systemPrompt,
        llm: newAgent.llm,
      });

      setIsAddAgentOpen(false);
      setNewAgent({});
      sessionData.refetch();
    } catch (error) {
      console.error('Failed to add agent:', error);
    }
  };
  useEffect(() => {
    const mainWrapperElements =
      document.getElementsByClassName('main-wrapper-all');
    const originalClasses: string[] = [];

    // Save original classes
    for (let i = 0; i < mainWrapperElements.length; i++) {
      originalClasses[i] = mainWrapperElements[i].className;
    }

    const timer = setTimeout(() => {
      if (mainWrapperElements.length >= 1) {
        for (let i = 0; i < mainWrapperElements.length; i++) {
          mainWrapperElements[i].className =
            'main-wrapper-all spreadsheet-swarm';
        }
      }
      // Set loading to false after classes are updated
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 500);

    // Restore original classes on unmount
    return () => {
      clearTimeout(timer);
      const mainWrapperElements =
        document.getElementsByClassName('main-wrapper-all');
      for (let i = 0; i < mainWrapperElements.length; i++) {
        if (mainWrapperElements[i]) {
          mainWrapperElements[i].className = originalClasses[i];
        }
      }
    };
  }, []);

  const deleteAgent = async (
    agent: Tables<'swarms_spreadsheet_session_agents'>,
  ) => {
    if (!currentSessionId) return;

    setSelectedAgent(agent);

    try {
      await deleteAgentMutation.mutateAsync({
        agent_id: agent?.id,
      });

      sessionData.refetch();
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

  const duplicateAgent = async (
    agent: Tables<'swarms_spreadsheet_session_agents'>,
    duplicateCount: number,
  ) => {
    if (!currentSessionId || !agent) return;

    if (duplicateCount >= 5) {
      toast.toast({
        description: 'Maximum number of duplicates reached for this agent.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addAgentMutation.mutateAsync({
        session_id: currentSessionId,
        name: `${agent.name} (Copy)`,
        description: agent.description || '',
        system_prompt: agent.system_prompt || '',
        llm: agent.llm || '',
        original_agent_id: agent.original_agent_id || agent.id,
      });

      sessionData.refetch();
    } catch (error) {
      console.error('Failed to duplicate agent:', error);
    }
  };

  const handleDuplicateClick = async (
    agent: Tables<'swarms_spreadsheet_session_agents'>,
  ) => {
    if (redirectStatus()) return;

    setSelectedAgent(agent);

    const duplicateCountResult = await getDuplicateCountQuery.refetch();

    if (duplicateCountResult.data !== undefined) {
      await duplicateAgent(agent, duplicateCountResult.data);
    }
  };

  // Function to optimize prompt
  const optimizePrompt = async (isEditing = false) => {
    setIsOptimizing(true);
    try {
      const currentPrompt = isEditing
        ? editingAgent.systemPrompt
        : newAgent.systemPrompt;

      const optimizationPrompt = `Your task is to optimize the following system prompt for an AI agent. The optimized prompt should be highly reliable, production-grade, and tailored to the specific needs of the agent. Consider the following guidelines:
  
          1. Thoroughly understand the agent's requirements and capabilities.
          2. Employ diverse prompting strategies (e.g., chain of thought, few-shot learning).
          3. Blend strategies effectively for the specific task or scenario.
          4. Ensure production-grade quality and educational value.
          5. Provide necessary constraints for the agent's operation.
          6. Design for extensibility and wide scenario coverage.
          7. Aim for a prompt that fosters the agent's growth and specialization.
  
          Original prompt to optimize:
          ${currentPrompt}
  
          Please provide an optimized version of this prompt, incorporating the guidelines mentioned above. Only return the optimized prompt, no other text or comments.
          `;
      const costEstimate = estimateTokensAndCost(optimizationPrompt);

      const totalCredit = Number(userCredit) || 0;

      if (totalCredit < costEstimate.inputCost) {
        toast.toast({
          description: 'Insufficient credit for prompt optimization',
          variant: 'destructive',
        });
        return;
      }

      const { text } = await generateText({
        model: registry.languageModel('openai:gpt-4o'),
        prompt: optimizationPrompt,
      });

      const finalCosts = estimateTokensAndCost(optimizationPrompt, text);

      if (finalCosts?.totalCost) {
        deductCredit.mutateAsync({ amount: finalCosts.totalCost });
      }

      if (isEditing) {
        setEditingAgent((prev) => ({ ...prev, systemPrompt: text }));
      } else {
        setNewAgent((prev) => ({ ...prev, systemPrompt: text }));
      }
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
    }
    setIsOptimizing(false);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    const newFiles = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return {
          name: file.name,
          content,
          type: file.type,
        };
      }),
    );

    setDraggedFiles((prev) => [...prev, ...newFiles]);
  };

  const runAgents = async () => {
    if (redirectStatus()) return;

    if (!currentSessionId) return;

    if (!task) {
      toast.toast({
        description: 'Please enter a task',
        variant: 'destructive',
      });
      return;
    }

    if (!currentSession?.agents || currentSession?.agents?.length === 0) {
      toast.toast({
        description: 'No agents available',
        variant: 'destructive',
      });
      return;
    }

    try {
      const isTaskHandled = await handleTaskChange(task);

      if (!isTaskHandled) {
        toast.toast({
          description: 'An error has occurred',
          variant: 'destructive',
        });
        return;
      }

      const startTime = Date.now();
      const agents = sessionData.data?.agents || [];
      const outputs: Record<string, any> = {};
      const costTracking: Record<string, CostEstimate> = {};

      let totalEstimatedCost = 0;

      const estimates = agents.map((agent) => {
        const uniquePrompt =
          agent.status === 'completed'
            ? `Task: ${task}\n\nAgent Name: ${agent.id}\n\nResponse:`
            : `${agent.system_prompt}\n\nTask: ${task}\n\nAgent Name: ${agent.name}\nAgent Description: ${agent.description}\n\nResponse:`;

        const estimate = estimateTokensAndCost(uniquePrompt);
        totalEstimatedCost += estimate.inputCost;
        return { agent, estimate, prompt: uniquePrompt };
      });

      const totalCredit = Number(userCredit) || 0;

      if (totalCredit < totalEstimatedCost) {
        throw new Error('Insufficient credit to run all agents');
      }

      await Promise.all(
        estimates.map(async ({ agent, estimate, prompt }) => {
          setIsRunning(true);
          try {
            await updateAgentStatusMutation.mutateAsync({
              agent_id: agent.id,
              status: 'running',
            });

            const { text } = await generateText({
              model: registry.languageModel(agent.llm || ''),
              prompt: prompt,
            });

            const finalCosts = estimateTokensAndCost(prompt, text);
            costTracking[agent.id] = finalCosts;

            if (finalCosts?.totalCost) {
              deductCredit.mutateAsync({ amount: finalCosts.totalCost });
            }

            outputs[agent.id] = text;

            await updateAgentStatusMutation.mutateAsync({
              agent_id: agent.id,
              status: 'completed',
              output: text,
            });
          } catch (error: any) {
            outputs[agent.id] = `Error: ${error.message || 'Unknown error'}`;
            await updateAgentStatusMutation.mutateAsync({
              agent_id: agent.id,
              status: 'error',
              output: outputs[agent.id],
            });
          } finally {
            setIsRunning(false);
          }
        }),
      );

      const endTime = Date.now();
      const timeSaved = Math.round((endTime - startTime) / 1000);

      await updateSessionMetricsMutation.mutateAsync({
        session_id: currentSessionId,
        tasksExecuted: (sessionData.data?.tasks_executed || 0) + 1,
        timeSaved: (sessionData.data?.time_saved || 0) + timeSaved,
      });

      sessionData.refetch();
    } catch (error) {
      console.error('Failed to run agents:', error);
      toast.toast({
        description: 'Failed to run agents',
        variant: 'destructive',
      });
    }
  };

  const downloadJSON = async () => {
    if (redirectStatus()) return;

    if (!currentSession) {
      toast.toast({
        description: 'No session data available',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateSessionOutputMutation.mutateAsync({
        session_id: currentSessionId,
        output: currentSession,
      });

      const jsonString = JSON.stringify(currentSession, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `swarm_data_${currentSessionId}.json`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error('Error updating session or downloading JSON:', error);
      toast.toast({
        description: 'Failed to download session data',
        variant: 'destructive',
      });
    }
  };

  const uploadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const parsedState = JSON.parse(content);
            createNewSession(parsedState);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadCSV = () => {
    if (redirectStatus()) return;

    if (!currentSession) {
      toast.toast({
        description: 'No session data available',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Session ID',
      'Timestamp',
      'Task',
      'Agent ID',
      'Name',
      'Description',
      'System Prompt',
      'LLM',
      'Status',
      'Output',
    ];
    const csvContent = [
      headers.join(','),
      ...currentSession?.agents?.map((agent) =>
        [
          currentSession?.id,
          currentSession?.timestamp
            ? new Date(currentSession?.timestamp).toISOString()
            : null,
          currentSession?.task,
          agent?.id,
          agent?.name,
          agent?.description,
          `"${(agent?.system_prompt || '')?.replace(/"/g, '""')}"`,
          agent?.llm,
          agent?.status,
          `"${agent?.output?.replace(/"/g, '""')}"`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `swarm_data_${currentSession?.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function copyToClipboard(text: string) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.toast({ title: 'Copied to clipboard' });
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  }

  return {
    user,
    isAddAgentOpen,
    newAgent,
    isOptimizing,
    draggedFiles,
    runningAgents,
    task,
    isRunning,
    isAgentOutput,
    agentId,
    isEditAgentOpen,
    editingAgent,
    isLoading,
    isAddAgentLoader,
    isRunAgentLoader,
    isDuplicateLoader,
    allSessions,
    allSessionsAgents,
    currentSession,
    isShareModalOpen,
    updateSessionOutputMutation,
    updateAgentMutation,
    deleteAgentMutation,
    selectedAgent,
    copyToClipboard,
    setIsShareModalOpen,
    setEditingAgent,
    setIsAddAgentOpen,
    setIsEditAgentOpen,
    setNewAgent,
    setAgentId,
    setIsAgentOutput,
    setDraggedFiles,
    setTask,
    getShareablePath,
    shareSwarm,
    handleSessionSelect,
    handleEditClick,
    saveEditedAgent,
    createNewSession,
    addAgent,
    deleteAgent,
    handleDuplicateClick,
    optimizePrompt,
    handleFileDrop,
    runAgents,
    downloadJSON,
    uploadJSON,
    downloadCSV,
  };
}
