'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Cog,
  Pencil,
  Plus,
  Settings,
  Trash,
} from 'lucide-react';
import type { Agent, SwarmArchitecture } from '@/shared/components/chat/types';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { AgentForm } from '../form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/utils/cn';
import { Tables } from '@/types_db';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { getTruncatedString } from '@/shared/utils/helpers';
import { Input } from '@/shared/components/ui/input';
import { UseQueryResult } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

interface SwarmSelectorProps {
  isLoading?: boolean;
  value: SwarmArchitecture;
  onValueChange: (value: SwarmArchitecture) => void;
}

const convertEditingAgent = (
  agent: Tables<'swarms_cloud_chat_agents'>,
): Agent => ({
  id: agent.id,
  name: agent.name,
  description: agent.description ?? '',
  model: agent.model,
  temperature: agent.temperature ?? 0.7,
  maxTokens: agent.max_tokens ?? 2048,
  systemPrompt: agent.system_prompt ?? '',
  isActive: agent.is_active ?? false,
});

function SwarmSelector({
  value,
  isLoading,
  onValueChange,
}: SwarmSelectorProps) {
  return (
    <Select disabled={isLoading} value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white/80 dark:bg-zinc-950/80 border border-[#40403F]">
        <SelectValue
          placeholder={isLoading ? 'Loading...' : 'Select architecture'}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ConcurrentWorkflow">Concurrent</SelectItem>
        <SelectItem value="SequentialWorkflow">Sequential</SelectItem>
        <SelectItem value="auto">Auto</SelectItem>
        <SelectItem value="AgentRearrange">Agent Rearrange</SelectItem>
        <SelectItem value="MixtureOfAgents">Mixture of Agents</SelectItem>
        <SelectItem value="SpreadSheetSwarm">Spreadsheet Swarm</SelectItem>
        <SelectItem value="GroupChat">Group Chat</SelectItem>
        <SelectItem value="MultiAgentRouter">Multi-agent Router</SelectItem>
        <SelectItem value="AutoSwarmBuilder">Auto Swarm Builder</SelectItem>
        <SelectItem value="HiearchicalSwarm">Hiearchical Swarm</SelectItem>
        <SelectItem value="MajorityVoting">Majority Voting</SelectItem>
      </SelectContent>
    </Select>
  );
}

type ConversationWithMessages = Tables<'swarms_cloud_chat'> & {
  messages: Tables<'swarms_cloud_chat_messages'>[];
};

interface ConfigSidebarProps {
  agents: Tables<'swarms_cloud_chat_agents'>[];
  activeConversation: UseQueryResult<ConversationWithMessages | null, any>;
  swarmArchitecture: SwarmArchitecture;
  isLoadingAgents: boolean;
  isUpdatePending: boolean;
  isCreateAgent: boolean;
  isUpdateAgent: boolean;
  isToggleAgent: boolean;
  isDeleteAgent: boolean;
  openAgentModal: boolean;
  agentsRefetch: () => void;
  chatRefetch: () => void;
  setOpenAgentModal: Dispatch<SetStateAction<boolean>>;
  onUpdateConversation: ({
    id,
    name,
    description,
    maxLoops,
  }: {
    id: string;
    name: string;
    description: string;
    maxLoops: number;
  }) => void;
  onAddAgent: (agent: Omit<Agent, 'id'>) => void;
  onUpdateAgent: ({
    id,
    updates,
  }: {
    id: string;
    updates: Partial<Agent>;
  }) => void;
  onRemoveAgent: (id: string) => void;
  onUpdateSwarmArchitecture: (architecture: SwarmArchitecture) => void;
  onToggleAgent: (id: string) => void;
}

export function ConfigSidebar({
  agents,
  activeConversation,
  swarmArchitecture,
  isUpdatePending,
  isCreateAgent,
  isUpdateAgent,
  openAgentModal,
  isLoadingAgents,
  setOpenAgentModal,
  onUpdateConversation,
  onAddAgent,
  onUpdateAgent,
  chatRefetch,
  agentsRefetch,
  isToggleAgent,
  isDeleteAgent,
  onRemoveAgent,
  onUpdateSwarmArchitecture,
  onToggleAgent,
}: ConfigSidebarProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [agentId, setAgentId] = useState('');
  const [configData, setConfigData] = useState({
    name: '',
    description: '',
    maxLoops: 1,
  });

  const isMobile = useIsMobile();

  const originalData = activeConversation?.data;

  const isInvalidName = !configData.name.trim();
  const isDefaultName = ['new chat'].includes(
    configData.name.trim().toLowerCase(),
  );
  const hasChanged =
    configData.name !== originalData?.name ||
    configData.description !== (originalData?.description || '') ||
    configData.maxLoops !== originalData?.max_loops;

  const isUpdateDisabled = isInvalidName || isDefaultName || !hasChanged;

  const handleUpdateConversation = async () => {
    if (isInvalidName) {
      toast({
        description: 'Name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    if (isDefaultName) {
      toast({
        description: 'Please choose a more descriptive name than "New chat".',
        variant: 'destructive',
      });
      return;
    }

    if (!hasChanged) {
      toast({
        description: 'No changes detected to update.',
        variant: 'destructive',
      });
      return;
    }

    await onUpdateConversation({
      id: originalData?.id!,
      name: configData.name,
      description: configData.description,
      maxLoops: configData.maxLoops,
    });

    toast({
      description: 'Conversation updated successfully.',
    });
    activeConversation.refetch();
    chatRefetch();
  };

  const handleAgentId = (id: string) => setAgentId(id);

  const handleMobileExpand = () => {
    if (!isExpanded && isMobile) {
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    if (originalData) {
      setConfigData({
        name: originalData.name,
        description: originalData.description || '',
        maxLoops: originalData.max_loops,
      });
    }
  }, [originalData]);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 280 : isMobile ? 20 : 64 }}
        onClick={handleMobileExpand}
        className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-sm border-l max-lg:absolute right-0 max-lg:z-10 border-[#f9f9f914] flex flex-col"
      >
        <div
          className={cn(
            'border-b border-[#f9f9f914] flex items-center justify-between lg:p-4',
            isMobile && isExpanded ? 'p-4' : '',
          )}
        >
          {isExpanded && (
            <h2 className="dark:text-[#f1f1f1] font-bold">Configuration</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="dark:text-[#f1f1f1]"
          >
            {isExpanded ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-b border-[#f9f9f914] ">
              <label className="text-xs font-medium mb-2 block">
                Swarm Type
              </label>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <SwarmSelector
                  value={swarmArchitecture}
                  isLoading={isLoadingAgents}
                  onValueChange={onUpdateSwarmArchitecture}
                />
                {isLoadingAgents && (
                  <LoadingSpinner
                    size={15}
                    className="absolute right-3 top-3 bg-secondary"
                  />
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-b border-[#f9f9f914] ">
              <label
                htmlFor="swarmName"
                className="text-xs font-medium mb-2 block"
              >
                Swarm Name
              </label>

              <Input
                id="swarmName"
                value={configData.name}
                onChange={(e) =>
                  setConfigData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Name"
                className="bg-white/80 dark:bg-zinc-950/80 border border-[#40403F]"
                required
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-b border-[#f9f9f914] ">
              <label
                htmlFor="swarmDescription"
                className="text-xs font-medium mb-2 block"
              >
                Swarm Description
              </label>

              <Input
                id="swarmDescription"
                value={configData.description}
                onChange={(e) =>
                  setConfigData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Description"
                className="bg-white/80 dark:bg-zinc-950/80 border border-[#40403F]"
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-b border-[#f9f9f914] ">
              <label
                htmlFor="maxLoops"
                className="text-xs font-medium mb-2 block"
              >
                Max Loops
              </label>

              <Input
                id="maxLoops"
                type="number"
                value={configData.maxLoops}
                onChange={(e) =>
                  setConfigData((prev) => ({
                    ...prev,
                    maxLoops: Number.parseInt(e.target.value),
                  }))
                }
                className="bg-white/80 dark:bg-zinc-950/80 border border-[#40403F]"
                min="1"
                max="10"
              />
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center px-4 pt-4 pb-2">
            {isExpanded && (
              <label className="text-xs font-medium mb-2 block">
                Swarm Agents
              </label>
            )}
            <div
              className={cn(
                'lg:block',
                isMobile && isExpanded ? 'block' : 'hidden',
              )}
            >
              <Sheet open={openAgentModal} onOpenChange={setOpenAgentModal}>
                <SheetTrigger asChild>
                  <Button
                    disabled={isCreateAgent || isUpdateAgent}
                    className={`${isExpanded ? 'w-full' : 'w-auto'} bg-primary/40 hover:bg-primary/70 text-white`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add New Agent</SheetTitle>
                    <SheetDescription>
                      Configure a new agent for your swarm.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <AgentForm
                      isLoading={isCreateAgent}
                      onSubmit={onAddAgent}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2 h-[300px]">
              {agents.map((agent) => {
                const editAgent = convertEditingAgent(agent);
                return (
                  <motion.div
                    key={agent.id}
                    layout
                    className={`p-3 rounded-lg border transition-colors ${
                      agent.is_active
                        ? 'bg-white/80 dark:bg-primary/40 dark:hover:bg-primary/50 border-primary/10'
                        : 'bg-zinc-100/80 dark:bg-zinc-900/80 border-[#40403F]'
                    }`}
                    onClick={() => handleAgentId(agent.id!)}
                  >
                    {isExpanded ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium dark:text-[#f1f1f1]">
                            {agent?.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isToggleAgent || isDeleteAgent}
                                  className="dark:text-[#f1f1f1]/70 hover:dark:text-[#f1f1f1]"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAgent(editAgent);
                                  }}
                                  className="cursor-pointer focus:text-red-600/50"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer focus:text-red-600/50"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await onRemoveAgent(agent?.id);
                                    agentsRefetch();
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isToggleAgent}
                              onClick={() => onToggleAgent(agent?.id)}
                              className={
                                agent.is_active
                                  ? 'dark:text-[#f1f1f1]'
                                  : 'dark:text-[#f1f1f1]/50'
                              }
                            >
                              {agent?.is_active ? 'Active' : 'Inactive'}{' '}
                              {isToggleAgent && agentId === agent?.id && (
                                <LoadingSpinner size={10} className="ml-1" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className={'text-sm dark:text-[#f1f1f1]/70'}>
                          {getTruncatedString(agent?.description ?? '', 50)}
                        </p>
                        <div className="text-xs dark:text-[#f1f1f1]/50">
                          Model: {agent.model}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div
                          className={`w-2 h-2 rounded-full ${agent.is_active ? 'bg-red-500' : 'bg-red-500/30'}`}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div
          className={cn(
            'p-4 border-t border-[#f9f9f914] pb-8 lg:block',
            isMobile && isExpanded ? 'block' : 'hidden',
          )}
        >
          <Button
            disabled={
              activeConversation.isLoading ||
              isUpdatePending ||
              isUpdateDisabled ||
              !isExpanded
            }
            onClick={handleUpdateConversation}
            className={`${isExpanded ? 'w-full' : 'w-auto'} bg-primary/40 hover:bg-primary/70 text-white absolute bottom-8`}
          >
            {isUpdatePending ? (
              <LoadingSpinner size={18} />
            ) : (
              <Cog className="h-4 w-4" />
            )}
            {isExpanded && <span className="ml-2">Setup Configuration</span>}
          </Button>
        </div>
      </motion.div>

      <Sheet open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Agent</SheetTitle>
            <SheetDescription>Update agent configuration.</SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {editingAgent && (
              <AgentForm
                initialData={editingAgent}
                isLoading={isUpdateAgent}
                onSubmit={async (updates) => {
                  try {
                    await onUpdateAgent({
                      id: editingAgent?.id ?? '',
                      updates,
                    });
                    setEditingAgent(null);
                    agentsRefetch();
                  } catch (error) {
                    console.error('Failed to update agent:', error);
                  }
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
