import { trpc } from '@/shared/utils/trpc/trpc';
import { ArrowRight, Bot, Code, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import InfoCard from '@/modules/platform/explorer/components/info-card';

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
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [itemsCache, setItemsCache] = useState<any[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  // New state for managing exit and entry animations
  const [exitingItems, setExitingItems] = useState<any[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'exit' | 'enter' | 'none'>('none');

  const seenItemsRef = useRef<Set<string>>(new Set([currentId]));
  const itemsCacheRef = useRef<any[][]>([]);

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

  // Build users/reviews maps for visible items (current + exiting), so InfoCard can show author/rating
  const visibleItems = useMemo(() => [...currentItems, ...exitingItems], [currentItems, exitingItems]);
  const userIds = useMemo(
    () => Array.from(new Set(visibleItems.map((item) => item.user_id).filter(Boolean))),
    [visibleItems]
  );
  const modelIds = useMemo(
    () => Array.from(new Set(visibleItems.map((item) => item.id).filter(Boolean))),
    [visibleItems]
  );

  const { data: users } = trpc.main.getUsersByIds.useQuery(
    { userIds },
    { enabled: userIds.length > 0 }
  );
  const { data: reviews } = trpc.explorer.getReviewsByIds.useQuery(
    { modelIds },
    { enabled: modelIds.length > 0 }
  );

  const usersMap = useMemo(() => {
    return (users || []).reduce((acc: Record<string, any>, user: any) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, any>);
  }, [users]);

  const reviewsMap = useMemo(() => {
    return (reviews || []).reduce((acc: Record<string, any>, review: any) => {
      if (review.model_id) acc[review.model_id] = review;
      return acc;
    }, {} as Record<string, any>);
  }, [reviews]);

  useEffect(() => {
    if (explorerData) {
      let items = [];
      if (type === 'prompt') items = explorerData.prompts;
      if (type === 'agent') items = explorerData.agents;
      if (type === 'tool') items = explorerData.tools;

      const newItems = items.filter(item => !seenItemsRef.current.has(item.id));
      const selectedItems = newItems
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);

      if (selectedItems.length === 0 && itemsCacheRef.current.length === 0 && offset < 100) {
        setOffset(prev => prev + 20);
        return;
      }

      // If we have some items (even if less than 6), use them
      if (selectedItems.length > 0) {
        selectedItems.forEach(item => seenItemsRef.current.add(item.id));

        if (itemsCacheRef.current.length === 0) {
          setCurrentItems(selectedItems);
          setItemsCache([selectedItems]);
          itemsCacheRef.current = [selectedItems];
        } else if (!isRefreshing) {
          setItemsCache(prev => {
            const newCache = [...prev, selectedItems];
            itemsCacheRef.current = newCache;
            return newCache;
          });
        }
      }
    }
  }, [explorerData, type, offset, isRefreshing]);

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

        const newItems = items.filter(item => !seenItemsRef.current.has(item.id));
        const selectedItems = newItems
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);

        selectedItems.forEach(item => seenItemsRef.current.add(item.id));

        setItemsCache(prev => {
          const newCache = [...prev, selectedItems];
          itemsCacheRef.current = newCache;
          return newCache;
        });
        setCurrentIndex(nextIndex);
        animateTransition(selectedItems, 'left');
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
              Items You&apos;d Like
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
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
              "absolute inset-0 z-10",
              "transition-all duration-300 ease-in-out transform",
              slideDirection === 'left' 
                ? "-translate-x-[40px] opacity-0" 
                : "translate-x-[40px] opacity-0"
            )}
          >
            {exitingItems.map((item) => (
              <div key={`exiting-${item.id}`} className="pointer-events-none">
                <InfoCard
                  id={item.id}
                  title={item.name || ''}
                  description={item.description || ''}
                  icon={type === 'prompt' ? <FileText /> : type === 'agent' ? <Bot /> : <Code />}
                  className="w-full h-full"
                  imageUrl={item.image_url || ''}
                  link={`/${type}/${item.id}`}
                  userId={item.user_id}
                  usersMap={usersMap}
                  reviewsMap={reviewsMap}
                  is_free={item.is_free}
                  price_usd={item.price_usd}
                  seller_wallet_address={item.seller_wallet_address}
                  usecases={item?.usecases}
                  requirements={item?.requirements}
                  tags={item?.tags?.split(',') || []}
                  itemType={type}
                />
              </div>
            ))}
          </div>
        )}

        {/* Current items layer */}
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
            "relative z-20",
            animationPhase !== 'none' && "transition-all duration-300 ease-out transform",
            animationPhase === 'enter' && slideDirection === 'left' && "translate-x-[40px] opacity-0",
            animationPhase === 'enter' && slideDirection === 'right' && "-translate-x-[40px] opacity-0",
            animationPhase === 'none' && "translate-x-0 opacity-100"
          )}
        >
          {isRefreshing ? (
            Array(6).fill(null).map((_, i) => (
              <RecommendedItemSkeleton key={`skeleton-${i}`} />
            ))
          ) : (
            currentItems.map((item) => (
              <InfoCard
                key={item.id}
                id={item.id}
                title={item.name || ''}
                description={item.description || ''}
                icon={type === 'prompt' ? <FileText /> : type === 'agent' ? <Bot /> : <Code />}
                className="w-full h-full"
                imageUrl={item.image_url || ''}
                link={`/${type}/${item.id}`}
                userId={item.user_id}
                usersMap={usersMap}
                reviewsMap={reviewsMap}
                is_free={item.is_free}
                price_usd={item.price_usd}
                seller_wallet_address={item.seller_wallet_address}
                usecases={item?.usecases}
                requirements={item?.requirements}
                tags={item?.tags?.split(',') || []}
                itemType={type}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
} 