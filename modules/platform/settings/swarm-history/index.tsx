'use client';

import React from 'react';
import useHistory from './hook';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '@/shared/components/loading-spinner';
import ClearAllFilters from './component/clear-filters';
import { cn } from '@/shared/utils/cn';

export default function SwarmHistory() {
  const {
    historyData,
    isFetching,
    sortBy,
    filterBy,
    isLoading,
    filterValue,
    filterProperty,
    currentPage,
    totalPages,
    isSelectedFilters,
    handleRoute,
    setSortBy,
    setFilterBy,
    setFilterProperty,
    setFilterValue,
    applyFilter,
    clearFilters,
    goToNextPage,
    goToPreviousPage,
  } = useHistory();

  const isDataLoading = isLoading || isFetching || historyData?.length === 0;

  const getFilterPlaceholder = () => {
    switch (filterProperty) {
      case 'id':
        return '5b8a4f3d-2c6e-4e92-bd16-1f8d7a5e9c3f';
      case 'content':
        return 'Filter by Content';
      case 'created_at':
        return 'mm/dd/yyyy hh:mm:ss';
      case 'updated_at':
        return 'mm/dd/yyyy hh:mm:ss';
      default:
        return 'Enter filter value...';
    }
  };

  const placeholder = getFilterPlaceholder();
  const isApplyDisabled =
    isDataLoading ||
    !filterProperty ||
    !filterValue ||
    filterProperty === 'undefined';

  return (
    <article className="w-full">
      <h2 className="text-3xl font-extrabold sm:text-4xl">Swarms History</h2>

      <div className="mt-8 pb-10">
        <div className="mt-6 flex space-x-4 w-full">
          <Select
            onValueChange={(value) => {
              setSortBy(value as 'created_at' | 'updated_at');
            }}
            disabled={isDataLoading}
            value={sortBy}
          >
            <SelectTrigger className="flex-1 cursor-pointer">
              <SelectValue placeholder={sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Sort by Created</SelectItem>
              <SelectItem value="updated_at">Sort by Updated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => {
              setFilterBy(value as 'all' | 'spreadsheet' | 'drag_and_drop');
            }}
            disabled={isDataLoading}
            value={filterBy}
          >
            <SelectTrigger className="flex-1 cursor-pointer">
              <SelectValue placeholder={filterBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
              <SelectItem value="drag_and_drop">Drag & Drop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Select
            onValueChange={(value) => {
              setFilterProperty(
                value as
                  | 'id'
                  | 'content'
                  | 'created_at'
                  | 'updated_at'
                  | 'undefined',
              );
            }}
            disabled={isDataLoading}
            value={filterProperty}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue
                placeholder={filterProperty || 'Select Filter Property'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undefined">
                Select a filter property
              </SelectItem>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="created_at">Created At</SelectItem>
              <SelectItem value="updated_at">Updated At</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder={placeholder}
            onChange={(e) => setFilterValue(e.target.value)}
            value={filterValue}
            disabled={isDataLoading || filterProperty === 'undefined'}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div
            onClick={applyFilter}
            role="button"
            aria-label="Apply filter"
            className={cn(
              'flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 lg:px-8 py-2 cursor-pointer',
              isApplyDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer ',
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilter();
              }
            }}
          >
            <span className="lg:hidden cursor-pointer">Filter</span>
            <span className="hidden lg:block cursor-pointer">Apply Filter</span>
          </div>
        </div>
        <ClearAllFilters
          isSelectedFilter={isSelectedFilters}
          className="pl-3 w-fit"
          clearAllFilters={clearFilters}
        />

        <div className="mt-10 mb-5 relative overflow-x-auto pb-5">
          <table className="min-w-full border-collapse border border-primary/40">
            <thead>
              <tr>
                <th className="border border-primary/40 p-4 text-left">ID</th>
                <th className="border border-primary/40 p-4 text-left">
                  Content
                </th>
                <th className="border border-primary/40 p-4 text-left">
                  Created At
                </th>
                <th className="border border-primary/40 p-4 text-left">
                  Updated At
                </th>
                <th className="border border-primary/40 p-4 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {historyData?.map((item) => (
                <tr
                  key={item?.id}
                  className="hover:bg-primary/40 cursor-pointer"
                  onClick={() => handleRoute(item)}
                >
                  <td className="border border-primary/40 px-4 py-6 text-xs font-mono">
                    {item?.id}
                  </td>
                  <td className="border border-primary/40 px-4 py-6 text-xs">
                    {item?.content}
                  </td>
                  <td className="border border-primary/40 px-4 py-6 text-xs">
                    {new Date(item?.created_at).toLocaleString('en-US')}
                  </td>
                  <td className="border border-primary/40 px-4 py-6 text-xs">
                    {new Date(item?.updated_at).toLocaleString('en-US')}
                  </td>
                  <td className="border border-primary/40 px-4 py-6 text-xs capitalize">
                    {item?.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            {isFetching && (
              <span className="text-sm font-mono">Fetching more data...</span>
            )}
          </div>
          {isLoading && (
            <div className="absolute h-full w-full inset-0 flex items-center justify-center bg-[#ffffff]/50 dark:bg-[#000000]/50">
              <LoadingSpinner />
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4 lg:space-x-8 items-center mt-4">
          <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
            <span className="hidden lg:block">Previous</span>
            <ChevronLeft className="lg:hidden" size={18} />
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="cursor-pointer"
          >
            <ChevronRight className="lg:hidden" size={18} />
            <span className="hidden lg:block">Next</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
