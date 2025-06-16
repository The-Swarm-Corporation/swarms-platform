'use client';

import { useState } from 'react';
import { Leaderboard } from '@/modules/platform/explorer/components/content/leaderboard';
import { Input } from '@/shared/components/ui/input';
import { Search, LayoutGrid, Table } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils/cn';

export default function LeaderboardPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative group mb-8">
        {/* Animated border overlay */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-900 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>

        {/* Main banner content */}
        <div className="relative w-full bg-gradient-to-b from-black to-purple-950 p-8 rounded-lg">
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-wider bg-clip-text">
              Leaderboard
            </h1>
            <p className="text-xl text-gray-100/80">
              Discover the top creators and contributors in the Swarms ecosystem.
            </p>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(234,179,8,0.1)_0%,_transparent_70%)]"></div>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Input
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 text-white placeholder-gray-500 border-gray-800 focus:border-yellow-500/50 focus:ring-yellow-500/50"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'grid' | 'table')}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-black/50 border border-gray-800">
            <TabsTrigger
              value="grid"
              className={cn(
                "data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500",
                "data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-400"
              )}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className={cn(
                "data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500",
                "data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-400"
              )}
            >
              <Table className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Leaderboard search={search} viewMode={viewMode} />
    </div>
  );
} 