'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import AddSwarmModal from './components/add-swarm-modal';
import { Input } from '@/shared/components/spread_sheet_swarm/ui/input';
import useModels from './hook/models';
import { explorerOptions } from '@/shared/constants/explorer';
import AddPromptModal from './components/add-prompt-modal';
import { Activity } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import AddAgentModal from './components/add-agent-modal';
import dynamic from 'next/dynamic';
import Sticky from 'react-stickynode';
import AddToolModal from './components/add-tool-modal';

const Prompts = dynamic(() => import('./components/content/prompts'), {
  ssr: false,
});
const Agents = dynamic(() => import('./components/content/agents'), {
  ssr: false,
});
const Tools = dynamic(() => import('./components/content/tools'), {
  ssr: false,
});
const Swarms = dynamic(() => import('./components/content/swarms'), {
  ssr: false,
});
const Explorer = () => {
  const reloadSwarmStatus = trpc.explorer.reloadSwarmStatus.useMutation();

  const [addSwarModalOpen, setAddSwarmModalOpen] = useState(false);
  const [addPromptModalOpen, setAddPromptModalOpen] = useState(false);
  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  const [addToolModalOpen, setAddToolModalOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const handleStateChange = (status: { status: number }) => {
    if (status.status === Sticky.STATUS_FIXED) {
      setIsFixed(true);
    } else {
      setIsFixed(false);
    }
  };

  const {
    allAgents,
    allPrompts,
    allTools,
    pendingSwarms,
    filteredModels,
    filteredSwarms,
    filteredPrompts,
    filteredAgents,
    filteredTools,
    loadMorePrompts,
    isFetchingPrompts,
    hasMorePrompts,
    search,
    options,
    filterOption,
    isDataLoading,
    isPromptLoading,
    isModelsLoading,
    isAgentsLoading,
    isSwarmsLoading,
    isToolsLoading,
    handleSearchChange,
    handleOptionChange,
  } = useModels();

  useEffect(() => {
    if (!pendingSwarms.isLoading && pendingSwarms.data) {
      pendingSwarms.data?.data?.forEach((swarm) => {
        reloadSwarmStatus.mutateAsync(swarm.id).then((res) => {
          if (res != swarm.status) {
            pendingSwarms.refetch();
          }
        });
      });
    }
  }, [pendingSwarms.isLoading]);
  const onAddSuccessfuly = () => {
    pendingSwarms.refetch();
  };

  const onAddPrompt = () => {
    allPrompts.refetch();
  };

  const onAddAgent = () => {
    allAgents.refetch();
  };

  const onAddTool = () => {
    allTools.refetch();
  };

  const elements = [
    {
      key: 'prompts',
      content: (
        <Prompts
          {...{
            filteredPrompts,
            setAddPromptModalOpen,
            loadMorePrompts,
            isFetchingPrompts,
            hasMorePrompts,
          }}
          isLoading={isPromptLoading}
        />
      ),
    },
    {
      key: 'agents',
      content: (
        <Agents
          {...{ filteredAgents, setAddAgentModalOpen }}
          isLoading={isAgentsLoading}
        />
      ),
    },
    {
      key: 'tools',
      content: (
        <Tools
          {...{ filteredTools, setAddToolModalOpen }}
          isLoading={isToolsLoading}
        />
      ),
    },
    {
      key: 'swarms',
      content: (
        <Swarms
          {...{
            isLoading: isSwarmsLoading,
            pendingSwarms,
            filteredSwarms,
            setAddSwarmModalOpen,
          }}
        />
      ),
    },
  ];

  // Rearrange elements based on filterOption
  const reorderedElements = elements.sort((a, b) => {
    if (a.key === filterOption) return -1;
    if (b.key === filterOption) return 1;
    return 0;
  });

  return (
    <>
      <AddSwarmModal
        onAddSuccessfuly={onAddSuccessfuly}
        isOpen={addSwarModalOpen}
        onClose={() => setAddSwarmModalOpen(false)}
      />
      <AddPromptModal
        onAddSuccessfully={onAddPrompt}
        isOpen={addPromptModalOpen}
        onClose={() => setAddPromptModalOpen(false)}
      />
      <AddAgentModal
        onAddSuccessfully={onAddAgent}
        isOpen={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
      />
      <AddToolModal
        onAddSuccessfully={onAddTool}
        isOpen={addToolModalOpen}
        onClose={() => setAddToolModalOpen(false)}
      />
      <div className="w-full flex flex-col h-full">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Explorer</h1>
          <span className="mt-4 text-muted-foreground">
            Share and Discover Prompts, Agents, and Swarms Within Your
            Organization or With The World.
          </span>
        </div>
        <Sticky
          enabled
          top={48}
          innerZ={10}
          onStateChange={handleStateChange}
          className={cn(
    'sticky-inner-list',
    isFixed && 'shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]'
  )}
          
        >
          <div className="mt-8 pb-4 bg-white dark:bg-black">
            <ul className="p-0 mb-2  flex items-center flex-wrap gap-3">
              {options.map((option) => {
                const colorSelector = isDataLoading
                  ? 'text-primary'
                  : filterOption === option || filterOption === 'all'
                    ? 'text-green-500'
                    : 'text-primary';
                return (
                  <li
                    key={option}
                    className={cn(
                      'shadow mt-2 cursor-pointer capitalize text-center rounded-sm flex items-center justify-center bg-secondary text-foreground w-24 p-1 px-2 text-xs md:text-sm',
                      colorSelector,
                    )}
                  >
                    {option}
                    <Activity
                      size={15}
                      className={cn('ml-2 font-bold', colorSelector)}
                    />
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search..."
                onChange={(e) => handleSearchChange(e.target.value)}
                value={search}
                disabled={isDataLoading}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              />

              <Select
                onValueChange={(value) => {
                  handleOptionChange(value);
                }}
                disabled={isDataLoading}
                value={filterOption}
              >
                <SelectTrigger className="w-1/2 xl:w-1/4 cursor-pointer">
                  <SelectValue placeholder={filterOption} />
                </SelectTrigger>
                <SelectContent>
                  {explorerOptions?.map((option) => (
                    <SelectItem key={option.label} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Sticky>
        <div
          className={cn(
            'flex flex-col h-full p-2',
            isFixed
              ? 'translate-y-[155px] md:translate-y-[125px] xl:translate-y-[120px]'
              : 'translate-y-0',
          )}
        >
          {reorderedElements.map(({ content }) => content)}
        </div>
      </div>
    </>
  );
};

export default Explorer;
