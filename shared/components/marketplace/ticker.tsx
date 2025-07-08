'use client';

import { useEffect, useRef } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import Link from 'next/link';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export function MarketplaceTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: trendingData } = trpc.main.trending.useQuery(
    {
      limit: 20,
      offset: 0,
      search: '',
    },
    {
      staleTime: 30000, // Refresh every 30 seconds
      refetchInterval: 30000,
    }
  );

  useEffect(() => {
    if (!scrollRef.current || !trendingData?.data?.length) return;

    const scrollContainer = scrollRef.current;
    const scrollWidth = scrollContainer.scrollWidth;
    const viewportWidth = scrollContainer.offsetWidth;
    let currentScroll = 0;

    const scroll = () => {
      currentScroll += 2; // Increased speed (2px per frame instead of 1px)
      if (currentScroll >= scrollWidth / 2) {
        currentScroll = 0;
      }
      scrollContainer.style.transform = `translateX(-${currentScroll}px)`;
      requestAnimationFrame(scroll);
    };

    requestAnimationFrame(scroll);
  }, [trendingData?.data?.length]);

  if (!trendingData?.data?.length) {
    return null;
  }

  // Duplicate the items to create a seamless loop
  const items = [...trendingData.data, ...trendingData.data];

  return (
    <div className="w-full bg-black border-y border-red-800">
      <div className="container mx-auto">
        <div className="flex items-center h-12 overflow-hidden relative">
          {/* Trending Icon */}

          {/* Scrolling Content */}
          <div className="flex-1 overflow-hidden ml-4">
            <div 
              ref={scrollRef}
              className="flex items-center space-x-8 text-sm text-white whitespace-nowrap"
              style={{ willChange: 'transform' }}
            >
              {items.map((item, index) => {
                const isPositive = item.averageRating > 3.5; // Use actual rating to determine arrow
                return (
                  <Link 
                    href={item.link} 
                    key={`${item.id}-${index}`}
                    className="flex items-center space-x-2 group flex-shrink-0"
                  >
                    <span className="text-gray-400 uppercase text-xs">{item.type}</span>
                    <span className="text-white group-hover:text-red-400 transition-colors">
                      {item.name}
                    </span>
                    <div className={cn(
                      "flex items-center",
                      isPositive ? "text-green-500" : "text-red-500"
                    )}>
                      {isPositive ? (
                        <ArrowUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                      )}
                      <span className="ml-1">{item.averageRating.toFixed(1)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 