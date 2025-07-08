import { trpc } from '@/shared/utils/trpc/trpc';
import { ArrowRight, Bot, Code, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';

// Skeleton component for loading state
const RecommendedItemSkeleton = () => (
  <div className={cn(
    "relative flex flex-col overflow-hidden",
    "rounded-2xl isolate",
    "bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900/50",
    "border border-zinc-200/50 dark:border-zinc-800/50",
    "animate-pulse"
  )}>
    <div className="flex flex-col flex-1 p-5 sm:p-6 lg:p-7">
      {/* Price Badge Skeleton */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-16 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
      </div>

      <div className="flex flex-col flex-1 relative">
        {/* Title Skeleton */}
        <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2.5" />

        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="w-20 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <div className="w-20 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Button Skeleton */}
        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="h-8 sm:h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  </div>
);

interface RecommendedItemsProps {
  currentId: string;
  type: 'prompt' | 'agent' | 'tool';
}

export default function RecommendedItems({ currentId, type }: RecommendedItemsProps) {
  const [offset, setOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [seenItems, setSeenItems] = useState<Set<string>>(new Set([currentId]));
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [itemsCache, setItemsCache] = useState<any[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  
  // New state for managing exit and entry animations
  const [exitingItems, setExitingItems] = useState<any[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'exit' | 'enter' | 'none'>('none');

  // Fetch data using the explorer endpoint
  const { data: explorerData, refetch } = trpc.explorer.getExplorerData.useQuery(
    {
      includePrompts: type === 'prompt',
      includeAgents: type === 'agent',
      includeTools: type === 'tool',
      limit: 20,
      offset: offset,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const processNewItems = useCallback((items: any[]) => {
    // Filter out items we've already seen
    const newItems = items.filter(item => !seenItems.has(item.id));

    // Take 3 random items from the new items
    const selectedItems = newItems
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Update seen items
    const newSeen = new Set(seenItems);
    selectedItems.forEach(item => newSeen.add(item.id));
    setSeenItems(newSeen);

    return selectedItems;
  }, [seenItems]);

  useEffect(() => {
    if (explorerData) {
      let items = [];
      if (type === 'prompt') items = explorerData.prompts;
      if (type === 'agent') items = explorerData.agents;
      if (type === 'tool') items = explorerData.tools;

      const selectedItems = processNewItems(items);

      if (selectedItems.length < 3) {
        setOffset(prev => prev + 20);
        return;
      }

      if (itemsCache.length === 0) {
        setCurrentItems(selectedItems);
        setItemsCache([selectedItems]);
      } else if (!isRefreshing) {
        // Add to cache if not refreshing (initial load)
        setItemsCache(prev => [...prev, selectedItems]);
      }
    }
  }, [explorerData, type, processNewItems]);

  const animateTransition = (newItems: any[], direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSlideDirection(direction);
    setAnimationPhase('exit');
    setExitingItems(currentItems);

    // First phase: exit animation
    setTimeout(() => {
      setCurrentItems(newItems);
      setAnimationPhase('enter');
      
      // Second phase: enter animation
      setTimeout(() => {
        setAnimationPhase('none');
        setIsAnimating(false);
        setExitingItems([]);
      }, 300); // Enter animation duration
    }, 300); // Exit animation duration
  };

  const handleNext = async () => {
    if (isAnimating || isRefreshing) return;

    const nextIndex = currentIndex + 1;
    
    // If we have cached items
    if (nextIndex < itemsCache.length) {
      setCurrentIndex(nextIndex);
      animateTransition(itemsCache[nextIndex], 'left');
    } else {
      // Fetch new items
      setIsRefreshing(true);
      setOffset(prev => prev + 20);
      const result = await refetch();
      
      if (result.data) {
        let items = [];
        if (type === 'prompt') items = result.data.prompts;
        if (type === 'agent') items = result.data.agents;
        if (type === 'tool') items = result.data.tools;

        const newItems = processNewItems(items);
        setItemsCache(prev => [...prev, newItems]);
        setCurrentIndex(nextIndex);
        animateTransition(newItems, 'left');
      }
      
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    if (isAnimating || currentIndex === 0) return;
    
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    animateTransition(itemsCache[prevIndex], 'right');
  };

  const canGoBack = currentIndex > 0 && !isAnimating && !isRefreshing;
  const canGoForward = !isAnimating && !isRefreshing;

  return (
    <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 bg-white dark:bg-zinc-950/50 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
            {type === 'prompt' ? (
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : type === 'agent' ? (
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Items You'd Like
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {type === 'prompt'
                ? 'Discover more interesting prompts from our collection'
                : type === 'agent'
                  ? 'Check out similar agents that match your interests'
                  : 'Check out similar tools that match your interests'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={!canGoBack}
            className={cn(
              "flex items-center gap-2 shrink-0 justify-center min-w-[100px]",
              "group transition-all duration-200",
              "hover:bg-purple-50 dark:hover:bg-purple-900/20",
              "hover:border-purple-500/50 dark:hover:border-purple-400/50",
              "active:scale-95",
              !canGoBack && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform duration-200",
              "text-purple-600 dark:text-purple-400",
              "group-hover:-translate-x-1"
            )} />
            <span className="relative z-10">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canGoForward}
            className={cn(
              "flex items-center gap-2 shrink-0 justify-center min-w-[100px]",
              "group transition-all duration-200",
              "hover:bg-purple-50 dark:hover:bg-purple-900/20",
              "hover:border-purple-500/50 dark:hover:border-purple-400/50",
              "active:scale-95",
              !canGoForward && "opacity-50 cursor-not-allowed",
              isRefreshing && "opacity-70"
            )}
          >
            <span className="relative z-10">Next</span>
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-200",
              "text-purple-600 dark:text-purple-400",
              "group-hover:translate-x-1"
            )} />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Exiting items layer */}
        {exitingItems.length > 0 && (
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
              "absolute inset-0 z-10",
              "transition-all duration-300 ease-in-out transform",
              slideDirection === 'left' 
                ? "-translate-x-[40px] opacity-0" 
                : "translate-x-[40px] opacity-0"
            )}
          >
            {exitingItems.map((item) => (
              <div key={`exiting-${item.id}`} className="pointer-events-none">
                {/* Render item content */}
                <Link
                  href={`/${type}/${item.id}`}
                  className={cn(
                    "group relative flex flex-col overflow-hidden",
                    "rounded-2xl isolate",
                    "bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900/50",
                    "border border-zinc-200/50 dark:border-zinc-800/50",
                    "transition-all duration-300 ease-out",
                    "scale-[0.98] opacity-90"
                  )}
                  onClick={(e) => e.preventDefault()}
                >
                  {/* Gradient overlay with responsive intensity */}
                  <div className={cn(
                    "absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100",
                    "bg-gradient-to-t from-purple-50/20 to-transparent dark:from-purple-900/10",
                    "transition-opacity duration-300 ease-out"
                  )} />
                  
                  <div className="flex flex-col flex-1 p-5 sm:p-6 lg:p-7">
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full",
                        "shadow-sm backdrop-blur-sm",
                        "border border-zinc-200/50 dark:border-zinc-700/50",
                        "transition-colors duration-300",
                        "group-hover:border-purple-200/50 dark:group-hover:border-purple-700/50",
                        item.is_free 
                          ? "bg-green-50/80 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-100 dark:border-green-800/50"
                          : "bg-blue-50/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-800/50"
                      )}>
                        {item.is_free ? 'Free' : `$${item.price_usd}`}
                      </span>
                    </div>

                    <div className="flex flex-col flex-1 relative">
                      <h3 className={cn(
                        "font-semibold text-base sm:text-lg lg:text-xl mb-2.5 pr-16",
                        "text-zinc-900 dark:text-white",
                        "line-clamp-2 leading-tight",
                        "transition-colors duration-300",
                        "group-hover:text-purple-900 dark:group-hover:text-purple-100"
                      )}>
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags?.split(',').slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className={cn(
                              "text-[0.6875rem] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full",
                              "bg-purple-50/50 dark:bg-purple-900/20",
                              "text-purple-700 dark:text-purple-300",
                              "border border-purple-100/50 dark:border-purple-800/50",
                              "transition-all duration-300",
                              "group-hover:bg-purple-100/50 dark:group-hover:bg-purple-800/30",
                              "group-hover:border-purple-200 dark:group-hover:border-purple-700",
                              "backdrop-blur-sm",
                              "truncate max-w-[130px] sm:max-w-[150px]"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className={cn(
                        "text-xs sm:text-sm lg:text-base",
                        "text-zinc-600 dark:text-zinc-400",
                        "line-clamp-3 mb-4 sm:mb-6",
                        "flex-1 leading-relaxed",
                        "transition-colors duration-300",
                        "group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                      )}>
                        {item.description}
                      </p>

                      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start",
                            "text-purple-600 dark:text-purple-400",
                            "hover:text-purple-700 dark:hover:text-purple-300",
                            "hover:bg-purple-50/50 dark:hover:bg-purple-900/20",
                            "transition-all duration-300",
                            "font-medium text-xs sm:text-sm",
                            "h-8 sm:h-9",
                            "opacity-80 group-hover:opacity-100"
                          )}
                        >
                          Learn More
                          <ArrowRight className={cn(
                            "ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4",
                            "transition-all duration-300",
                            "translate-x-0 group-hover:translate-x-1",
                            "opacity-60 group-hover:opacity-100"
                          )} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Current items layer */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
            "relative z-20",
            animationPhase !== 'none' && "transition-all duration-300 ease-out transform",
            animationPhase === 'enter' && slideDirection === 'left' && "translate-x-[40px] opacity-0",
            animationPhase === 'enter' && slideDirection === 'right' && "-translate-x-[40px] opacity-0",
            animationPhase === 'none' && "translate-x-0 opacity-100"
          )}
        >
          {isRefreshing ? (
            Array(3).fill(null).map((_, i) => (
              <RecommendedItemSkeleton key={`skeleton-${i}`} />
            ))
          ) : (
            currentItems.map((item) => (
              <Link
                key={item.id}
                href={`/${type}/${item.id}`}
                className={cn(
                  "group relative flex flex-col overflow-hidden",
                  "rounded-2xl isolate",
                  "bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900/50",
                  "border border-zinc-200/50 dark:border-zinc-800/50",
                  "transition-all duration-300 ease-out",
                  "hover:border-purple-200 dark:hover:border-purple-800/50",
                  "dark:bg-gradient-to-b dark:from-zinc-800/50 dark:to-zinc-900/50",
                  "shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
                  "hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
                  "hover:translate-y-[-2px]"
                )}
              >
                {/* Gradient overlay with responsive intensity */}
                <div className={cn(
                  "absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100",
                  "bg-gradient-to-t from-purple-50/20 to-transparent dark:from-purple-900/10",
                  "transition-opacity duration-300 ease-out"
                )} />
                
                <div className="flex flex-col flex-1 p-5 sm:p-6 lg:p-7">
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full",
                      "shadow-sm backdrop-blur-sm",
                      "border border-zinc-200/50 dark:border-zinc-700/50",
                      "transition-colors duration-300",
                      "group-hover:border-purple-200/50 dark:group-hover:border-purple-700/50",
                      item.is_free 
                        ? "bg-green-50/80 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-100 dark:border-green-800/50"
                        : "bg-blue-50/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-800/50"
                    )}>
                      {item.is_free ? 'Free' : `$${item.price_usd}`}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 relative">
                    <h3 className={cn(
                      "font-semibold text-base sm:text-lg lg:text-xl mb-2.5 pr-16",
                      "text-zinc-900 dark:text-white",
                      "line-clamp-2 leading-tight",
                      "transition-colors duration-300",
                      "group-hover:text-purple-900 dark:group-hover:text-purple-100"
                    )}>
                      {item.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags?.split(',').slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className={cn(
                            "text-[0.6875rem] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full",
                            "bg-purple-50/50 dark:bg-purple-900/20",
                            "text-purple-700 dark:text-purple-300",
                            "border border-purple-100/50 dark:border-purple-800/50",
                            "transition-all duration-300",
                            "group-hover:bg-purple-100/50 dark:group-hover:bg-purple-800/30",
                            "group-hover:border-purple-200 dark:group-hover:border-purple-700",
                            "backdrop-blur-sm",
                            "truncate max-w-[130px] sm:max-w-[150px]"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className={cn(
                      "text-xs sm:text-sm lg:text-base",
                      "text-zinc-600 dark:text-zinc-400",
                      "line-clamp-3 mb-4 sm:mb-6",
                      "flex-1 leading-relaxed",
                      "transition-colors duration-300",
                      "group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    )}>
                      {item.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start",
                          "text-purple-600 dark:text-purple-400",
                          "hover:text-purple-700 dark:hover:text-purple-300",
                          "hover:bg-purple-50/50 dark:hover:bg-purple-900/20",
                          "transition-all duration-300",
                          "font-medium text-xs sm:text-sm",
                          "h-8 sm:h-9",
                          "opacity-80 group-hover:opacity-100"
                        )}
                      >
                        Learn More
                        <ArrowRight className={cn(
                          "ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4",
                          "transition-all duration-300",
                          "translate-x-0 group-hover:translate-x-1",
                          "opacity-60 group-hover:opacity-100"
                        )} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
} 