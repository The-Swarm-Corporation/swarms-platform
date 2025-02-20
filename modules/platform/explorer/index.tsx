'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import useModels from './hook/models';
import { explorerOptions } from '@/shared/utils/constants';
import AddPromptModal from './components/add-prompt-modal';
import { Activity } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import AddAgentModal from './components/add-agent-modal';
import dynamic from 'next/dynamic';
import Sticky from 'react-stickynode';
import AddToolModal from './components/add-tool-modal';

const Trending = dynamic(() => import('./components/content/trending'), {
  ssr: false,
});
const Prompts = dynamic(() => import('./components/content/prompts'), {
  ssr: false,
});
const Agents = dynamic(() => import('./components/content/agents'), {
  ssr: false,
});
const Tools = dynamic(() => import('./components/content/tools'), {
  ssr: false,
});
const Explorer = () => {
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
    filteredPrompts,
    filteredAgents,
    filteredTools,
    trendingModels,
    promptsQuery,
    isFetchingTrending,
    isFetchingPrompts,
    isTrendingLoading,
    hasMoreTrending,
    hasMorePrompts,
    search,
    options,
    usersMap,
    reviewsMap,
    filterOption,
    isLoading,
    refetch,
    loadMorePrompts,
    loadMoreTrending,
    handleSearchChange,
    handleOptionChange,
  } = useModels();

  const isAllLoading = isLoading || promptsQuery.isLoading;

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
            usersMap,
            reviewsMap,
          }}
          isLoading={isAllLoading}
        />
      ),
    },
    {
      key: 'agents',
      content: (
        <Agents
          {...{ filteredAgents, setAddAgentModalOpen, usersMap, reviewsMap }}
          isLoading={isLoading}
        />
      ),
    },
    {
      key: 'tools',
      content: (
        <Tools
          {...{ filteredTools, setAddToolModalOpen, usersMap, reviewsMap }}
          isLoading={isLoading}
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
      <AddPromptModal
        onAddSuccessfully={() => promptsQuery.refetch()}
        isOpen={addPromptModalOpen}
        onClose={() => setAddPromptModalOpen(false)}
      />
      <AddAgentModal
        onAddSuccessfully={refetch}
        isOpen={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
      />
      <AddToolModal
        onAddSuccessfully={refetch}
        isOpen={addToolModalOpen}
        onClose={() => setAddToolModalOpen(false)}
      />
      <div className="w-full flex flex-col h-full">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Marketplace</h1>
          <span className="mt-4 text-muted-foreground">
            Search and discover tools, agents, and prompts.
          </span>
        </div>
        <Sticky
          enabled
          top={48}
          innerZ={10}
          onStateChange={handleStateChange}
          className={cn(
            'sticky-inner-list',
            isFixed &&
              'shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]',
          )}
        >
          <div className="mt-8 pb-4 bg-white dark:bg-black">
            <ul className="p-0 mb-2  flex items-center flex-wrap gap-3">
              {options.map((option) => {
                const colorSelector = isAllLoading
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
                disabled={isAllLoading}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              />

              <Select
                onValueChange={(value) => {
                  handleOptionChange(value);
                }}
                disabled={isAllLoading}
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
          {filterOption === 'all' && !search && (
            <Trending
              {...{
                trendingModels,
                isFetchingTrending,
                loadMoreTrending,
                hasMoreTrending,
                usersMap,
                reviewsMap,
              }}
              isLoading={isTrendingLoading}
            />
          )}
          {reorderedElements.map(({ key, content }, index) => (
            <div key={`${key}-${index}`}>{content}</div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Explorer;
