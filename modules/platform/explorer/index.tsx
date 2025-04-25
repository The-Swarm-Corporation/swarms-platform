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
import { Activity, Search } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import AddAgentModal from './components/add-agent-modal';
import dynamic from 'next/dynamic';
import Sticky from 'react-stickynode';
import AddToolModal from './components/add-tool-modal';

// Add the animation keyframes to your global styles or tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
document.head.appendChild(style);

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
    isAgentsLoading,
    hasMoreTrending,
    hasMorePrompts,
    search,
    options,
    usersMap,
    reviewsMap,
    filterOption,
    isLoading,
    searchValue,
    refetch,
    loadMorePrompts,
    loadMoreTrending,
    searchClickHandler,
    handleSearchChange,
    handleOptionChange,
    handleCategoryChange,
    categories,
    tagCategory,
    isCategoryLoading,
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
          {...{
            filteredAgents,
            setAddAgentModalOpen,
            usersMap,
            reviewsMap,
            handleCategoryChange,
            categories,
            tagCategory,
            isCategoryLoading,
          }}
          isLoading={isAgentsLoading}
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
        <div className="w-full mb-8">
          <div className="relative group">
            {/* Animated border overlay */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-900 to-red-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>

            {/* Main banner content */}
            <div className="relative w-full bg-gradient-to-r from-black to-red-950 p-8 rounded-lg">
              <div className="relative z-10">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-wider bg-clip-text">
                  Swarms Marketplace
                </h1>
                <p className="text-xl text-red-100/80">
                  Search and discover tools, agents, and prompts.
                </p>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.1)_0%,_transparent_70%)]"></div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'bg-white dark:bg-black sticky top-[48px] z-10 pb-4',
            isFixed &&
              'shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]',
          )}
        >
          <ul className="p-0 mb-2 flex items-center flex-wrap gap-3">
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
            <div className="relative w-full">
              <Input
                placeholder="Search..."
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchClickHandler();
                  }
                }}
                value={search}
                disabled={isAllLoading}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                className={cn(
                  'border-none absolute right-0 h-full top-0 rounded-tr-md w-[50px] flex items-center justify-center rounded-br-md',
                  search.trim()
                    ? 'bg-primary/70 cursor-pointer'
                    : 'bg-[#1e1e1e] cursor-default',
                )}
                onClick={searchClickHandler}
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>

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

        <div
          className={cn(
            'flex flex-col h-full p-2',
            isFixed
              ? 'translate-y-[155px] md:translate-y-[125px] xl:translate-y-[120px]'
              : 'translate-y-0',
          )}
        >
          {filterOption === 'all' && !searchValue && (
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
