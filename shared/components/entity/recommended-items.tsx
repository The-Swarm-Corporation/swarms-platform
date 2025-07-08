import { trpc } from '@/shared/utils/trpc/trpc';
import { ArrowRight, Bot, Code, FileText } from 'lucide-react';
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
  // For prompts, use a random offset to get random recommendations
  const [randomOffset, setRandomOffset] = useState(0);

  useEffect(() => {
    if (type === 'prompt') {
      // Generate random offset between 0 and 20 (assuming we have more than 20 prompts)
      setRandomOffset(Math.floor(Math.random() * 20));
    }
  }, [type]);

  // Fetch data using the explorer endpoint
  const { data: explorerData } = trpc.explorer.getExplorerData.useQuery(
    {
      includePrompts: type === 'prompt',
      includeAgents: type === 'agent',
      includeTools: type === 'tool',
      limit: type === 'prompt' ? 10 : 4, // Fetch more for prompts to ensure we have enough after filtering
      offset: type === 'prompt' ? randomOffset : 0,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Get the appropriate data array based on type
  const items = type === 'prompt' 
    ? explorerData?.prompts 
    : type === 'agent' 
      ? explorerData?.agents 
      : explorerData?.tools;

  // For prompts, shuffle the array before filtering
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Filter out the current item and take only 3
  const recommendations = type === 'prompt'
    ? shuffleArray([...(items || [])])
        .filter(item => item.id !== currentId)
        .slice(0, 3)
    : (items || [])
        .filter(item => item.id !== currentId)
        .slice(0, 3);

  if (!recommendations.length) return null;

  return (
    <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
      <div className="flex items-center gap-3 mb-6">
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
              ? 'Discover interesting prompts from our collection'
              : `Explore similar ${type}s that others have created`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800",
              "bg-white dark:bg-zinc-950 transition-all duration-500 ease-out",
              "hover:shadow-xl hover:scale-[1.02] hover:border-zinc-300 dark:hover:border-zinc-700",
              "hover:-translate-y-1"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <div className="relative p-6 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags?.split(',').slice(0, 2).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={makeUrl(
                  type === 'prompt'
                    ? PUBLIC.PROMPT
                    : type === 'agent'
                      ? PUBLIC.AGENT
                      : PUBLIC.TOOL,
                  { id: item.id }
                )}
              >
                <Button 
                  className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 group/button"
                  variant="ghost"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/button:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 