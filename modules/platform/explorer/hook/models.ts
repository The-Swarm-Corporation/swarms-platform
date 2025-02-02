import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { defaultOptions, explorerOptions } from '@/shared/utils/constants';
import { useSearchParams } from 'next/navigation';

const promptLimit = 6;

export default function useModels() {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams?.get('category');
  const searchQuery = searchParams?.get('search');

  const [promptOffset, setPromptOffset] = useState(0);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isFetchingPrompts, setIsFetchingPrompts] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = trpc.explorer.getExplorerData.useQuery(
    {
      limit: 6,
      offset: 0,
      search: searchQuery || search,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const promptsQuery = trpc.explorer.getExplorerData.useQuery(
    {
      includeAgents: false,
      includeTools: false,
      limit: 6,
      offset: promptOffset,
      search: searchQuery || search,
    },
    {
      enabled: promptOffset > 0,
    },
  );

  const [options, setOptions] = useState(defaultOptions);
  const [filterOption, setFilterOption] = useState<string>(
    explorerOptions[0].value,
  );

  useEffect(() => {
    if (searchQuery && categoryQuery) {
      setSearch(searchQuery);
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

  const loadMorePrompts = useCallback(() => {
    setPromptOffset((prevOffset) => prevOffset + promptLimit);
    setIsFetchingPrompts(true);
  }, []);

  const debouncedSearch = useMemo(() => debounce(setSearch, 0), []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setPromptOffset(0);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // TODO: Add types
  const filterData = useCallback(
    (data: any, key: string) => {
      if (!data) return [];
      if (filterOption === 'all') {
        return data.filter(
          (item: any) =>
            item?.name?.toLowerCase().includes(search.toLowerCase()) ||
            item?.prompt?.toLowerCase().includes(search.toLowerCase()),
        );
      }
      if (!search || filterOption !== key) return data;
      return data.filter(
        (item: any) =>
          item?.name?.toLowerCase().includes(search.toLowerCase()) ||
          item?.prompt?.toLowerCase().includes(search.toLowerCase()),
      );
    },
    [search, filterOption],
  );

  const filteredPrompts = useMemo(
    () => filterData(prompts, 'prompts'),
    [prompts, filterData],
  );
  const filteredAgents = useMemo(
    () => filterData(data?.agents, 'agents'),
    [data?.agents, filterData],
  );
  const filteredTools = useMemo(
    () => filterData(data?.tools, 'tools'),
    [data?.tools, filterData],
  );

  const handleOptionChange = useCallback(
    (value: string) => {
      if (isLoading || promptsQuery.isLoading) return;

      setFilterOption(value);
    },
    [isLoading, promptsQuery.isLoading],
  );

  return {
    promptsQuery,
    filteredPrompts,
    filteredAgents,
    filteredTools,
    search,
    options,
    hasMorePrompts: prompts.length > promptOffset,
    filterOption,
    isLoading,
    isFetchingPrompts,
    refetch,
    loadMorePrompts,
    handleSearchChange,
    handleOptionChange,
  };
}
