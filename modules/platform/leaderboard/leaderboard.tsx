'use client';

import { useMemo, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BADGES,
  CATEGORIES,
  Category,
  LeaderboardProps,
  RANKING_BADGES,
  TIERS,
  User,
  UserStats,
} from './const';
import Image from 'next/image';

export function Leaderboard({
  search = '',
  viewMode = 'grid',
}: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('total');
  const {
    data: users,
    isLoading,
    error,
  } = trpc.explorer.getTopUsers.useQuery(
    { category: selectedCategory, limit: 10 },
    {
      staleTime: 30000,
      retry: 1,
    },
  );

  const getStats = (user: User): UserStats => ({
    totalItems: user.prompts.length + user.agents.length + user.tools.length,
    prompts: user.prompts.length,
    agents: user.agents.length,
    tools: user.tools.length,
  });

  const getUserTier = (stats: UserStats) => {
    return TIERS.find((tier) => tier.requirement(stats)) || TIERS[0];
  };

  const getEarnedBadges = (stats: UserStats) => {
    return Object.values(BADGES).filter((badge) => badge.requirement(stats));
  };

  const router = useRouter();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;

    const searchLower = search.toLowerCase();
    return users.filter(
      (user: User) =>
        user.username?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower),
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Top Creators</h2>
        <div className="flex space-x-2">
          {CATEGORIES.map((category) => (
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

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-[120px] bg-muted rounded-lg" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-400 mb-2">Failed to load leaderboard data</p>
              <p className="text-gray-400 text-sm">Please try refreshing the page</p>
            </div>
          ) : (
            filteredUsers?.map((user: User, index: number) => {
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
                  {rankingBadge && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div
                        className={`${rankingBadge.bg} ${rankingBadge.border} border rounded-full p-2 shadow-lg`}
                      >
                        <rankingBadge.icon
                          className={`h-5 w-5 ${rankingBadge.color}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="absolute -left-2 -top-2 z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        index === 0
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : index === 1
                            ? 'bg-gray-400/20 text-gray-400'
                            : index === 2
                              ? 'bg-amber-600/20 text-amber-600'
                              : 'bg-white/10 text-white/60'
                      } text-xs font-bold`}
                    >
                      #{index + 1}
                    </div>
                  </div>

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
                      <div className="relative w-8 h-8 rounded-md overflow-hidden border border-gray-800 bg-black/90">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={`${user.username}'s avatar`}
                            fill
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
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${userTier.color} ${userTier.bg} ${userTier.border} border ml-1`}
                    >
                      {userTier.name}
                    </div>
                    {topBadge && (
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${topBadge.color} ${topBadge.bg} ${topBadge.border} border ml-1`}
                        title={topBadge.name}
                      >
                        <topBadge.icon className="h-3 w-3" />
                        {topBadge.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full mt-auto">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs font-bold text-white leading-none">
                        {stats.totalItems}
                      </span>
                      <span className="text-[9px] text-gray-400 leading-none">
                        Total
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs font-bold text-[#FF6B6B] leading-none">
                        {stats.prompts}
                      </span>
                      <span className="text-[9px] text-gray-400 leading-none">
                        Prompts
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs font-bold text-[#4ECDC4] leading-none">
                        {stats.agents}
                      </span>
                      <span className="text-[9px] text-gray-400 leading-none">
                        Agents
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs font-bold text-[#FFD93D] leading-none">
                        {stats.tools}
                      </span>
                      <span className="text-[9px] text-gray-400 leading-none">
                        Tools
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
            })
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Tier
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                  Total
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                  Prompts
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                  Agents
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                  Tools
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Badges
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user: User, index: number) => {
                const stats = getStats(user);
                const userTier = getUserTier(stats);
                const earnedBadges = getEarnedBadges(stats);

                return (
                  <tr
                    key={user.id}
                    className="border-b border-gray-800 hover:bg-black/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          index === 0
                            ? 'bg-yellow-400/20 text-yellow-400'
                            : index === 1
                              ? 'bg-gray-400/20 text-gray-400'
                              : index === 2
                                ? 'bg-amber-600/20 text-amber-600'
                                : 'bg-white/10 text-white/60'
                        } text-xs font-bold`}
                      >
                        #{index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/users/${user.username}`}
                        onClick={(e) => {
                          e.preventDefault();
                          window.scrollTo(0, 0);
                          router.push(`/users/${user.username}`);
                        }}
                        scroll={false}
                        className="flex items-center gap-2 hover:text-white/80 transition-colors"
                      >
                        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-gray-800 bg-black/90">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              fill
                              alt={`${user.username}'s avatar`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-base font-bold">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${userTier.color} ${userTier.bg} ${userTier.border} border inline-block`}
                      >
                        {userTier.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {stats.totalItems}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[#FF6B6B]">
                      {stats.prompts}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[#4ECDC4]">
                      {stats.agents}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[#FFD93D]">
                      {stats.tools}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {earnedBadges.map((badge, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color} ${badge.bg} ${badge.border} border`}
                            title={badge.name}
                          >
                            <badge.icon className="h-3 w-3" />
                            {badge.name}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
