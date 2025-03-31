import { useState, useMemo, SyntheticEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  AlertCircle,
  Box,
  MoreVertical,
  NotebookTabs,
  Pencil,
  Plus,
  Search,
  Trash,
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { AgentTemplateWithStatus } from '../../types';
import LoadingSpinner from '../../../loading-spinner';
import { Tables } from '@/types_db';
import { getTruncatedString } from '@/shared/utils/helpers';
import { AgentTabs } from './tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Card } from '@/shared/components/ui/card';
import { LibraryAgentForm } from '../forms/library-form';
import Link from 'next/link';

interface AgentLibraryProps {
  models: string[];
  chatId: string;
  agentsRefetch: () => void;
}

type ExplorerItem =
  | Tables<'swarms_cloud_prompts'>
  | Tables<'swarms_cloud_agents'>;

const INITIAL_DATA = {
  name: '',
  description: '',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: '',
};

export function AgentLibrary({
  models,
  chatId,
  agentsRefetch,
}: AgentLibraryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [openAgentModal, setOpenAgentModal] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedAgent, setSelectedAgent] =
    useState<AgentTemplateWithStatus | null>(null);
  const [selectedDeleteAgent, setSelectedDeleteAgent] =
    useState<AgentTemplateWithStatus | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'explorer'>('library');
  const [explorerItemToAdd, setExplorerItemToAdd] =
    useState<ExplorerItem | null>(null);
  const [agentFormInitialValues, setAgentFormInitialValues] =
    useState(INITIAL_DATA);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [skipNextRowClick, setSkipNextRowClick] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  const agentTemplatesQuery = trpc.chatAgent.getAgentTemplatesForChat.useQuery(
    chatId,
    {
      enabled: !!chatId,
      refetchOnWindowFocus: false,
    },
  );

  const explorerItemsQuery = trpc.explorer.getUserExplorerItems.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    },
  );

  const userExplorerItems = useMemo(() => {
    if (!explorerItemsQuery.data || !agentTemplatesQuery.data) return [];

    const explorerItems = explorerItemsQuery.data?.combinedItems;

    return explorerItems.filter((item) => {
      return !agentTemplatesQuery.data.some(
        (template) =>
          template.metadata &&
          typeof template.metadata === 'object' &&
          ((template.metadata as any)?.explorerPromptId === item.id ||
            (template.metadata as any)?.explorerAgentId === item.id),
      );
    });
  }, [explorerItemsQuery.data, agentTemplatesQuery.data]);

  const addAgentToChat = trpc.chatAgent.addAgentTemplateToChat.useMutation();
  const removeAgentFromChat = trpc.chatAgent.removeAgentFromChat.useMutation();
  const createAgentTemplate = trpc.chatAgent.createAgentTemplate.useMutation();
  const updateAgentTemplate = trpc.chatAgent.updateAgentTemplate.useMutation();
  const deleteAgentTemplate = trpc.chatAgent.deleteAgentTemplate.useMutation();

  const filteredAgents =
    agentTemplatesQuery.data?.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.system_prompt?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const filteredExplorerItems = userExplorerItems.filter(
    (item) =>
      item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemType !== 'agent' &&
        item.prompt?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const isAgentToggle =
    removeAgentFromChat.isPending ||
    addAgentToChat.isPending ||
    deleteAgentTemplate.isPending;

  const handleSelectAgent = (agent: AgentTemplateWithStatus) => {
    if (skipNextRowClick) {
      setSkipNextRowClick(false);
      return;
    }
    setSelectedAgent(agent);
    setIsDetailDialogOpen(true);
  };

  const handleOpenAgentModal = () => {
    setExplorerItemToAdd(null);
    setAgentFormInitialValues(INITIAL_DATA);
    setIsEditingTemplate(false);
    setOpenAgentModal(true);
  };

  const handleCloseAgentModal = () => {
    setOpenAgentModal(false);
    setSelectedAgent(null);
    setIsCreatingTemplate(false);
    setIsEditingTemplate(false);
  };

  const handleOpenEditModal = (
    e: SyntheticEvent,
    agent: AgentTemplateWithStatus,
  ) => {
    e.stopPropagation();
    setSkipNextRowClick(true);
    setSelectedAgent(agent);

    const editValues = {
      name: agent.name,
      description: agent.description || '',
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.max_tokens,
      systemPrompt: agent.system_prompt || '',
      metadata: (agent as any).metadata || {},
    };

    setAgentFormInitialValues(editValues);
    setIsEditingTemplate(true);
    setOpenAgentModal(true);
  };

  const handleOpenDeleteModal = (
    e: SyntheticEvent,
    agent: AgentTemplateWithStatus,
  ) => {
    e.stopPropagation();
    setSkipNextRowClick(true);
    setSelectedDeleteAgent(agent);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedDeleteAgent(null);
    setOpenDeleteModal(false);
  };

  const handleDeleteAgent = async (agent: AgentTemplateWithStatus) => {
    if (isAgentToggle) return;

    try {
      await deleteAgentTemplate.mutateAsync(agent.id);
      toast({
        description: `${agent.name} deleted successfully`,
      });

      agentTemplatesQuery.refetch();
      agentsRefetch();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        description: 'Failed to delete agent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAgent = async (agent: AgentTemplateWithStatus) => {
    if (isAgentToggle) return;

    try {
      if (agent.chatStatus.is_selected) {
        await removeAgentFromChat.mutateAsync({
          templateId: agent.id,
          chatId,
        });
        toast({
          description: `${agent.name} removed from chat`,
        });
      } else {
        await addAgentToChat.mutateAsync({
          templateId: agent.id,
          chatId,
          overrides: {
            is_active: true,
          },
        });

        toast({
          description: `${agent.name} added to chat`,
        });
      }
      agentTemplatesQuery.refetch();
      agentsRefetch();
    } catch (error) {
      console.error('Error toggling agent:', error);
      toast({
        description: 'Failed to update agent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (!formData.systemPrompt.trim()) {
        toast({
          description: 'System prompt is required.',
          variant: 'destructive',
        });
        return false;
      }

      setIsCreatingTemplate(true);

      const metadata = {
        ...formData.metadata,
      };

      if (!isEditingTemplate && explorerItemToAdd) {
        if ('prompt' in explorerItemToAdd) {
          metadata.explorerPromptId = explorerItemToAdd.id;
          metadata.source = 'explorer_prompt';
        } else {
          metadata.explorerAgentId = explorerItemToAdd.id;
          metadata.source = 'explorer_agent';
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        model: formData.model,
        temperature: formData.temperature,
        max_tokens: formData.maxTokens,
        system_prompt: formData.systemPrompt,
        auto_generate_prompt: formData.autoGeneratePrompt,
        max_loops: formData.maxLoops,
        role: formData.role,
        metadata: metadata || {},
      };

      if (isEditingTemplate && selectedAgent) {
        await updateAgentTemplate.mutateAsync({
          id: selectedAgent.id,
          ...payload,
        });

        toast({
          description: 'Agent template updated successfully',
        });
      } else {
        await createAgentTemplate.mutateAsync(payload);

        toast({
          description: 'Agent template created successfully',
        });
      }

      agentTemplatesQuery.refetch();
      if (isEditingTemplate) {
        agentsRefetch();
      }
      explorerItemsQuery.refetch();

      setActiveTab('library');
      setOpenAgentModal(false);
      setIsCreatingTemplate(false);
      setExplorerItemToAdd(null);
      setIsEditingTemplate(false);

      return true;
    } catch (error) {
      console.error('Error handling agent template:', error);
      toast({
        description: `Failed to ${isEditingTemplate ? 'update' : 'create'} agent template. Please try again.`,
        variant: 'destructive',
      });
      setIsCreatingTemplate(false);
      return false;
    }
  };

  const handleOpenExplorerItem = (item: ExplorerItem) => {
    setExplorerItemToAdd(item);

    let initialSystemPrompt = '';

    if ('prompt' in item) {
      initialSystemPrompt = item.prompt || '';
    }

    const initialValues = {
      name: item.name || 'Unnamed Agent',
      description: item.description || '',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: initialSystemPrompt,
    };

    setAgentFormInitialValues(initialValues);

    setOpenAgentModal(true);
  };

  return (
    <div className="flex flex-col h-full">
      <AgentTabs {...{ activeTab, setActiveTab }} />

      <ScrollArea className="flex-1">
        <div>
          <Dialog
            open={openAgentModal}
            onOpenChange={(open) => {
              setOpenAgentModal(open);
              if (!open) {
                setIsEditingTemplate(false);
                setAgentFormInitialValues(INITIAL_DATA);
              }
            }}
          >
            <DialogContent className="max-w-6xl max-h-[85vh] h-full overflow-hidden flex flex-col border border-[#40403F]">
              <DialogHeader>
                <DialogTitle className="text-xs invisible font-bold text-primary">
                  Agent Configuration
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <LibraryAgentForm
                  models={models}
                  isEditing={isEditingTemplate}
                  isLoading={isCreatingTemplate}
                  onSubmit={handleFormSubmit}
                  handleCloseModal={handleCloseAgentModal}
                  initialData={agentFormInitialValues}
                />
              </div>
            </DialogContent>
          </Dialog>

          {activeTab === 'library' ? (
            <div className="md:p-2 lg:p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-red-600">Agents</h1>
                <div className="mt-1 space-y-2 text-zinc-900 dark:text-white">
                  <p>
                    Create and manage reusable AI agents that can be used across
                    multiple chats.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Agents are specialized AI assistants that can be configured
                    for specific tasks. Build a library of agents with different
                    capabilities, then combine them into chats to tackle complex
                    problems. Each agent can be reused across multiple chats to
                    maximize efficiency.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  className="bg-primary/60 hover:bg-primary/70 text-white"
                  onClick={handleOpenAgentModal}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Agent
                </Button>
              </div>

              <Card className="border-red-500/50">
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      />
                    </div>
                    <Button
                      variant="outline"
                      disabled
                      className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400"
                    >
                      Filter
                    </Button>
                  </div>
                </div>
                {filteredAgents.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="h-8 w-8 text-zinc-500 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-300 mb-2">
                      No agents found
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-500 mb-4 max-w-md">
                      {agentTemplatesQuery.data?.length === 0
                        ? 'Create your first agent to get started. Agents can be specialized for different tasks and reused across swarms.'
                        : 'No agents match your search criteria'}
                    </p>
                    {agentTemplatesQuery.data?.length === 0 && (
                      <Button
                        className="bg-primary/60 hover:bg-primary/70 text-white"
                        onClick={handleOpenAgentModal}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Agent
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table className='font-mono'>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableHead className="text-primary/70 text-xs md:text-sm lg:text-base">Name</TableHead>
                        <TableHead className="text-primary/70 text-xs md:text-sm lg:text-base">Model</TableHead>
                        <TableHead className="text-primary/70 text-xs md:text-sm lg:text-base">
                          In Chat
                        </TableHead>
                        <TableHead className="text-primary/70 text-xs md:text-sm lg:text-base">
                          Status
                        </TableHead>
                        <TableHead className="text-primary/70 text-xs md:text-sm lg:text-base">
                          Updated At
                        </TableHead>
                        <TableHead className="text-primary/70 text-xs md:text-sm lg:text-base text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.map((agent) => (
                        <TableRow
                          key={agent.id}
                          className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() =>
                            handleSelectAgent(agent as AgentTemplateWithStatus)
                          }
                        >
                          <TableCell className="font-medium text-zinc-900 dark:text-white text-xs md:text-sm lg:text-base">
                            <div className="flex items-center space-x-3">
                              <Box className="h-4 w-4 text-red-500" />
                              <span>{agent.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-900 dark:text-white text-xs md:text-sm lg:text-base">
                            {agent.model}
                          </TableCell>
                          <TableCell className='text-xs md:text-sm lg:text-base'>
                            <Badge
                              variant="outline"
                              className={
                                agent.chatStatus.is_selected
                                  ? 'border-green-500 text-green-500'
                                  : 'border-red-500 text-red-500'
                              }
                            >
                              {agent.chatStatus.is_selected
                                ? 'Enabled'
                                : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-xs md:text-sm lg:text-base'>
                            <Badge
                              variant="outline"
                              className={
                                agent.chatStatus.is_active
                                  ? 'border-green-500 text-green-500'
                                  : 'border-zinc-500 text-zinc-500'
                              }
                            >
                              {agent.chatStatus.is_active
                                ? 'Active'
                                : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-900 text-xs md:text-sm lg:text-base dark:text-white">
                            {new Date(
                              agent.updated_at ?? new Date(),
                            )?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className='font-mono border border-[#40403F]'>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAgent(
                                      agent as AgentTemplateWithStatus,
                                    );
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <NotebookTabs className="h-3 w-3" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    handleOpenEditModal(
                                      e,
                                      agent as AgentTemplateWithStatus,
                                    );
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAgent(
                                      agent as AgentTemplateWithStatus,
                                    );
                                  }}
                                >
                                  {isAgentToggle ? (
                                    <LoadingSpinner size={15} />
                                  ) : (
                                    <Checkbox
                                      checked={agent.chatStatus.is_selected}
                                      disabled={isAgentToggle}
                                    />
                                  )}
                                  <span>Toggle</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    handleOpenDeleteModal(
                                      e,
                                      agent as AgentTemplateWithStatus,
                                    );
                                  }}
                                  className="text-primary flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash className="h-3 w-3" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <Dialog
                            open={
                              openDeleteModal &&
                              selectedDeleteAgent?.id === agent?.id
                            }
                            onOpenChange={handleCloseDeleteModal}
                          >
                            <DialogContent className="max-w-xl border border-[#40403F]">
                              <DialogHeader>
                                <DialogTitle></DialogTitle>
                                <DialogDescription className="text-center text-white">
                                  You&apos;re deleting this agent across all
                                  conversations?
                                </DialogDescription>
                              </DialogHeader>

                              <div className="flex mt-4 justify-center gap-2">
                                <Button
                                  variant="outline"
                                  disabled={deleteAgentTemplate.isPending}
                                  onClick={handleCloseDeleteModal}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  disabled={deleteAgentTemplate.isPending}
                                  onClick={() =>
                                    handleDeleteAgent(
                                      agent as AgentTemplateWithStatus,
                                    )
                                  }
                                >
                                  Delete
                                  {deleteAgentTemplate.isPending && (
                                    <LoadingSpinner
                                      size={15}
                                      className="ml-2"
                                    />
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </div>
          ) : (
            <div className="md:p-2 lg:p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-red-600">
                  Explorer Models
                </h1>
                <div className="mt-1 space-y-2 text-zinc-900 dark:text-white">
                  <p>
                    Access all explorer models to needed to be integrated across
                    multiple conversations.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Add specific prompts and agents from the swarms marketplace
                    to the agent&apos;s library. With access to a wide range of
                    models, there is no need to create agents at every turn
                    rather you can utilize complex models readily available to
                    you and integrate into the agent&apos;s library.
                  </p>
                </div>
              </div>

              <Card className="border-red-500/50">
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={explorerItemsQuery.isLoading}
                        className="pl-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                {explorerItemsQuery.isLoading ? (
                  <div className="p-12 flex justify-center items-center">
                    Loading explorer models...
                  </div>
                ) : filteredExplorerItems.length === 0 ? (
                  <div className="text-zinc-600 dark:text-zinc-500 text-center max-w-md p-12 flex justify-center items-center">
                    {searchQuery
                      ? 'No explorer models match your search'
                      : 'No explorer models found'}
                  </div>
                ) : (
                  <div className="px-4">
                    {filteredExplorerItems?.map((item) => (
                      <div
                        key={item?.id}
                        className="flex flex-col md:flex-row md:items-start md:justify-between p-5 rounded-lg bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/60 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-zinc-700/70 my-3"
                      >
                        <div className="flex-1 font-mono">
                          <Link
                            key={item?.id}
                            href={`/${item.itemType}/${item.id}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-sm md:text-lg">
                                {item.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`${
                                  'prompt' in item
                                    ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-indigo-400/30'
                                    : 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/30'
                                } text-white py-1 px-3 shadow-sm`}
                              >
                                {'prompt' in item ? 'Prompt' : 'Agent'}
                              </Badge>
                            </div>
                          </Link>

                          {item?.description && (
                            <p className="text-xs md:text-sm font-semibold text-muted-foreground mt-2 leading-relaxed">
                              {getTruncatedString(item.description, 500)}
                            </p>
                          )}

                          {'prompt' in item && item.prompt && (
                            <div className="mt-3 bg-zinc-950/50 p-3 rounded-md border-l-2 border-primary/50 shadow-inner">
                              <p className="text-xs text-zinc-400 italic">
                                {getTruncatedString(item.prompt, 100)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex-[0.5] flex justify-end items-start md:ml-4 mt-3 md:mt-0 ">
                          <Button
                            className="bg-gradient-to-r from-primary/80 to-primary/60 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                            onClick={() => handleOpenExplorerItem(item)}
                            aria-label="Add to Library"
                          >
                            <span className="hidden md:block">Add to Library</span>
                            <Plus className="md:hidden" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Agent Details Dialog */}
      <Dialog
        open={isDetailDialogOpen && !selectedDeleteAgent}
        onOpenChange={setIsDetailDialogOpen}
      >
        <DialogContent className="max-w-3xl border border-[#40403F] font-mono">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAgent.name}
                  {selectedAgent.chatStatus.is_selected && (
                    <Badge variant="secondary">In Chat</Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedAgent.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium mb-1">System Prompt</h4>
                  <div className="bg-zinc-950/50 p-3 rounded-md border-l-2 border-primary/50 shadow-inner italic whitespace-pre-wrap max-h-64 overflow-y-auto text-sm font-medium text-black dark:text-[#928E8B]">
                    {selectedAgent.system_prompt || 'No system prompt defined'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 space-y-2">
                  <div>
                    <h4 className="font-semibold mb-1">Model</h4>
                    <p className="font-xs text-black dark:text-[#928E8B]">
                      {selectedAgent.model}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Temperature</h4>
                    <p className="font-xs text-black dark:text-[#928E8B]">
                      {selectedAgent.temperature}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Max Tokens</h4>
                    <p className="font-xs text-black dark:text-[#928E8B]">
                      {selectedAgent.max_tokens}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Created</h4>
                    <p className="font-xs text-black dark:text-[#928E8B]">
                      {new Date(selectedAgent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailDialogOpen(false)}
                    disabled={isAgentToggle}
                  >
                    Close
                  </Button>
                  <Button
                    variant={
                      selectedAgent.chatStatus.is_selected
                        ? 'destructive'
                        : 'default'
                    }
                    onClick={async () => {
                      await handleToggleAgent(selectedAgent);
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    {selectedAgent.chatStatus.is_selected
                      ? 'Remove from Chat'
                      : 'Add to Chat'}{' '}
                    {isAgentToggle && (
                      <LoadingSpinner size={15} className="ml-2" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
