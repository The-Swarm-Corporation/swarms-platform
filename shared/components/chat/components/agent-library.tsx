import { useState, useEffect } from 'react';
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
import { Plus, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { trpc } from '@/shared/utils/trpc/trpc';
import { AgentForm } from './form';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { AgentTemplateWithStatus, SwarmConfig } from '../types';
import LoadingSpinner from '../../loading-spinner';

interface AgentLibraryProps {
  chatId: string;
  swarmConfig: SwarmConfig;
  agentsRefetch: () => void;
  swarmConfigRefetch: () => void;
}

export function AgentLibrary({
  chatId,
  swarmConfig,
  agentsRefetch,
  swarmConfigRefetch,
}: AgentLibraryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedAgent, setSelectedAgent] =
    useState<AgentTemplateWithStatus | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const agentTemplatesQuery = trpc.chatAgent.getAgentTemplatesForChat.useQuery(
    chatId,
    {
      enabled: !!chatId,
      refetchOnWindowFocus: false,
    },
  );

  const addAgentToChat = trpc.chatAgent.addAgentTemplateToChat.useMutation();
  const removeAgentFromChat = trpc.chatAgent.removeAgentFromChat.useMutation();
  const createAgentTemplate = trpc.chatAgent.createAgentTemplate.useMutation();
  const updateSwarmConfigMutation =
    trpc.swarmConfig.updateSwarmConfig.useMutation();

  const filteredAgents =
    agentTemplatesQuery.data?.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.system_prompt?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const isAgentToggle =
    removeAgentFromChat.isPending ||
    addAgentToChat.isPending ||
    updateSwarmConfigMutation.isPending;

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
        const data = await addAgentToChat.mutateAsync({
          templateId: agent.id,
          chatId,
          overrides: {
            is_active: true,
          },
        });

        if (
          data?.id &&
          swarmConfig?.agents?.some((a) => a?.agent_id !== data?.id)
        ) {
          const updatedAgentIds = [
            ...(swarmConfig?.agents?.map((a) => a.agent_id) || []),
            data.id,
          ];

          await updateSwarmConfigMutation.mutateAsync({
            chatId,
            architecture: swarmConfig?.architecture || 'ConcurrentWorkflow',
            agentIds: updatedAgentIds,
          });
        }

        toast({
          description: `${agent.name} added to chat`,
        });
      }
      agentTemplatesQuery.refetch();
      agentsRefetch();
      swarmConfigRefetch();
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
      setIsCreatingTemplate(true);
      await createAgentTemplate.mutateAsync({
        name: formData.name,
        description: formData.description,
        model: formData.model,
        temperature: formData.temperature,
        max_tokens: formData.maxTokens,
        system_prompt: formData.systemPrompt,
      });

      toast({
        description: 'Agent template created successfully',
      });

      agentTemplatesQuery.refetch();
      setIsCreatingTemplate(false);

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
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-primary/40 hover:bg-primary/70 text-white">
              <Plus className="w-4 h-4 mr-2" /> Create Agent
            </Button>
          </SheetTrigger>
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
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {agentTemplatesQuery.isLoading ? (
            <div className="flex justify-center p-4">Loading agents...</div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              {searchQuery ? 'No agents match your search' : 'No agents found'}
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                onClick={() => {
                  setSelectedAgent(agent as AgentTemplateWithStatus);
                  setIsDetailDialogOpen(true);
                }}
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
      </ScrollArea>

      {/* Agent Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
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
