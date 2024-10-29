'use client';

// React core
import { useState, useEffect } from 'react';

// Third-party libraries
import { generateText } from 'ai';
import { v4 as uuidv4 } from 'uuid';

// UI Components
import { Button } from '../ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../spread_sheet_swarm/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../spread_sheet_swarm/ui/dropdown-menu';
import Input from '../ui/Input';
import { Label } from '../spread_sheet_swarm/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../spread_sheet_swarm/ui/table';
import { Textarea } from '../ui/textarea';
import { registry } from '@/shared/utils/registry';

// Icons
import {
  Plus,
  Download,
  Share2,
  Play,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Copy,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useRouter } from 'next/navigation';
import { createQueryString, isEmpty } from '@/shared/utils/helpers';
import { PLATFORM } from '@/shared/constants/links';
import { useAuthContext } from '../ui/auth.provider';
import { Tables } from '@/types_db';
import LoadingSpinner from '../loading-spinner';
import ComponentLoader from '../loaders/component';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DraggedFile {
  name: string;
  content: string;
  type: string;
}

interface Agent {
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

const CustomPre = (props: React.HTMLAttributes<HTMLPreElement>) => (
  <pre id="customPreTag" {...props} />
);

export function SwarmManagement() {
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

  const toast = useToast();
  const router = useRouter();

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

  const handleSessionSelect = async (sessionId: string) => {
    await setCurrentSessionMutation.mutateAsync({ session_id: sessionId });
    setCurrentSessionId(sessionId);
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
  const optimizePrompt = async () => {
    setIsOptimizing(true);
    try {
      const { text } = await generateText({
        model: registry.languageModel('openai:gpt-4-turbo'),
        prompt: `
        Your task is to optimize the following system prompt for an AI agent. The optimized prompt should be highly reliable, production-grade, and tailored to the specific needs of the agent. Consider the following guidelines:

        1. Thoroughly understand the agent's requirements and capabilities.
        2. Employ diverse prompting strategies (e.g., chain of thought, few-shot learning).
        3. Blend strategies effectively for the specific task or scenario.
        4. Ensure production-grade quality and educational value.
        5. Provide necessary constraints for the agent's operation.
        6. Design for extensibility and wide scenario coverage.
        7. Aim for a prompt that fosters the agent's growth and specialization.

        Original prompt to optimize:
        ${newAgent.systemPrompt}

        Please provide an optimized version of this prompt, incorporating the guidelines mentioned above. Only return the optimized prompt, no other text or comments.
        `,
      });
      setNewAgent((prev) => ({ ...prev, systemPrompt: text }));
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

    await Promise.all(
      agents.map(async (agent) => {
        setIsRunning(true);
        try {
          await updateAgentStatusMutation.mutateAsync({
            agent_id: agent?.id,
            status: 'running',
          });

          const uniquePrompt =
            agent.status === 'completed'
              ? `Task: ${task}\n\nAgent Name: ${agent.id}\n\nResponse:`
              : `${agent.system_prompt}\n\nTask: ${task}\n\nAgent Name: ${agent.name}\nAgent Description: ${agent.description}\n\nResponse:`;

          const { text } = await generateText({
            model: registry.languageModel(agent?.llm || ''),
            prompt: uniquePrompt,
          });

          outputs[agent.id] = text;

          await updateAgentStatusMutation.mutateAsync({
            agent_id: agent?.id,
            status: 'completed',
            output: text,
          });
        } catch (error: any) {
          outputs[agent?.id] = `Error: ${error.message || 'Unknown error'}`;
          await updateAgentStatusMutation.mutateAsync({
            agent_id: agent?.id,
            status: 'error',
            output: outputs[agent?.id],
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

  const shareSwarm = () => {
    // Implement sharing functionality here
    console.log('Sharing swarm...');
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

  return (
    <>
      {allSessions?.isPending && user && <ComponentLoader />}
      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Sidebar */}

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Spreadsheet Swarm</CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="mb-6">
                      <MoreHorizontal className="size-10 mr-2" />
                      All Sessions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Select a session</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {allSessions?.data &&
                      allSessions.data?.map((session) => (
                        <DropdownMenuItem
                          key={session?.id}
                          onClick={() => handleSessionSelect(session?.id)}
                        >
                          {session?.id}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Session ID</h3>
                    <p className="text-sm font-mono">
                      {currentSession?.id || 'pending'}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Number of Agents</h3>
                    <p className="text-2xl font-bold">
                      {currentSession?.agents?.length || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Tasks Executed</h3>
                    <p className="text-2xl font-bold">
                      {currentSession?.tasks_executed || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Time Saved</h3>
                    <p className="text-2xl font-bold">
                      {currentSession?.time_saved || 0}s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Input and Actions */}
            <div className="flex space-x-4">
              <div className="grow">
                <Input
                  placeholder="Enter task for agents..."
                  value={task}
                  onChange={(newTask) => setTask(newTask)}
                />
              </div>
              <Button
                onClick={runAgents}
                disabled={runningAgents.size > 0}
                className="min-w-[120px]"
              >
                {runningAgents.size > 0 ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Running ({runningAgents.size})
                  </>
                ) : (
                  <>
                    {isRunAgentLoader ? (
                      <LoadingSpinner />
                    ) : (
                      <Play className="size-4 mr-2" />
                    )}
                    Run Agents
                  </>
                )}
              </Button>

              {/* Add Agent Dialog */}
              <Dialog
                open={isAddAgentOpen}
                onOpenChange={() => {
                  // if (redirectStatus()) return;

                  setIsAddAgentOpen(!isAddAgentOpen);
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    {isAddAgentLoader ? (
                      <LoadingSpinner />
                    ) : (
                      <Plus className="size-4 mr-2" />
                    )}{' '}
                    Add Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader className="-mb-3">
                    <DialogTitle>Add New Agent</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4 ">
                    <div>
                      <Label htmlFor="name" className="mb-2.5 block">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newAgent.name || ''}
                        onChange={(name) => setNewAgent({ ...newAgent, name })}
                        className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] ring-offset-background focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 "
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="mb-2.5 block">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={newAgent.description || ''}
                        onChange={(description) =>
                          setNewAgent({ ...newAgent, description })
                        }
                        className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] bg-white dark:bg-black  ring-offset-background focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 "
                      />
                    </div>

                    <div>
                      <Label htmlFor="systemPrompt" className="mb-2.5 block">
                        System Prompt
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="systemPrompt"
                          value={newAgent.systemPrompt || ''}
                          onChange={(e) =>
                            setNewAgent({
                              ...newAgent,
                              systemPrompt: e.target.value,
                            })
                          }
                          className="pr-10 shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2"
                          onClick={optimizePrompt}
                          disabled={isOptimizing}
                        >
                          {isOptimizing ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Sparkles className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="llm" className="mb-2.5 block">
                        LLM
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setNewAgent({ ...newAgent, llm: value })
                        }
                      >
                        <SelectTrigger className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]">
                          <SelectValue placeholder="Select LLM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai:gpt-4-turbo">
                            GPT-4 Turbo
                          </SelectItem>
                          <SelectItem value="anthropic:claude-3-opus-20240229">
                            Claude 3 Opus
                          </SelectItem>
                          <SelectItem value="anthropic:claude-3-sonnet-20240229">
                            Claude 3 Sonnet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                    >
                      <FileText className="mx-auto size-8 mb-2" />
                      <p className="text-lg font-medium mb-1">
                        Drag and drop files here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, TXT, CSV
                      </p>
                    </div>

                    {draggedFiles.length > 0 && (
                      <div>
                        {draggedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-secondary rounded mb-2 last:mb-0"
                          >
                            <span className="flex items-center">
                              <FileText className="size-4 mr-2" />
                              {file.name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setDraggedFiles((files) =>
                                  files.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      onClick={addAgent}
                      className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),_0_3px_6px_rgba(0,0,0,0.23)] -mb-5"
                    >
                      Add Agent
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="size-4 mr-2" /> Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Swarm Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={downloadJSON}>
                    <Save className="size-4 mr-2" /> Save JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    {updateSessionOutputMutation.isPending ? (
                      <Loader2 className="size-4 mr-2" />
                    ) : (
                      <Upload className="size-4 mr-2" />
                    )}{' '}
                    Load JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadCSV}>
                    <Download className="size-4 mr-2" /> Download CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareSwarm}>
                    <Share2 className="size-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => createNewSession(task)}>
                    <RefreshCw className="size-4 mr-2" /> New Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Hidden file input */}
            <input
              id="file-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={uploadJSON}
            />

            {/* Tabs */}
            <Tabs defaultValue="current">
              <TabsList>
                <TabsTrigger value="current">Current Session</TabsTrigger>
                <TabsTrigger value="history">Session History</TabsTrigger>
              </TabsList>
              <TabsContent value="current">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>System Prompt</TableHead>
                      <TableHead>LLM</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Output</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSession?.agents?.map((agent) => (
                      <TableRow
                        key={agent?.id}
                        onClick={() => setAgentId(agent?.id)}
                      >
                        <TableCell>{agent?.name}</TableCell>
                        <TableCell>{agent?.description}</TableCell>
                        <TableCell className="w-[280px] flex items-center">
                          <div className="absolute inset-0 p-4 overflow-y-auto top-1/2 -translate-y-1/2">
                            {agent?.system_prompt}
                          </div>
                        </TableCell>
                        <TableCell>{agent?.llm}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {agent?.status === 'running' ? (
                              <Loader2 className="size-4 mr-2 animate-spin" />
                            ) : null}
                            {isRunning ? 'running...' : agent?.status}
                          </div>
                        </TableCell>
                        <TableCell className="w-[320px] flex items-center">
                          <Dialog
                            open={isAgentOutput && agent?.id === agentId}
                            onOpenChange={setIsAgentOutput}
                          >
                            <DialogTrigger asChild>
                              <div className="absolute inset-0 p-4 overflow-y-auto top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-200">
                                {agent?.output}
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl p-6">
                              <Copy
                                size={30}
                                className="p-1 text-primary cursor-pointer absolute right-12 top-2"
                                onClick={() =>
                                  copyToClipboard(agent?.output ?? '')
                                }
                              />
                              <SyntaxHighlighter
                                PreTag={CustomPre}
                                style={dracula}
                                language="markdown"
                                wrapLongLines
                              >
                                {agent?.output || ''}
                              </SyntaxHighlighter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateClick(agent)}
                            >
                              {isDuplicateLoader ? (
                                <LoadingSpinner />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteAgent(agent)}
                            >
                              {deleteAgentMutation.isPending &&
                              agent?.id === selectedAgent?.id ? (
                                <LoadingSpinner />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="history">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Agents</TableHead>
                      <TableHead>Tasks Executed</TableHead>
                      <TableHead>Time Saved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSessionsAgents?.data &&
                      allSessionsAgents.data?.map((session) => (
                        <TableRow key={session?.id}>
                          <TableCell>{session?.id}</TableCell>
                          <TableCell>
                            {session?.timestamp &&
                              new Date(session?.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{session?.agents?.length}</TableCell>
                          <TableCell>{session?.tasks_executed}</TableCell>
                          <TableCell>{session?.time_saved}s</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
