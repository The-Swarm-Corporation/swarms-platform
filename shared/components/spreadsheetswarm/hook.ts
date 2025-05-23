'use client';

import { useState, useEffect, useRef } from 'react';

import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { estimateTokensAndCost } from '@/shared/utils/helpers';
import { useAuthContext } from '../ui/auth.provider';
import { Tables } from '@/types_db';
import { optimizePrompt as getSystemOptimizedPrompt } from '@/app/actions/registry';
import { SwarmsApiClient } from '@/shared/utils/api/swarms';
import { SwarmArchitecture } from '../chat/types';
import { transformSpreadsheetSessionToMessages } from './helper';
import { extractContentAsString } from '../chat/helper';

export interface DraggedFile {
  name: string;
  content: string;
  type: string;
}

export interface Agent {
  id: string;
  name: string;
  temperature: number;
  maxTokens: number;
  maxLoops: number;
  role: string;
  description: string;
  systemPrompt: string;
  llm: string;
  status: 'idle' | 'running' | 'completed';
  output: string;
  original_agent_id?: string;
  attachments?: DraggedFile[];
}

export default function useSpreadsheet() {
  const { user } = useAuthContext();

  const [models, setModels] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [creationError, setCreationError] = useState<string | null>(null);
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
  const [agentStatuses, setAgentStatuses] = useState<
    Record<string, 'idle' | 'running' | 'completed' | 'error'>
  >({});

  const updateAgentMutation = trpc.panel.updateAgent.useMutation();

  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

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
  const isEditAgentLoader = updateAgentMutation.isPending;
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

  const isCreatingApiKey = useRef(false);

  const apiKeyQuery = trpc.apiKey.getValidApiKey.useQuery(
    { isShareId: false },
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
        console.error(error);
      }
    }
  };

  const handleCheckExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
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
    if (!editingAgent.id) return;

    const missingFields: string[] = [];

    if (!editingAgent.name) missingFields.push('Name');
    if (!editingAgent.description) missingFields.push('Description');
    if (!editingAgent.systemPrompt) missingFields.push('System Prompt');
    if (!editingAgent.llm) missingFields.push('LLM');

    if (missingFields.length > 0) {
      toast.toast({
        title: 'Missing required fields:',
        description: `Please provide: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateAgentMutation.mutateAsync({
        agent_id: editingAgent.id,
        name: editingAgent.name || '',
        description: editingAgent.description || '',
        system_prompt: editingAgent.systemPrompt || '',
        llm: editingAgent.llm || '',
        temperature: editingAgent.temperature || 0.7,
        max_tokens: editingAgent.maxTokens || 2048,
        max_loops: editingAgent.maxLoops || 1,
        role: editingAgent.role || 'worker',
      });

      if (!isEditAgentLoader) {
        setIsEditAgentOpen(false);
        setEditingAgent({});
      }
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
    // if (!user) {
    //   setIsAuthModalOpen(true);
    //   return true;
    // }

    // if (isEmpty(cardManager?.data)) {
    //   const params = createQueryString({
    //     card_available: 'false',
    //   });
    //   router.push(PLATFORM.ACCOUNT + '?' + params);
    // }

    // if (getSubscription.data && getSubscription.data.status !== 'active') {
    //   toast.toast({
    //     description: 'Please subscribe to use this feature.',
    //   });

    //   const params = createQueryString({
    //     subscription_status: 'null',
    //   });

    //   router.push(PLATFORM.ACCOUNT + '?' + params);
    //   return true;
    // }

    return false;
  };

  const addAgent = async () => {
    if (redirectStatus()) return;

    const missingFields: string[] = [];

    if (!newAgent.name) missingFields.push('Name');
    if (!newAgent.description) missingFields.push('Description');
    if (!newAgent.systemPrompt) missingFields.push('System Prompt');
    if (!newAgent.llm) missingFields.push('LLM');

    if (missingFields.length > 0) {
      toast.toast({
        title: 'Missing required fields:',
        description: `Please provide: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!currentSessionId) {
        await createNewSession(task);
      }

      await addAgentMutation.mutateAsync({
        session_id: currentSessionId,
        name: newAgent.name || '',
        description: newAgent.description || '',
        system_prompt: newAgent.systemPrompt || '',
        llm: newAgent.llm || '',
        temperature: newAgent.temperature || 0.7,
        max_tokens: newAgent.maxTokens || 2048,
        max_loops: newAgent.maxLoops || 1,
        role: newAgent.role || 'worker',
      });

      setIsAddAgentOpen(false);
      setNewAgent({});
      sessionData.refetch();
    } catch (error) {
      console.error('Failed to add agent:', error);
      toast.toast({
        title: 'Failed to add agent:',
        variant: 'destructive',
      });
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
        max_loops: agent.max_loops || 1,
        max_tokens: agent.max_tokens || 2048,
        temperature: agent.temperature || 0.7,
        role: agent.role || 'worker',
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

      const totalCredit = Number(userCredit.data) || 0;

      if (totalCredit < costEstimate.inputCost) {
        toast.toast({
          description: 'Insufficient credit for prompt optimization',
          variant: 'destructive',
        });
        return;
      }

      const text = await getSystemOptimizedPrompt(optimizationPrompt);

      const finalCosts = estimateTokensAndCost(optimizationPrompt, text);

      if (finalCosts?.totalCost) {
        deductCredit.mutateAsync({ amount: finalCosts.totalCost });
      }

      if (isEditing) {
        setEditingAgent((prev) => ({ ...prev, systemPrompt: text }));
      } else {
        setNewAgent((prev) => ({ ...prev, systemPrompt: text }));
      }
    } catch (error: any) {
      console.error('Failed to optimize prompt:', error);
      toast.toast({
        title: 'Failed to optimize prompt',
        description: error || error?.message || '',
        variant: 'destructive',
      });
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

    setDraggedFiles((prev: any) => [...prev, ...newFiles]);
  };

  const runAgents = async () => {
    if (redirectStatus() || !currentSessionId || !task) return;

    const agents = currentSession?.agents ?? [];
    if (agents.length < 2) {
      toast.toast({
        description: 'A session must have at least two active agents.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const startTime = Date.now();
      const isTaskHandled = await handleTaskChange(task);
      if (!isTaskHandled) {
        toast.toast({
          description: 'An error has occurred',
          variant: 'destructive',
        });
        return;
      }

      setIsRunning(true);

      const initialStatuses = Object.fromEntries(
        agents.map((agent) => [agent.id, 'running' as const]),
      );
      setAgentStatuses(initialStatuses);

      const apiAgents = SwarmsApiClient.convertAgentsToApiFormat(
        agents as any,
        currentSession?.swarm_type as SwarmArchitecture,
      );
      const swarmType = SwarmsApiClient.getSwarmType(
        currentSession?.swarm_type as SwarmArchitecture,
      );

      const messages = transformSpreadsheetSessionToMessages(currentSession);
      const extractedTask = extractContentAsString(messages, task);

      const response = await swarmsApi?.current?.executeSwarm({
        name: currentSession?.id ?? 'Untitled Session',
        description: 'Session description',
        agents: apiAgents,
        swarm_type: swarmType,
        task: extractedTask || task,
        max_loops: 1,
      });

      const outputs = response?.output ?? [];

      const agentOutputMap = outputs.reduce(
        (acc: Record<string, string>, output: any) => {
          if (output.role) {
            acc[output.role] = (acc[output.role] ?? '') + '\n' + output.content;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      await Promise.all(
        agents.map(async (agent) => {
          const agentOutput = agentOutputMap[agent.name] || 'No response';
          const status = agentOutput === 'No response' ? 'error' : 'completed';

          setAgentStatuses((prev) => ({
            ...prev,
            [agent.id]: status,
          }));

          await updateAgentStatusMutation.mutateAsync({
            agent_id: agent.id,
            status,
            output: agentOutput,
          });
        }),
      );

      await updateSessionMetricsMutation.mutateAsync({
        session_id: currentSessionId,
        tasksExecuted: (sessionData.data?.tasks_executed || 0) + 1,
        timeSaved: Math.round((Date.now() - startTime) / 1000),
      });

      sessionData.refetch();
    } catch (error: any) {
      console.error('Failed to run agents:', error);

      const errorStatuses = Object.fromEntries(
        agents.map((agent) => [agent.id, 'error' as const]),
      );
      setAgentStatuses(
        errorStatuses as Record<
          string,
          'idle' | 'running' | 'completed' | 'error'
        >,
      );

      toast.toast({
        title: 'Failed to run agents',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
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
    isLoading: isLoading || sessionData.isLoading,
    isAddAgentLoader,
    isRunAgentLoader,
    isDuplicateLoader,
    isEditAgentLoader,
    isExpanded,
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
    setIsExpanded,
    setEditingAgent,
    handleCheckExpand,
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
    models,
    agentStatuses,
    isInitializing,
    creationError,
    apiKeyQuery,
    isCreatingApiKey,
  };
}
