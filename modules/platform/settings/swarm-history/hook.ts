import { trpc } from '@/shared/utils/trpc/trpc';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';

const historyLimit = 20;

export default function useHistory() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at'>(
    'created_at',
  );
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [filterBy, setFilterBy] = useState<
    'all' | 'spreadsheet' | 'drag_and_drop'
  >('all');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filterProperty, setFilterProperty] = useState<
    'id' | 'content' | 'created_at' | 'updated_at' | 'undefined'
  >('undefined');
  const [filterValue, setFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilterProperty, setActiveFilterProperty] = useState<
    'id' | 'content' | 'created_at' | 'updated_at' | 'undefined'
  >('undefined');
  const [activeFilterValue, setActiveFilterValue] = useState('');

  const fetchHistory = trpc.main.getAllHistory.useQuery(
    {
      limit: historyLimit,
      offset,
      sortBy,
      filterBy,
      search: search,
      filterProperty: activeFilterProperty,
      filterValue: activeFilterValue,
    },
    { enabled: offset >= 0, refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (fetchHistory.data) {
      setHistoryData(fetchHistory.data.results);
      setTotalPages(fetchHistory.data.totalPages);
      setIsFetching(false);
    }
  }, [fetchHistory.data]);

  const isSelectedFilters = useMemo(
    () =>
      filterBy !== 'all' ||
      (filterProperty && filterProperty !== 'undefined') ||
      !!filterValue ||
      (activeFilterProperty && activeFilterProperty !== 'undefined') ||
      !!activeFilterValue,
    [
      filterBy,
      filterProperty,
      filterValue,
      activeFilterProperty,
      activeFilterValue,
    ],
  );

  const handleRoute = (item: any) => {
    if (item?.type === 'spreadsheet') {
      router.push(`/platform/spreadsheet?session=${item.id}`);
    } else if (item?.type === 'drag_and_drop') {
      router.push(`/platform/dragndrop?flowId=${item.id}`);
    }
  };

  const applyFilter = useCallback(() => {
    if (historyData.length === 0) {
      console.warn('No history data available. Filtering is disabled.');
      return;
    }

    if (!filterProperty || filterProperty === 'undefined' || !filterValue)
      return;

    setOffset(0);
    setCurrentPage(1);
    setActiveFilterProperty(filterProperty);
    setActiveFilterValue(filterValue);
    fetchHistory.refetch();
  }, [filterProperty, filterValue, fetchHistory]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      setOffset((prev) => prev + historyLimit);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setOffset((prev) => prev - historyLimit);
    }
  };

  const clearFilters = useCallback(() => {
    setFilterProperty('undefined');
    setFilterValue('');
    setFilterBy('all');
    setOffset(0);
    setCurrentPage(1);
    setActiveFilterProperty('undefined');
    setActiveFilterValue('');
    fetchHistory.refetch();
  }, [fetchHistory]);

  return {
    historyData,
    isFetching,
    search,
    sortBy,
    filterBy,
    currentPage,
    totalPages,
    filterProperty,
    filterValue,
    isSelectedFilters,
    isLoading: fetchHistory.isLoading,
    handleRoute,
    setSortBy,
    setFilterBy,
    setFilterProperty,
    goToNextPage,
    goToPreviousPage,
    setFilterValue,
    applyFilter,
    clearFilters,
    setCurrentPage,
  };
}
