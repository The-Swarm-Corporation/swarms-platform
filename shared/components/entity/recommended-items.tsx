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

  // Fetch data using the explorer endpoint with larger limit to ensure variety
  const { data: explorerData, refetch } = trpc.explorer.getExplorerData.useQuery(
    {
      includePrompts: type === 'prompt',
      includeAgents: type === 'agent',
      includeTools: type === 'tool',
      limit: 20, // Fetch more items to ensure we have enough unique ones
      offset: offset,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Initialize or update items when data changes
  useEffect(() => {
    if (explorerData) {
      let availableItems = [];
      if (type === 'prompt') {
        availableItems = explorerData.prompts;
      } else if (type === 'agent') {
        availableItems = explorerData.agents;
      } else {
        availableItems = explorerData.tools;
      }

      // Filter out items we've already seen
      availableItems = availableItems.filter(item => !seenItems.has(item.id));

      // If we don't have enough new items, reset seen items (except current)
      if (availableItems.length < 3) {
        setSeenItems(new Set([currentId]));
        availableItems = (type === 'prompt' ? explorerData.prompts :
                         type === 'agent' ? explorerData.agents :
                         explorerData.tools).filter(item => item.id !== currentId);
      }

      // Shuffle the available items
      availableItems = availableItems.sort(() => Math.random() - 0.5);

      // Take 3 items
      const newItems = availableItems.slice(0, 3);

      // Update seen items
      const newSeen = new Set(seenItems);
      newItems.forEach(item => newSeen.add(item.id));
      setSeenItems(newSeen);

      // Update current items
      setCurrentItems(newItems);
    }
  }, [explorerData, type, currentId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Increment offset to get different items
      setOffset(prev => prev + 20);
      await refetch();
    } catch (error) {
      console.error('Error refreshing items:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentItems.length) return null;

  return (
    <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            {type === 'prompt' ? (
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : type === 'agent' ? (
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Items You'd Like
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
              {type === 'prompt' 
                ? 'Discover more interesting prompts from our collection'
                : `Check out similar ${type}s that match your interests`}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isRefreshing && "animate-spin"
          )} />
          Explore More
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentItems.map((item) => (
          <Link
            key={item.id}
            href={makeUrl(PUBLIC.PROMPT, item.id)}
            className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-500 ease-out hover:shadow-xl hover:scale-[1.02] hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {item.name}
                  </h3>
                  <div className={cn(
                    "px-2 py-1 rounded text-sm font-medium",
                    item.is_free 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  )}>
                    {item.is_free ? 'Free' : `$${item.price_usd?.toFixed(2)}`}
                  </div>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {item.tags?.split(',').slice(0, 2).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full mt-2 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/50"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 