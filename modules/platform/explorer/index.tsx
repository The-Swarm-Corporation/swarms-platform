'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import useModels from './hook/models';
import { defaultOptions, explorerCategories, explorerOptions } from '@/shared/utils/constants';
import AddPromptModal from './components/add-prompt-modal';
import { Activity, Search } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import AddAgentModal from './components/add-agent-modal';
import dynamic from 'next/dynamic';
import Sticky from 'react-stickynode';
import AddToolModal from './components/add-tool-modal';
import ModelCategories from './components/content/categories';
import MarketplaceStats from './components/content/marketplace-stats';
import Footer from '@/shared/components/ui/Footer';
import { MarketplaceTicker } from '@/shared/components/marketplace/ticker';
import MarketplaceOnboardingModal from '@/shared/components/marketplace/marketplace-onboarding-modal';

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
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    usersMap,
    reviewsMap,
    filterOption,
    isLoading,
    searchValue,
    loadMorePrompts,
    loadMoreTrending,
    searchClickHandler,
    handleSearchChange,
    handleOptionChange,
    handleCategoryChange,
    tagCategory,
    loadMoreAgents,
    isFetchingAgents,
    handleReset,
    refetch,
    hasMoreAgents,
    hasMoreTools,
    isFetchingTools,
    loadMoreTools,
    agentsQuery,
    toolsQuery,
    isDropdownOpen,
    setIsDropdownOpen,
  } = useModels();

  const selectedOptionLabel =
    !filterOption || filterOption === 'all' ? 'All Categories' : filterOption;

  const isAllLoading =
    isLoading ||
    promptsQuery.isLoading ||
    agentsQuery.isLoading ||
    toolsQuery.isLoading;

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
            isLoading,
            isPromptLoading: promptsQuery.isLoading,
          }}
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
            loadMoreAgents,
            isFetchingAgents,
            hasMoreAgents,
            isLoading,
            isAgentLoading: agentsQuery.isLoading,
          }}
        />
      ),
    },
    {
      key: 'tools',
      content: (
        <Tools
          {...{
            filteredTools,
            setAddToolModalOpen,
            usersMap,
            reviewsMap,
            isLoading,
            loadMoreTools,
            isFetchingTools,
            hasMoreTools,
            isToolLoading: toolsQuery.isLoading,
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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    // Check if user has seen the onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenMarketplaceOnboarding');
    if (!hasSeenOnboarding) {
      // Show the onboarding modal after a short delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <MarketplaceOnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      <AddPromptModal
        onAddSuccessfully={() => {}}
        modelType="prompt"
        isOpen={addPromptModalOpen}
        onClose={() => {
          setAddPromptModalOpen(false);
          refetch();
        }}
      />
      <AddAgentModal
        onAddSuccessfully={() => {}}
        modelType="agent"
        isOpen={addAgentModalOpen}
        onClose={() => {
          setAddAgentModalOpen(false);
          refetch();
        }}
      />
      <AddToolModal
        onAddSuccessfully={() => {}}
        modelType="tool"
        isOpen={addToolModalOpen}
        onClose={() => {
          setAddToolModalOpen(false);
          refetch();
        }}
      />
      <div className="w-full flex flex-col min-h-screen relative">
        <div className="flex-grow relative">
          <MarketplaceTicker />
          
          <div className="w-full mb-4 md:mb-8 mt-4">
            <div className="relative group">
              {/* Animated border overlay */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-900 to-red-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>

              {/* Main banner content */}
              <div className="relative w-full bg-gradient-to-r from-black to-red-950 p-4 md:p-8 rounded-lg">
                <div className="relative z-10">
                  <div className="flex flex-col gap-4 md:gap-8">
                    <div>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 md:mb-4 tracking-wider bg-clip-text">
                        Swarms Marketplace
                      </h1>
                      <p className="text-base md:text-xl text-red-100/80">
                        Search and discover tools, agents, and prompts.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.1)_0%,_transparent_70%)]"></div>
              </div>
            </div>
          </div>

          <div className={cn(
            'bg-white dark:bg-black sticky top-[48px] z-20 pb-2 md:pb-4 px-2 md:px-0',
            isFixed && 'shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]',
          )}>
            <ul className="p-0 mb-2 flex items-center justify-start flex-wrap gap-2 md:gap-3 mx-2 md:mx-0">
              {defaultOptions.map((option) => {
                const colorSelector = isAllLoading
                  ? 'text-primary'
                  : filterOption === option || filterOption === 'all'
                    ? 'text-green-500'
                    : 'text-primary';
                return (
                  <li
                    key={option}
                    onClick={() => !isAllLoading && handleOptionChange(option)}
                    className={cn(
                      'shadow mt-2 cursor-pointer capitalize text-center rounded-md flex items-center justify-center bg-secondary text-foreground min-w-[100px] sm:min-w-[120px] md:w-24 py-2 px-3 text-xs md:text-sm transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation',
                      colorSelector,
                      isAllLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/80'
                    )}
                  >
                    {option}
                    <Activity
                      size={16}
                      className={cn('ml-2 font-bold', colorSelector)}
                    />
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-2 md:px-0">
              <div className="relative w-full border border-gray-700 rounded-md">
                <Input
                  placeholder="Search..."
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchClickHandler();
                    }
                  }}
                  value={search}
                  disabled={isAllLoading}
                  className="disabled:cursor-not-allowed disabled:opacity-50 h-11 md:h-10 px-4 text-base md:text-sm"
                />
                <button
                  className={cn(
                    'border-none absolute right-0 h-full top-0 rounded-tr-md w-[60px] md:w-[50px] flex items-center justify-center rounded-br-md transition-all duration-200',
                    search.trim()
                      ? 'bg-primary/70 cursor-pointer hover:bg-primary active:bg-primary/90'
                      : 'bg-[#1e1e1e] cursor-default',
                  )}
                  onClick={searchClickHandler}
                >
                  <Search className="h-5 w-5 md:h-4 md:w-4 text-white" />
                </button>
              </div>

              <Select
                onValueChange={(value) => {
                  handleOptionChange(value);
                }}
                disabled={isAllLoading}
                value={filterOption}
              >
                <SelectTrigger className="w-full sm:w-1/2 xl:w-1/4 cursor-pointer h-11 md:h-10">
                  <SelectValue placeholder={filterOption} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {explorerOptions?.map((option) => (
                    <SelectItem 
                      key={option.label} 
                      value={option.value}
                      className="py-3 md:py-2"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-2 md:px-0 relative z-10">
            <ModelCategories
              categories={explorerCategories}
              isLoading={isLoading}
              onCategoryClick={handleCategoryChange}
              activeCategory={tagCategory}
            />
          </div>

          <div
            className={cn(
              'flex flex-col h-full p-2 md:p-4 space-y-6 md:space-y-4 relative z-0',
              isFixed
                ? 'translate-y-[185px] sm:translate-y-[165px] md:translate-y-[125px] xl:translate-y-[120px]'
                : 'translate-y-0',
            )}
          >
            {filterOption === 'all' && !searchValue && tagCategory === 'all' && (
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
              <div key={`${key}-${index}`} className="transition-all duration-300">
                {content}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-30">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Explorer;
