'use client';

import { useEffect, useState } from 'react';
import useModels from './hook/models';
import { explorerCategories, explorerOptions } from '@/shared/utils/constants';
import AddPromptModal from './components/add-prompt-modal';
import { Activity, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import AddAgentModal from './components/add-agent-modal';
import dynamic from 'next/dynamic';
import Sticky from 'react-stickynode';
import AddToolModal from './components/add-tool-modal';
import { useIsMobile } from '@/shared/hooks/use-mobile';

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

  const isMobile = useIsMobile();

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

  return (
    <>
      <AddPromptModal
        onAddSuccessfully={() => {}}
        modelType="prompt"
        isOpen={addPromptModalOpen}
        onClose={() => setAddPromptModalOpen(false)}
      />
      <AddAgentModal
        onAddSuccessfully={() => {}}
        modelType="agent"
        isOpen={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
      />
      <AddToolModal
        onAddSuccessfully={() => {}}
        modelType="tool"
        isOpen={addToolModalOpen}
        onClose={() => setAddToolModalOpen(false)}
      />
      <div className="w-full flex flex-col h-full font-mono">
        <div className="w-full mb-8 relative z-10">
          <div className="relative">
            <div
              className="bg-gradient-to-br from-red-900/30 via-background to-red-950/20 border-b-2 border-red-600/50 relative overflow-hidden"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse"></div>

              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-red-500 opacity-60"></div>
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-red-500 opacity-60"></div>

              <div className="container mx-auto px-8 pt-16 pb-8">
                <div className="mb-6">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold  tracking-wider mb-4">
                    <span className="bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
                      SWARMS
                    </span>
                    <br />
                    <span className="text-red-500 text-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                      MARKETPLACE
                    </span>
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {!isMobile ? (
            <Sticky onStateChange={handleStateChange} top={50} innerZ={50}>
              <div
                className={cn(
                  'relative bg-gradient-to-b from-background to-muted border-b border-red-600/30 py-8 transition-all duration-300',
                  isFixed &&
                    'shadow-lg shadow-primary/20 backdrop-blur-sm bg-background/95',
                )}
              >
                <div className="container mx-auto px-8">
                  <div className="mb-8">
                    <div className="relative max-w-4xl mx-auto">
                      <div className="relative">
                        <div className="relative bg-background border-2 border-red-600/70 rounded-lg group hover:border-red-500 transition-colors">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          <div className="flex items-center flex-wrap">
                            <div className="p-4 border-r border-red-600/50">
                              <Search
                                className={cn(
                                  'w-6 h-6',
                                  search.trim()
                                    ? 'text-red-400 cursor-pointer'
                                    : 'text-primary/50 cursor-default',
                                )}
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Enter search parameters..."
                              value={search}
                              onChange={handleSearchChange}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  searchClickHandler();
                                }
                              }}
                              disabled={isAllLoading}
                              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground p-4  focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                            />

                            <div className="relative">
                              <button
                                onClick={() =>
                                  setIsDropdownOpen(!isDropdownOpen)
                                }
                                disabled={isAllLoading}
                                className="flex items-center gap-2 p-4 border-l capitalize border-red-600/50 text-red-400 hover:text-red-300 transition-colors  disabled:pointer-events-none disabled:opacity-50"
                              >
                                <span>{selectedOptionLabel}</span>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                              </button>

                              {isDropdownOpen && (
                                <div className="absolute z-[9999] top-full right-0 mt-2 w-64 bg-background border-2 border-red-600/70 rounded-lg overflow-hidden">
                                  <div className="bg-gradient-to-r from-red-900 to-red-800 p-3 border-b border-red-600/50">
                                    <div className="text-red-200 text-xs  uppercase tracking-wider">
                                      Filter Categories
                                    </div>
                                  </div>
                                  <div className="max-h-64 overflow-y-auto">
                                    {explorerOptions?.map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          handleOptionChange(option.value);
                                          setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 text-left  text-sm transition-colors border-b border-red-600/20 last:border-b-0 ${
                                          filterOption === option.value
                                            ? 'bg-red-900/50 text-red-300'
                                            : 'text-foreground hover:bg-red-900/30 hover:text-red-400'
                                        }`}
                                      >
                                        <Activity className="w-4 h-4 text-primary" />
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="text-red-400 text-xs  uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Category Filters
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {explorerCategories.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryChange(category.value)}
                          className={`group relative overflow-hidden transition-all duration-300 ${
                            tagCategory === category.value
                              ? 'bg-gradient-to-r from-red-700 to-red-600 text-primary-foreground shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                              : 'bg-background border border-red-600/50 text-red-400 hover:border-red-500 hover:text-red-300'
                          }`}
                          style={{
                            clipPath:
                              tagCategory === category.value
                                ? 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                                : 'none',
                          }}
                        >
                          <div className="flex items-center gap-2 px-4 py-2  text-sm">
                            {category.icon}
                            {category.label}
                          </div>

                          {/* Hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Sticky>
          ) : (
            <div className="relative bg-gradient-to-b from-background to-muted border-b border-red-600/30 py-8">
              <div className="container mx-auto px-8">
                <div className="mb-8">
                  <div className="relative max-w-4xl mx-auto">
                    <div className="relative">
                      <div className="relative bg-background border-2 border-red-600/70 rounded-lg group hover:border-red-500 transition-colors">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex items-center flex-wrap">
                          <div className="p-4 border-r border-red-600/50">
                            <Search
                              className={cn(
                                'w-6 h-6',
                                search.trim()
                                  ? 'text-red-400 cursor-pointer'
                                  : 'text-primary/50 cursor-default',
                              )}
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Enter search parameters..."
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                searchClickHandler();
                              }
                            }}
                            disabled={isAllLoading}
                            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground p-4  focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                          />

                          <div className="relative">
                            <button
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              disabled={isAllLoading}
                              className="flex items-center gap-2 p-4 border-l capitalize border-red-600/50 text-red-400 hover:text-red-300 transition-colors  disabled:pointer-events-none disabled:opacity-50"
                            >
                              <span>{selectedOptionLabel}</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                              />
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute z-[9999] top-full right-0 mt-2 w-64 bg-background border-2 border-red-600/70 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-red-900 to-red-800 p-3 border-b border-red-600/50">
                                  <div className="text-red-200 text-xs  uppercase tracking-wider">
                                    Filter Categories
                                  </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                  {explorerOptions?.map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() => {
                                        handleOptionChange(option.value);
                                        setIsDropdownOpen(false);
                                      }}
                                      className={`w-full flex items-center gap-3 p-3 text-left  text-sm transition-colors border-b border-red-600/20 last:border-b-0 ${
                                        filterOption === option.value
                                          ? 'bg-red-900/50 text-red-300'
                                          : 'text-foreground hover:bg-red-900/30 hover:text-red-400'
                                      }`}
                                    >
                                      <Activity className="w-4 h-4 text-primary" />
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-red-400 text-xs  uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    Category Filters
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {explorerCategories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`group relative overflow-hidden transition-all duration-300 ${
                          tagCategory === category.value
                            ? 'bg-gradient-to-r from-red-700 to-red-600 text-primary-foreground shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                            : 'bg-background border border-red-600/50 text-red-400 hover:border-red-500 hover:text-red-300'
                        }`}
                        style={{
                          clipPath:
                            tagCategory === category.value
                              ? 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                              : 'none',
                        }}
                      >
                        <div className="flex items-center gap-2 px-4 py-2  text-sm">
                          {category.icon}
                          {category.label}
                        </div>

                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='flex flex-col p-2 pb-10'>
            {filterOption === 'all' &&
              !searchValue &&
              tagCategory === 'all' && (
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
      </div>
    </>
  );
};

export default Explorer;
