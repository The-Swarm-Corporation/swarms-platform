import { trpc } from '@/shared/utils/trpc/trpc';
import { ArrowRight, Bot, Code, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { makeUrl } from '@/shared/utils/helpers';
import { PUBLIC } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';

interface RecommendedItemsProps {
  currentId: string;
  type: 'prompt' | 'agent' | 'tool';
}

export default function RecommendedItems({ currentId, type }: RecommendedItemsProps) {
  const [offset, setOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [seenItems, setSeenItems] = useState<Set<string>>(new Set([currentId]));
  const [currentItems, setCurrentItems] = useState<any[]>([]);

  // Fetch data using the explorer endpoint
  const { data: explorerData, refetch } = trpc.explorer.getExplorerData.useQuery(
    {
      includePrompts: type === 'prompt',
      includeAgents: type === 'agent',
      includeTools: type === 'tool',
      limit: 20, // Fetch more to ensure we have enough unique items
      offset: offset,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (explorerData) {
      let items = [];
      if (type === 'prompt') items = explorerData.prompts;
      if (type === 'agent') items = explorerData.agents;
      if (type === 'tool') items = explorerData.tools;

      // Filter out items we've already seen
      const newItems = items.filter(item => !seenItems.has(item.id));

      // If we have less than 3 new items and there are more items available,
      // increment offset and fetch more
      if (newItems.length < 3) {
        setOffset(prev => prev + 20);
        return;
      }

      // Take 3 random items from the new items
      const selectedItems = newItems
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Update seen items
      const newSeen = new Set(seenItems);
      selectedItems.forEach(item => newSeen.add(item.id));
      setSeenItems(newSeen);

      // Update current items
      setCurrentItems(selectedItems);
    }
  }, [explorerData, type]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setOffset(prev => prev + 20);
    await refetch();
    setIsRefreshing(false);
  };

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Explore More
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
          <Link
            key={item.id}
            href={`/${type}/${item.id}`}
            className="group flex flex-col relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-500 ease-out hover:shadow-xl hover:scale-[1.02] hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div className="flex flex-col flex-1 p-4 sm:p-6">
              {/* Price Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap",
                  item.is_free 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                )}>
                  {item.is_free ? 'Free' : `$${item.price_usd}`}
                </span>
              </div>

              <div className="flex flex-col flex-1">
                <h3 className="font-semibold text-lg sm:text-xl text-zinc-900 dark:text-white mb-2 pr-16 line-clamp-2">
                  {item.name}
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags?.split(',').slice(0, 2).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 truncate max-w-[150px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 flex-1">
                  {item.description}
                </p>

                <div className="mt-auto pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group-hover:translate-x-1 transition-transform duration-200"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 