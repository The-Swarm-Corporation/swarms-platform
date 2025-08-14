import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { defaultOptions, explorerOptions } from '@/shared/utils/constants';
import { useSearchParams } from 'next/navigation';

const promptLimit = 6;
const trendingLimit = 6;
const agentLimit = 24;
const toolLimit = 6;

const updateList = (offset: number, setter: any, newData: any[]) => {
  if (offset === 0) {
    setter(newData);
  } else {
    setter((prev: any[]) => [...prev, ...newData]);
  }
};

export default function useModels() {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams?.get('category');
  const searchQuery = searchParams?.get('search');

  const [promptOffset, setPromptOffset] = useState(0);
  const [trendingOffset, setTrendingOffset] = useState(0);
  const [agentOffset, setAgentOffset] = useState(0);
  const [toolOffset, setToolOffset] = useState(0);

  const [prompts, setPrompts] = useState<any[]>([]);
  const [trendingModels, setTrendingModels] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [hasMorePrompts, setHasMorePrompts] = useState(true);
  const [hasMoreAgents, setHasMoreAgents] = useState(true);
  const [hasMoreTools, setHasMoreTools] = useState(true);
  const [totalAgents, setTotalAgents] = useState<number>(0);

  const [isFetchingPrompts, setIsFetchingPrompts] = useState(false);
  const [isFetchingTrending, setIsFetchingTrending] = useState(false);
  const [isFetchingAgents, setIsFetchingAgents] = useState(false);
  const [isFetchingTools, setIsFetchingTools] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [tagCategory, setTagCategory] = useState<string>('all');

  const { data, isLoading, refetch } = trpc.explorer.getExplorerData.useQuery(
    {
      limit: 6,
      offset: 0,
      search: searchQuery || searchValue,
      category: tagCategory,
    },
    { refetchOnWindowFocus: false },
  );

  const promptsQuery = trpc.explorer.getExplorerData.useQuery(
    {
      includeAgents: false,
      includeTools: false,
      limit: promptLimit,
      offset: promptOffset,
      search: searchQuery || searchValue,
      category: tagCategory,
    },
    { enabled: promptOffset > 0 },
  );

  const agentsQuery = trpc.explorer.getExplorerData.useQuery(
    {
      includePrompts: false,
      includeTools: false,
      limit: agentLimit,
      offset: agentOffset,
      search: searchQuery || searchValue,
      category: tagCategory,
    },
    { enabled: agentOffset > 0 },
  );

  const toolsQuery = trpc.explorer.getExplorerData.useQuery(
    {
      includePrompts: false,
      includeAgents: false,
      limit: toolLimit,
      offset: toolOffset,
      search: searchQuery || searchValue,
      category: tagCategory,
    },
    { enabled: toolOffset > 0 },
  );

  const trendingQuery = trpc.main.trending.useQuery(
    {
      limit: trendingLimit,
      offset: trendingOffset,
      search: '',
    },
    { enabled: trendingOffset < 12 },
  );

  const isTrendingLoading = trendingQuery.isLoading;
  const [filterOption, setFilterOption] = useState<string>(
    explorerOptions[0].value,
  );

  useEffect(() => {
    if (searchQuery && categoryQuery) {
      setSearchValue(searchQuery);
      setFilterOption(categoryQuery);
    }
  }, [searchQuery, categoryQuery]);

  useEffect(() => {
    if (data?.prompts) {
      setPrompts(data.prompts);
      setHasMorePrompts(data.prompts.length === promptLimit);
    }
    if (data?.agents) {
      setAgents(data.agents);
      // Store the total number of agents from the API response
      if (data.totalAgents !== undefined) {
        setTotalAgents(data.totalAgents);
      }
      // Check if there are more agents based on total count and current loaded amount
      setHasMoreAgents(data.agents.length < data.totalAgents);
    }
    if (data?.tools) {
      setTools(data.tools);
      setHasMoreTools(data.tools.length === toolLimit);
    }
  }, [data?.prompts, data?.agents, data?.tools, data?.totalAgents]);

  useEffect(() => {
    if (promptsQuery.data?.prompts) {
      updateList(promptOffset, setPrompts, promptsQuery.data.prompts);
      setIsFetchingPrompts(false);
      setHasMorePrompts(promptsQuery.data.prompts.length === promptLimit);
    }
    if (agentsQuery.data?.agents) {
      updateList(agentOffset, setAgents, agentsQuery.data.agents);
      setIsFetchingAgents(false);
      // Update total agents if provided in subsequent queries
      if (agentsQuery.data.totalAgents !== undefined) {
        setTotalAgents(agentsQuery.data.totalAgents);
      }
      // Check if there are more agents: current loaded count < total available
      const currentLoadedCount = agentOffset + agentsQuery.data.agents.length;
      setHasMoreAgents(currentLoadedCount < (agentsQuery.data.totalAgents || totalAgents));
    }
    if (toolsQuery.data?.tools) {
      updateList(toolOffset, setTools, toolsQuery.data.tools);
      setIsFetchingTools(false);
      setHasMoreTools(toolsQuery.data.tools.length === toolLimit);
    }
    if (trendingQuery.data?.data) {
      updateList(trendingOffset, setTrendingModels, trendingQuery.data.data);
      setIsFetchingTrending(false);
    }
  }, [
    promptsQuery.data?.prompts,
    agentsQuery.data?.agents,
    toolsQuery.data?.tools,
    trendingQuery.data?.data,
    promptOffset,
    agentOffset,
    toolOffset,
    trendingOffset,
  ]);

  const loadMorePrompts = useCallback(() => {
    setPromptOffset((prevOffset) => prevOffset + promptLimit);
    setIsFetchingPrompts(true);
  }, []);

  const loadMoreAgents = useCallback(() => {
    setAgentOffset((prevOffset) => prevOffset + agentLimit);
    setIsFetchingAgents(true);
  }, []);

  const loadMoreTools = useCallback(() => {
    setToolOffset((prevOffset) => prevOffset + toolLimit);
    setIsFetchingTools(true);
  }, []);

  const loadMoreTrending = useCallback(() => {
    if (trendingOffset + trendingLimit <= 12) {
      setTrendingOffset((prevOffset) => prevOffset + trendingLimit);
      setIsFetchingTrending(true);
    }
  }, [trendingOffset]);

  const debouncedSearch = useMemo(() => debounce(setSearch, 0), []);

  const resetExplorer = () => {
    setPromptOffset(0);
    setTrendingOffset(0);
    setAgentOffset(0);
    setToolOffset(0);
    setHasMorePrompts(true);
    setHasMoreAgents(true);
    setHasMoreTools(true);
    setTotalAgents(0);
  };

  const searchClickHandler = () => {
    if (!search.trim()) {
      setSearchValue('');
      return;
    }

    resetExplorer();
    setSearchValue(search);
  };

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
      if (e.target.value.trim() === '') {
        setSearchValue('');
      }
    },
    [debouncedSearch],
  );

  const handleCategoryChange = (category: string) => {
    setTagCategory(category);
    resetExplorer();
  };

  const handleReset = () => {
    resetExplorer();
    refetch();
  };

  const allItems = [
    ...(data?.prompts || []),
    ...(data?.agents || []),
    ...(data?.tools || []),
    ...(trendingModels || []),
  ];

  const userIds = Array.from(new Set(allItems.map((item) => item.user_id)));
  const modelIds = Array.from(new Set(allItems.map((item) => item.id)));

  const { data: users } = trpc.main.getUsersByIds.useQuery(
    { userIds },
    { enabled: userIds.length > 0 },
  );

  const { data: reviews } = trpc.explorer.getReviewsByIds.useQuery(
    { modelIds },
    { enabled: modelIds.length > 0 },
  );

  const usersMap = useMemo(() => {
    return users?.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [users]);

  const reviewsMap = useMemo(() => {
    return reviews?.reduce(
      (acc, review) => {
        if (review.model_id) {
          acc[review.model_id] = review;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [reviews]);

  const filterData = useCallback(
    (data: any, key: string) => {
      if (!data) return [];
      if (filterOption === 'all') {
        return data.filter(
          (item: any) =>
            item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.prompt?.toLowerCase().includes(searchValue.toLowerCase()),
        );
      }
      if (!searchValue || filterOption !== key) return data;
      return data.filter(
        (item: any) =>
          item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.prompt?.toLowerCase().includes(searchValue.toLowerCase()),
      );
    },
    [searchValue, filterOption],
  );

  const filteredPrompts = useMemo(
    () => filterData(prompts, 'prompts'),
    [prompts, filterData],
  );
  const filteredAgents = useMemo(
    () => filterData(agents, 'agents'),
    [agents, filterData],
  );
  const filteredTools = useMemo(
    () => filterData(tools, 'tools'),
    [tools, filterData],
  );

  const handleOptionChange = useCallback(
    (value: string) => {
      if (isLoading || promptsQuery.isLoading || trendingQuery.isLoading)
        return;

      setFilterOption(value);
    },
    [isLoading, promptsQuery.isLoading, trendingQuery.isLoading],
  );

  return {
    promptsQuery,
    filteredPrompts,
    filteredAgents,
    filteredTools,
    trendingModels,
    isTrendingLoading,
    search,
    searchValue,
    usersMap,
    reviewsMap,
    hasMorePrompts,
    hasMoreAgents,
    hasMoreTools,
    hasMoreTrending: trendingModels.length < 12,
    filterOption,
    isLoading,
    isFetchingPrompts,
    isFetchingTrending,
    isFetchingAgents,
    isFetchingTools,
    refetch,
    loadMorePrompts,
    loadMoreTrending,
    loadMoreAgents,
    loadMoreTools,
    searchClickHandler,
    handleSearchChange,
    handleOptionChange,
    handleCategoryChange,
    tagCategory,
    handleReset,
    agentsQuery,
    toolsQuery,
    isDropdownOpen,
    setIsDropdownOpen,
  };
}