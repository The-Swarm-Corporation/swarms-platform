'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
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
      <SelectTrigger className="w-full bg-white/80 dark:bg-zinc-950/80">
        <SelectValue
          placeholder={isLoading ? 'Loading...' : 'Select architecture'}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SequentialWorkflow">Sequential</SelectItem>
        <SelectItem value="ConcurrentWorkflow">Concurrent</SelectItem>
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

interface AgentSidebarProps {
  agents: Tables<'swarms_cloud_chat_agents'>[];
  swarmArchitecture: SwarmArchitecture;
  isLoadingAgents: boolean;
  isCreateAgent: boolean;
  isUpdateAgent: boolean;
  isToggleAgent: boolean;
  isDeleteAgent: boolean;
  openAgentModal: boolean;
  agentsRefetch: () => void;
  setOpenAgentModal: Dispatch<SetStateAction<boolean>>;
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

export function AgentSidebar({
  agents,
  swarmArchitecture,
  isCreateAgent,
  isUpdateAgent,
  openAgentModal,
  isLoadingAgents,
  setOpenAgentModal,
  onAddAgent,
  onUpdateAgent,
  agentsRefetch,
  isToggleAgent,
  isDeleteAgent,
  onRemoveAgent,
  onUpdateSwarmArchitecture,
  onToggleAgent,
}: AgentSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const isMobile = useIsMobile();

  const handleMobileExpand = () => {
    if (!isExpanded && isMobile) {
      setIsExpanded(true);
    }
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 280 : isMobile ? 20 : 64 }}
        onClick={handleMobileExpand}
        className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-sm border-l max-lg:absolute right-0 max-lg:z-10 border-red-600/20 flex flex-col"
      >
        <div
          className={cn(
            'border-b border-red-600/20 flex items-center justify-between lg:p-4',
            isMobile && isExpanded ? 'p-4' : '',
          )}
        >
          {isExpanded && <h2 className="text-red-500 font-bold">Agents</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-red-500"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 border-b border-red-600/20 relative"
            >
              <SwarmSelector
                value={swarmArchitecture}
                isLoading={isLoadingAgents}
                onValueChange={onUpdateSwarmArchitecture}
              />
              {isLoadingAgents && (
                <LoadingSpinner
                  size={15}
                  className="absolute right-7 top-7 bg-secondary"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {agents.map((agent) => {
              const editAgent = convertEditingAgent(agent);
              return (
                <motion.div
                  key={agent.id}
                  layout
                  className={`p-3 rounded-lg border transition-colors ${
                    agent.is_active
                      ? 'bg-white/80 dark:bg-zinc-950/80 border-red-600/50'
                      : 'bg-zinc-100/80 dark:bg-zinc-900/80 border-red-600/20'
                  }`}
                >
                  {isExpanded ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-red-500">
                          {agent?.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isToggleAgent || isDeleteAgent}
                                className="text-red-500/70 hover:text-red-500"
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
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
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
                                ? 'text-red-500'
                                : 'text-red-500/50'
                            }
                          >
                            {agent?.is_active ? 'Active' : 'Inactive'}{' '}
                            {isToggleAgent && (
                              <LoadingSpinner size={10} className="ml-1" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-red-500/70">
                        {getTruncatedString(agent?.description ?? '', 50)}
                      </p>
                      <div className="text-xs text-red-500/50">
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

        <div
          className={cn(
            'p-4 border-t border-red-600/20 pb-8 lg:block',
            isMobile && isExpanded ? 'block' : 'hidden',
          )}
        >
          <Sheet open={openAgentModal} onOpenChange={setOpenAgentModal}>
            <SheetTrigger asChild>
              <Button
                disabled={isCreateAgent || isUpdateAgent}
                className={`${isExpanded ? 'w-full' : 'w-auto'} bg-red-500 hover:bg-red-600 text-white`}
              >
                <Plus className="h-4 w-4" />
                {isExpanded && <span className="ml-2">Add Agent</span>}
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
                <AgentForm isLoading={isCreateAgent} onSubmit={onAddAgent} />
              </div>
            </SheetContent>
          </Sheet>
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
