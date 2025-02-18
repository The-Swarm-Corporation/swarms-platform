'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
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

interface SwarmSelectorProps {
  value: SwarmArchitecture;
  onValueChange: (value: SwarmArchitecture) => void;
}

function SwarmSelector({ value, onValueChange }: SwarmSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white/80 dark:bg-zinc-950/80">
        <SelectValue placeholder="Select architecture" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sequential">Sequential</SelectItem>
        <SelectItem value="concurrent">Concurrent</SelectItem>
        <SelectItem value="hierarchical">Hierarchical</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface AgentSidebarProps {
  agents: Agent[];
  swarmArchitecture: SwarmArchitecture;
  onAddAgent: (agent: Omit<Agent, 'id' | 'isActive'>) => void;
  onUpdateAgent: (id: string, updates: Partial<Agent>) => void;
  onRemoveAgent: (id: string) => void;
  onUpdateSwarmArchitecture: (architecture: SwarmArchitecture) => void;
  onToggleAgent: (id: string) => void;
}

export function AgentSidebar({
  agents,
  swarmArchitecture,
  onAddAgent,
  onUpdateAgent,
  onRemoveAgent,
  onUpdateSwarmArchitecture,
  onToggleAgent,
}: AgentSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 320 : 64 }}
        className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-sm border-r border-red-600/20 flex flex-col"
      >
        <div className="p-4 border-b border-red-600/20 flex items-center justify-between">
          {isExpanded && <h2 className="text-red-500 font-bold">Agents</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-red-500"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 border-b border-red-600/20"
            >
              <SwarmSelector
                value={swarmArchitecture}
                onValueChange={onUpdateSwarmArchitecture}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                layout
                className={`p-3 rounded-lg border transition-colors ${
                  agent.isActive
                    ? 'bg-white/80 dark:bg-zinc-950/80 border-red-600/50'
                    : 'bg-zinc-100/80 dark:bg-zinc-900/80 border-red-600/20'
                }`}
              >
                {isExpanded ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-red-500">{agent.name}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAgent(agent)}
                          className="text-red-500/70 hover:text-red-500"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleAgent(agent.id)}
                          className={
                            agent.isActive ? 'text-red-500' : 'text-red-500/50'
                          }
                        >
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-red-500/70">
                      {agent.description}
                    </p>
                    <div className="text-xs text-red-500/50">
                      Model: {agent.model}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div
                      className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-red-500' : 'bg-red-500/30'}`}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-red-600/20">
          <Sheet>
            <SheetTrigger asChild>
              <Button
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
                <AgentForm onSubmit={onAddAgent} />
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
                onSubmit={(updates) => {
                  onUpdateAgent(editingAgent.id, updates);
                  setEditingAgent(null);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
