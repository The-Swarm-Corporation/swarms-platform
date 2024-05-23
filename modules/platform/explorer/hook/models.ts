import { useCallback, useMemo, useState } from 'react';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { defaultOptions, explorerOptions } from '@/shared/constants/explorer';

export default function useModels() {
  const models = trpc.explorer.getModels.useQuery();
  const allSwarms = trpc.explorer.getAllApprovedSwarms.useQuery();

  const isDataLoading = models.isLoading && allSwarms.isLoading;

  const [options, setOptions] = useState(defaultOptions);
  const [search, setSearch] = useState('');
  const [filterOption, setFilterOption] = useState<string>(
    explorerOptions[explorerOptions.length - 1].value,
  );

  const debouncedSearch = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      setSearch(value);
    }, 100);
    return debouncedFn;
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const filteredModels = useMemo(() => {
    if (!models.data?.data) return [];
    return !search || filterOption === 'swarms'
      ? models.data.data
      : models.data.data.filter((model) =>
          model?.name?.toLowerCase().includes(search.toLowerCase()),
        );
  }, [models.data, filterOption, search]);

  const filteredSwarms = useMemo(() => {
    if (!allSwarms.data?.data) return [];
    return !search || filterOption === 'models'
      ? allSwarms.data.data
      : allSwarms.data.data.filter((swarm) =>
          swarm?.name?.toLowerCase().includes(search.toLowerCase()),
        );
  }, [allSwarms.data, filterOption, search]);

  const handleOptionChange = useCallback(
    (value: string) => {
      if (isDataLoading) return;
      setFilterOption(value);
      if (value === 'swarms' || value === 'models') {
        setOptions([value]);
      } else {
        const updatedOptions =
          options[0] === 'swarms' ? ['swarms', 'models'] : ['models', 'swarms'];
        setOptions(updatedOptions);
      }
    },
    [options, isDataLoading],
  );

  const handleRemoveOption = useCallback(
    (optionToRemove: string) => {
      let updatedOptions = [];
      if (isDataLoading) return;
      if (options.length === 1) {
        updatedOptions = optionToRemove === 'swarms' ? ['models'] : ['swarms'];
      } else {
        updatedOptions = options.filter((option) => option !== optionToRemove);
      }

      setOptions(updatedOptions);
      setFilterOption(
        updatedOptions.length === 1 ? updatedOptions[0] : 'swarms-and-models',
      );
    },
    [options, isDataLoading],
  );

  return {
    filteredModels,
    filteredSwarms,
    search,
    options,
    filterOption,
    isDataLoading,
    handleSearchChange,
    handleOptionChange,
    handleRemoveOption,
  };
}
