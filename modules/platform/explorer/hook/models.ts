import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { defaultOptions, explorerOptions } from '@/shared/utils/constants';
import { useSearchParams } from 'next/navigation';
const promptLimit = 6;
const trendingLimit = 6;

export default function useModels() {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams?.get('category');
  const searchQuery = searchParams?.get('search');

  const [promptOffset, setPromptOffset] = useState(0);
  const [trendingOffset, setTrendingOffset] = useState(0);

  const [prompts, setPrompts] = useState<any[]>([]);
  const [trendingModels, setTrendingModels] = useState<any[]>([]);

  const [isFetchingPrompts, setIsFetchingPrompts] = useState(false);
  const [isFetchingTrending, setIsFetchingTrending] = useState(false);

  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [tagCategory, setTagCategory] = useState<string>('all');

  const { data: categoryTags, isLoading: isCategoryLoading } = trpc.explorer.getAgentTags.useQuery();

  const { data, isLoading, refetch } = trpc.explorer.getExplorerData.useQuery(
    {
      includeAgents: false,
      limit: 6,
      offset: 0,
      search: searchQuery || searchValue,
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
    },
    { enabled: promptOffset > 0 },
  );

  const agentsQuery = trpc.explorer.getExplorerData.useQuery(
    {
      includePrompts: false,
      includeTools: false,
      search: searchQuery || searchValue,
      category: tagCategory,
    },
    { refetchOnWindowFocus: false },
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
  const [options, setOptions] = useState(defaultOptions);
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
    }
  }, [data?.prompts]);

  useEffect(() => {
    if (promptsQuery.data?.prompts) {
      setPrompts((prev) => [...prev, ...promptsQuery.data.prompts]);
      setIsFetchingPrompts(false);
    }
  }, [promptsQuery.data?.prompts]);

  useEffect(() => {
    if (trendingQuery.data?.data) {
      setTrendingModels((prev) => [...prev, ...trendingQuery.data.data]);
      setIsFetchingTrending(false);
    }
  }, [trendingQuery.data?.data]);

  const loadMorePrompts = useCallback(() => {
    setPromptOffset((prevOffset) => prevOffset + promptLimit);
    setIsFetchingPrompts(true);
  }, []);

  const loadMoreTrending = useCallback(() => {
    if (trendingOffset + trendingLimit <= 12) {
      setTrendingOffset((prevOffset) => prevOffset + trendingLimit);
      setIsFetchingTrending(true);
    }
  }, [trendingOffset]);

  const debouncedSearch = useMemo(() => debounce(setSearch, 0), []);


  const searchClickHandler = () => {
    if (!search.trim()) {
      setSearchValue('');
      return;
    }

    setPromptOffset(0);
    setTrendingOffset(0);
    setSearchValue(search);
  }

  const handleSearchChange = useCallback(
    (value: string) => {
      debouncedSearch(value);
      if (value.trim() === '') {
        setSearchValue('');
      }
    },
    [debouncedSearch],
  );

  const handleCategoryChange = (category: string) => {
    setTagCategory(category);
  };

  const allItems = [
    ...(data?.prompts || []),
    ...(agentsQuery.data?.agents || []),
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
    () => filterData(agentsQuery.data?.agents, 'agents'),
    [agentsQuery.data?.agents, filterData],
  );
  const filteredTools = useMemo(
    () => filterData(data?.tools, 'tools'),
    [data?.tools, filterData],
  );

  const handleOptionChange = useCallback(
    (value: string) => {
      if (isLoading || promptsQuery.isLoading || trendingQuery.isLoading)
        return;

      setFilterOption(value);
    },
    [isLoading, promptsQuery.isLoading, trendingQuery.isLoading],
  );

  const filteredAgentsByCategory = useMemo(() => {
    if (!filteredAgents || tagCategory === 'all') return filteredAgents;

    return filteredAgents.filter((agent: any) => {
      if (!agent?.tags) return false;

      const tags = agent?.tags.split(',');
      return tags.some((tag: string) => {
        const trimmedTag = tag.trim();
        // Check if tag contains the selected category
        if (trimmedTag.toLowerCase().includes(tagCategory.toLowerCase())) {
          return true;
        }

        // Check for tags like "Finance Agents" when category is "Finance"
        const agentsMatch = trimmedTag.match(
          /^(.*?)\s+(?:Agents?|agents?|Swarm|swarm)$/i,
        );
        if (agentsMatch && agentsMatch[1]) {
          const category = agentsMatch[1].trim();
          return category.toLowerCase() === tagCategory.toLowerCase();
        }

        return false;
      });
    });
  }, [filteredAgents, tagCategory]);

  return {
    promptsQuery,
    filteredPrompts,
    filteredAgents: filteredAgentsByCategory,
    filteredTools,
    trendingModels,
    isTrendingLoading,
    search,
    searchValue,
    options,
    usersMap,
    reviewsMap,
    hasMorePrompts: prompts.length > promptOffset,
    hasMoreTrending: trendingModels.length < 12,
    filterOption,
    isLoading,
    isAgentsLoading: agentsQuery.isLoading,
    isFetchingPrompts,
    isFetchingTrending,
    refetch,
    loadMorePrompts,
    loadMoreTrending,
    searchClickHandler,
    handleSearchChange,
    handleOptionChange,
    handleCategoryChange,
    categories: categoryTags?.categories || [],
    tagCategory,
    isCategoryLoading,
  };
}
