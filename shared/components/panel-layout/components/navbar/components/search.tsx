'use client';
import Link from 'next/link';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import LoadingSpinner from '@/shared/components/loading-spinner';
import Input from '@/shared/components/ui/Input';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import useToggle from '@/shared/hooks/toggle';
import { cn } from '@/shared/utils/cn';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';

export default function NavbarSearch() {
  const searchRef = useRef(null);
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [data, setData] = useState<
    Record<string, { title: string; link: string }[]>
  >({});
  const globalMutation = trpc.main.globalSearch.useMutation();
  const { isOn, setOn, setOff } = useToggle();

  // Prevents API calls for empty or short search terms
  const handleSearchChange = useCallback((value: string) => {
    if (value.length < 3) {
      // Clear the search results if the search term is too short
      setSearch(value);
      setData({});
      return;
    }
    debouncedSearch(value);
  }, []);

  const debouncedSearch = useMemo(() => {
    return debounce((value: string) => {
      setSearch(value);
      globalMutation
        .mutateAsync(value)
        .then((res) => {
          setData(res);
        })
        .catch((err: any) => {
          console.log(err);
          toast.toast({
            description: 'Something went wrong',
          });
        });
    }, 300); // Debounce with 300ms delay
  }, []);

  // Combined allData calculation in useMemo to minimize re-renders
  const allData = useMemo(() => Object.values(data).flat(), [data]);

  // Avoid unnecessary useEffect by handling everything in debounced search
  useOnClickOutside(searchRef, setOff);

  return (
    <div ref={searchRef} className="w-full relative ml-10 mt-2 sm:mt-0 lg:ml-0">
      <label hidden htmlFor="search">Search</label>
      <div className="relative">
        <Input
          placeholder="Search swarms and more..."
          id="search"
          aria-label="Search"
          onFocus={setOn}
          onChange={(e) => handleSearchChange(e.target.value)}
          value={search}
          className="w-full disabled:cursor-not-allowed disabled:opacity-50 text-white max-sm:text-xs pr-11"
        />
        <div
          className={cn(
            'absolute z-50 top-2/4 -translate-y-2/4 right-3 invisible text-white',
            globalMutation.isPending && 'visible',
          )}
        >
          <LoadingSpinner />
        </div>
      </div>

      {/* Render search results */}
      <div
        className={cn(
          'absolute z-40 w-full h-[calc(100vh - 100px)] invisible',
          isOn && 'visible',
          globalMutation.isPending && 'invisible',
        )}
      >
        <ul className="py-2 px-3 mt-1 h-[60vh] md:h-[65vh] no-scrollbar w-full overflow-y-auto bg-secondary text-foreground border dark:bg-black dark:text-white rounded-md shadow-lg">
          {allData.length > 0 ? (
            Object.keys(data).map(
              (key) =>
                data[key].length > 0 && (
                  <React.Fragment key={key}>
                    <li
                      className="p-2 py-5 h-7 flex mt-2 mb-3 first:mt-0 items-center text-base text-primary border-b-slate-900 border-b font-bold bg-black/90 rounded-md shadow-4xl"
                    >
                      {key}
                    </li>
                    {data[key].map((item) => (
                      <li
                        key={item.title}
                        className="transition-custom mb-2 text-sm cursor-pointer overflow-hidden shadow-4xl rounded-md hover:shadow-5xl hover:bg-red-500 hover:text-white flex items-center hover:scale-[1.02]"
                      >
                        {item.link ? (
                          <Link href={item.link} className="p-2 py-3 w-full">
                            {item.title}
                          </Link>
                        ) : (
                          <span className="p-2 py-3 w-full">{item.title}</span>
                        )}
                      </li>
                    ))}
                  </React.Fragment>
                ),
            )
          ) : (
            <p className="text-center py-4">No search result found</p>
          )}
        </ul>
      </div>
    </div>
  );
}
