import { useCallback, useMemo, useState } from 'react';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { defaultOptions, explorerOptions } from '@/shared/constants/explorer';

export default function useModels() {
  const modelsQuery = trpc.explorer.getModels.useQuery();
  const swarmsQuery = trpc.explorer.getAllApprovedSwarms.useQuery();
  const promptsQuery = trpc.explorer.getAllPrompts.useQuery();

  const isDataLoading =
    modelsQuery.isLoading && swarmsQuery.isLoading && promptsQuery.isLoading;

  const [options, setOptions] = useState(defaultOptions);
  const [search, setSearch] = useState('');
  const [filterOption, setFilterOption] = useState<string>(
    explorerOptions[0].value,
  );

  const debouncedSearch = useMemo(() => debounce(setSearch, 100), []);

  const handleSearchChange = useCallback(
    (value: string) => {
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

  const filteredModels = useMemo(
    () => filterData(modelsQuery.data?.data, 'models'),
    [modelsQuery.data, filterData],
  );
  const filteredSwarms = useMemo(
    () => filterData(swarmsQuery.data?.data, 'swarms'),
    [swarmsQuery.data, filterData],
  );
  const filteredPrompts = useMemo(
    () => filterData(promptsQuery.data?.data, 'prompts'),
    [promptsQuery.data, filterData],
  );

  const handleOptionChange = useCallback(
    (value: string) => {
      if (isDataLoading) return;

      setFilterOption(value);
    },
    [isDataLoading],
  );

  const handleRemoveOption = useCallback(
    (optionToRemove: string) => {
      if (isDataLoading) return;
      const updatedOptionsSet = new Set(options);
      updatedOptionsSet.delete(optionToRemove);
      const updatedOptions = Array.from(updatedOptionsSet);
      setOptions(updatedOptions);
      setFilterOption(
        updatedOptions.length ? updatedOptions[0] : 'swarms-models-prompts',
      );
    },
    [options, isDataLoading],
  );

  return {
    filteredModels,
    filteredSwarms,
    filteredPrompts,
    search,
    options,
    filterOption,
    isDataLoading,
    handleSearchChange,
    handleOptionChange,
    handleRemoveOption,
  };
}
