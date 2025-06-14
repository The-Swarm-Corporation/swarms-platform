'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Trophy, Star, Crown, Brain, Zap, Wrench, Flame, Heart, Target, MessageSquare, Bot, Sparkles, Rocket, Medal, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { useRouter } from 'next/navigation';

interface UserStats {
  totalItems: number;
  prompts: number;
  agents: number;
  tools: number;
}

interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  prompts: any[];
  agents: any[];
  tools: any[];
}

type Category = 'total' | 'prompts' | 'agents' | 'tools';

// Badge and tier definitions (reused from user profile)
const BADGES = {
  CONTRIBUTOR: {
    id: 'contributor',
    name: 'Contributor',
    description: 'Created 5 or more works',
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    requirement: (stats: any) => stats.totalItems >= 5
  },
  PROLIFIC: {
    id: 'prolific',
    name: 'Prolific Creator',
    description: 'Created 20 or more works',
    icon: Star,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    requirement: (stats: any) => stats.totalItems >= 20
  },
  MASTER: {
    id: 'master',
    name: 'AI Master',
    description: 'Created 50 or more works',
    icon: Crown,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    requirement: (stats: any) => stats.totalItems >= 50
  },
  PROMPT_MASTER: {
    id: 'prompt_master',
    name: 'Prompt Master',
    description: 'Created 10 or more prompts',
    icon: Brain,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    requirement: (stats: any) => stats.prompts >= 10
  },
  AGENT_EXPERT: {
    id: 'agent_expert',
    name: 'Agent Expert',
    description: 'Created 10 or more agents',
    icon: Zap,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    requirement: (stats: any) => stats.agents >= 10
  },
  TOOL_BUILDER: {
    id: 'tool_builder',
    name: 'Tool Builder',
    description: 'Created 10 or more tools',
    icon: Wrench,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    requirement: (stats: any) => stats.tools >= 10
  }
};

const TIERS = [
  {
    name: 'Novice',
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
    requirement: (stats: any) => stats.totalItems < 5
  },
  {
    name: 'Contributor',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    requirement: (stats: any) => stats.totalItems >= 5 && stats.totalItems < 20
  },
  {
    name: 'Expert',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    requirement: (stats: any) => stats.totalItems >= 20 && stats.totalItems < 50
  },
  {
    name: 'Master',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    requirement: (stats: any) => stats.totalItems >= 50
  }
];

// Add ranking badges type
type RankingBadge = {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  label: string;
};

type RankingBadges = {
  [key: number]: RankingBadge;
};

// Add ranking badges
const RANKING_BADGES: RankingBadges = {
  1: {
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    label: 'Champion'
  },
  2: {
    icon: Trophy,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
    label: 'Runner-up'
  },
  3: {
    icon: Medal,
    color: 'text-amber-600',
    bg: 'bg-amber-600/10',
    border: 'border-amber-600/20',
    label: 'Bronze'
  }
};

export function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('total');
  const { data: users, isLoading } = trpc.explorer.getTopUsers.useQuery(
    { category: selectedCategory },
    { refetchInterval: 60000 } // Refetch every minute
  );

  const categories = [
    { id: 'total', label: 'Total Works', icon: Trophy },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'tools', label: 'Tools', icon: Wrench }
  ] as const;

  const getStats = (user: User): UserStats => ({
    totalItems: user.prompts.length + user.agents.length + user.tools.length,
    prompts: user.prompts.length,
    agents: user.agents.length,
    tools: user.tools.length
  });

  const getUserTier = (stats: UserStats) => {
    return TIERS.find(tier => tier.requirement(stats)) || TIERS[0];
  };

  const getEarnedBadges = (stats: UserStats) => {
    return Object.values(BADGES).filter(badge => badge.requirement(stats));
  };

  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Top Creators</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Top Creators</h2>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id as Category)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-white'
              }`}
            >
              <category.icon className="w-3.5 h-3.5" />
              <span>{category.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {users?.map((user: User, index: number) => {
          const stats = getStats(user);
          const userTier = getUserTier(stats);
          const earnedBadges = getEarnedBadges(stats);
          const topBadge = earnedBadges[0];
          const rankingBadge = RANKING_BADGES[index + 1];

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group h-[120px]"
            >
              <div className="relative bg-black/50 backdrop-blur-xl border border-gray-800 rounded-lg p-3 hover:bg-black/70 transition-all duration-300 h-full flex flex-col justify-between">
                {/* Ranking Badge */}
                {rankingBadge && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className={`${rankingBadge.bg} ${rankingBadge.border} border rounded-full p-2 shadow-lg`}>
                      <rankingBadge.icon className={`h-5 w-5 ${rankingBadge.color}`} />
                    </div>
                  </div>
                )}

                {/* Rank Number */}
                <div className="absolute -left-2 -top-2 z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-amber-600/20 text-amber-600' :
                    'bg-white/10 text-white/60'
                  } text-xs font-bold`}>
                    #{index + 1}
                  </div>
                </div>

                {/* Top Row: Avatar, Username, Tier, Top Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/users/${user.username}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo(0, 0);
                      router.push(`/users/${user.username}`);
                    }}
                    scroll={false}
                    className="relative group/avatar shrink-0"
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden border border-gray-800 bg-black/90">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={`${user.username}'s avatar`}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-base font-bold">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <Link
                    href={`/users/${user.username}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo(0, 0);
                      router.push(`/users/${user.username}`);
                    }}
                    scroll={false}
                    className="text-xs font-semibold text-white hover:text-white/80 transition-colors truncate max-w-[80px]"
                  >
                    {user.username}
                  </Link>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${userTier.color} ${userTier.bg} ${userTier.border} border ml-1`}>{userTier.name}</div>
                  {topBadge && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${topBadge.color} ${topBadge.bg} ${topBadge.border} border ml-1`} title={topBadge.name}>
                      <topBadge.icon className="h-3 w-3" />
                      {topBadge.name}
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between w-full mt-auto">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs font-bold text-white leading-none">{stats.totalItems}</span>
                    <span className="text-[9px] text-gray-400 leading-none">Total</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs font-bold text-[#FF6B6B] leading-none">{stats.prompts}</span>
                    <span className="text-[9px] text-gray-400 leading-none">Prompts</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs font-bold text-[#4ECDC4] leading-none">{stats.agents}</span>
                    <span className="text-[9px] text-gray-400 leading-none">Agents</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs font-bold text-[#FFD93D] leading-none">{stats.tools}</span>
                    <span className="text-[9px] text-gray-400 leading-none">Tools</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 