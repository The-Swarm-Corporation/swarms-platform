import { useState, useMemo, SyntheticEvent } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Plus, Search, Trash } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import { AgentForm } from './form';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { AgentTemplateWithStatus, SwarmConfig } from '../types';
import LoadingSpinner from '../../loading-spinner';
import { Tables } from '@/types_db';
import { getTruncatedString } from '@/shared/utils/helpers';

interface AgentLibraryProps {
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

export function AgentLibrary({ chatId, agentsRefetch }: AgentLibraryProps) {
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

    const userId = agentTemplatesQuery.data[0]?.user_id || '';
    const explorerItems = explorerItemsQuery.data?.combinedItems?.filter(
      (item) => item.user_id === userId,
    );

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
  const deleteAgentTemplate = trpc.chatAgent.deleteAgentTemplate.useMutation();

  const filteredAgents =
    agentTemplatesQuery.data?.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.system_prompt?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const filteredExplorerItems = userExplorerItems.filter(
    (prompt) =>
      prompt?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt?.description?.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleCreateTemplate = async (formData: any) => {
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

      if (explorerItemToAdd) {
        if ('prompt' in explorerItemToAdd) {
          metadata.explorerPromptId = explorerItemToAdd.id;
          metadata.source = 'explorer_prompt';
        } else {
          metadata.explorerAgentId = explorerItemToAdd.id;
          metadata.source = 'explorer_agent';
        }
      }

      await createAgentTemplate.mutateAsync({
        name: formData.name,
        description: formData.description,
        model: formData.model,
        temperature: formData.temperature,
        max_tokens: formData.maxTokens,
        system_prompt: formData.systemPrompt,
        metadata: metadata || {},
      });

      toast({
        description: 'Agent template created successfully',
      });

      agentTemplatesQuery.refetch();
      explorerItemsQuery.refetch();

      setActiveTab('library');
      setOpenAgentModal(false);
      setIsCreatingTemplate(false);
      setExplorerItemToAdd(null);

      return true;
    } catch (error) {
      console.error('Error creating agent template:', error);
      toast({
        description: 'Failed to create agent template. Please try again.',
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
      <div className="flex items-center gap-4 lg:gap-8 p-4 border-b">
        <div className="relative w-[80%]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-8 border border-[#1e1e1e]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleOpenAgentModal}
          className="bg-primary/40 hover:bg-primary/70 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Agent
        </Button>
        <Sheet open={openAgentModal} onOpenChange={setOpenAgentModal}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Agent Template</SheetTitle>
              <SheetDescription>
                Create a new agent that can be used across multiple chats.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <AgentForm
                isLoading={isCreatingTemplate}
                onSubmit={handleCreateTemplate}
                initialData={agentFormInitialValues}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex border-b">
        <div
          className={`flex-1 text-center p-2 cursor-pointer ${activeTab === 'library' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          Agent Library
        </div>
        <div
          className={`flex-1 text-center p-2 cursor-pointer ${activeTab === 'explorer' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          Your Explorer Agents
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:h-[350px]">
          {activeTab === 'library' ? (
            <div className="space-y-2">
              {agentTemplatesQuery.isLoading ? (
                <div className="flex justify-center p-4">Loading agents...</div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  {searchQuery
                    ? 'No agents match your search'
                    : 'No agents found'}
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex group items-start justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() =>
                      handleSelectAgent(agent as AgentTemplateWithStatus)
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{agent.name}</h3>
                        <Badge
                          variant={
                            agent.chatStatus.is_active ? 'default' : 'outline'
                          }
                        >
                          {agent.chatStatus.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {isAgentToggle && selectedAgent?.id === agent?.id ? (
                          <LoadingSpinner size={16} />
                        ) : (
                          agent.chatStatus.is_selected && (
                            <Badge variant="secondary">In Chat</Badge>
                          )
                        )}
                        <button
                          onClick={(e) =>
                            handleOpenDeleteModal(
                              e,
                              agent as AgentTemplateWithStatus,
                            )
                          }
                          className="p-1 rounded-sm invisible group-hover:visible hover:bg-gray-200 dark:hover:bg-gray-800 -translate-x-3"
                        >
                          <Trash className="h-3 w-3 text-primary" />
                        </button>
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
                                You're deleting this agent across all
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
                                  <LoadingSpinner size={15} className="ml-2" />
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {agent.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {agent.description.length > 100
                            ? `${agent.description.substring(0, 100)}...`
                            : agent.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        Model: {agent.model}
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={agent.chatStatus.is_selected}
                        onCheckedChange={() =>
                          handleToggleAgent(agent as AgentTemplateWithStatus)
                        }
                        disabled={isAgentToggle}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {explorerItemsQuery.isLoading ? (
                <div className="flex justify-center p-4">
                  Loading explorer agents...
                </div>
              ) : filteredExplorerItems.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  {searchQuery
                    ? 'No explorer agents match your search'
                    : 'No explorer agents found'}
                </div>
              ) : (
                filteredExplorerItems?.map((item) => (
                  <div
                    key={item?.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant="outline">
                          {'prompt' in item ? 'Prompt' : 'Agent'}
                        </Badge>
                      </div>
                      {item?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {getTruncatedString(item.description, 100)}
                        </p>
                      )}
                      {'prompt' in item && item.prompt && (
                        <p className="text-xs text-white mt-2">
                          {getTruncatedString(item.prompt, 100)}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => handleOpenExplorerItem(item)}
                    >
                      Add to Library
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Agent Details Dialog */}
      <Dialog
        open={isDetailDialogOpen && !selectedDeleteAgent}
        onOpenChange={setIsDetailDialogOpen}
      >
        <DialogContent className="max-w-3xl border border-[#1e1e1e]">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAgent.name}
                  {selectedAgent.chatStatus.is_selected && (
                    <Badge variant="secondary">In Chat</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedAgent.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium mb-1">System Prompt</h4>
                  <div className="bg-accent p-4 rounded-md whitespace-pre-wrap max-h-64 overflow-y-auto font-xs text-black dark:text-[#928E8B]">
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
                  >
                    Close
                  </Button>
                  <Button
                    variant={
                      selectedAgent.chatStatus.is_selected
                        ? 'destructive'
                        : 'default'
                    }
                    onClick={() => {
                      handleToggleAgent(selectedAgent);
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    {selectedAgent.chatStatus.is_selected
                      ? 'Remove from Chat'
                      : 'Add to Chat'}
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
