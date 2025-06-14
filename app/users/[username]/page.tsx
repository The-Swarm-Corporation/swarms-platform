'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Code, MessageSquare, Wrench, Share2, Twitter, Linkedin, Globe, Sparkles, Zap, Rocket, Trophy, Star, Crown, Target, Flame, Heart, Brain, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import ErrorMessage from './ErrorMessage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { motion } from 'framer-motion';
import Head from 'next/head';
import Footer from '@/shared/components/ui/Footer/Footer';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Badge and tier definitions
const BADGES = {
  // Contribution badges
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
  // Specialization badges
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
  },
  // Achievement badges
  EARLY_ADOPTER: {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined during the first month',
    icon: Flame,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    requirement: (stats: any, userData: any) => {
      const joinDate = new Date(userData.created_at);
      const firstMonth = new Date('2024-01-01'); // Adjust this date
      return joinDate <= firstMonth;
    }
  },
  COMMUNITY_BUILDER: {
    id: 'community_builder',
    name: 'Community Builder',
    description: 'Active in the community',
    icon: Heart,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
    requirement: (stats: any) => stats.totalItems >= 10
  },
  INNOVATOR: {
    id: 'innovator',
    name: 'Innovator',
    description: 'Created unique and innovative works',
    icon: Target,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    requirement: (stats: any) => stats.totalItems >= 15
  }
};

// Tier definitions
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

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache object
const cache: Record<string, CacheEntry<any>> = {};

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const [selectedTab, setSelectedTab] = useState('all');
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Memoize the cache key
  const cacheKey = useMemo(() => `user_${username}`, [username]);

  // Get user data with caching
  const { data: userData, isLoading: isLoadingUser } = trpc.explorer.getUserExplorerItemsByUsername.useQuery(
    { username },
    { 
      enabled: !!username,
      staleTime: CACHE_DURATION,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  // Memoize stats calculation
  const stats = useMemo(() => ({
    totalItems: userData?.combinedItems?.length || 0,
    prompts: userData?.prompts?.length || 0,
    agents: userData?.agents?.length || 0,
    tools: userData?.tools?.length || 0,
  }), [userData]);

  // Memoize filtered items
  const filteredItems = useMemo(() => {
    if (!userData) return [];
    return selectedTab === 'all' 
      ? userData.combinedItems 
      : selectedTab === 'prompts' 
        ? userData.prompts 
        : selectedTab === 'agents'
          ? userData.agents
          : userData.tools;
  }, [userData, selectedTab]);

  // Memoize share message
  const shareMessage = useMemo(() => 
    `Check out ${userData?.username || 'this user'}'s profile on Swarms Platform! They've created ${stats.totalItems} amazing AI tools, including ${stats.prompts} prompts, ${stats.agents} agents, and ${stats.tools} tools.`,
    [userData?.username, stats]
  );

  // Generate structured data for SEO
  const structuredData = useMemo(() => {
    if (!userData) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: userData.full_name || userData.username,
        alternateName: userData.username,
        description: `AI Developer with ${stats.totalItems} creations including ${stats.prompts} prompts, ${stats.agents} agents, and ${stats.tools} tools`,
        image: userData.avatar_url,
        url: window.location.href,
        sameAs: [], // Add social media links if available
        worksFor: {
          '@type': 'Organization',
          name: 'Swarms Platform',
          url: 'https://swarms.ai'
        }
      }
    };
  }, [userData, stats]);

  // Memoize handleShare function
  const handleShare = useCallback((platform: string) => {
    const url = window.location.href;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(shareMessage)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareMessage)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }, [shareMessage]);

  // Add copy URL handler
  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Memoize item colors
  const itemColors = useMemo(() => ({
    prompt: {
      icon: 'text-[#FF6B6B]',
      bg: 'bg-[#FF6B6B]/5',
      border: 'border-[#FF6B6B]/20',
      hover: 'hover:bg-[#FF6B6B]/10'
    },
    agent: {
      icon: 'text-[#4ECDC4]',
      bg: 'bg-[#4ECDC4]/5',
      border: 'border-[#4ECDC4]/20',
      hover: 'hover:bg-[#4ECDC4]/10'
    },
    tool: {
      icon: 'text-[#FFD93D]',
      bg: 'bg-[#FFD93D]/5',
      border: 'border-[#FFD93D]/20',
      hover: 'hover:bg-[#FFD93D]/10'
    }
  }), []);

  // Calculate user's tier
  const userTier = useMemo(() => {
    return TIERS.find(tier => tier.requirement(stats)) || TIERS[0];
  }, [stats]);

  // Calculate earned badges
  const earnedBadges = useMemo(() => {
    if (!userData) return [];
    return Object.values(BADGES).filter(badge => badge.requirement(stats, userData));
  }, [stats, userData]);

  if (!hydrated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!userData) {
    return <ErrorMessage />;
  }

  const pageTitle = `${userData.full_name || userData.username}'s Profile | Swarms Platform`;
  const pageDescription = `Explore ${userData.username}'s AI creations including ${stats.prompts} prompts, ${stats.agents} agents, and ${stats.tools} tools on Swarms Platform.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`AI, Swarms Platform, ${userData.username}, prompts, agents, tools, artificial intelligence`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        {userData.avatar_url && <meta property="og:image" content={userData.avatar_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {userData.avatar_url && <meta name="twitter:image" content={userData.avatar_url} />}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>
      <main className="min-h-screen bg-black pb-24 w-full">
        <div className="max-w-6xl mx-auto px-4 pt-10">
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium tracking-wider group"
            aria-label="Go back"
          >
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="group-hover:scale-110 transition-transform"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </motion.div>
            Back
          </motion.button>

          {/* Hero Section */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="relative flex flex-col md:flex-row items-center md:items-end gap-8 mb-12"
            aria-label="User profile information"
          >
            <motion.div 
              whileHover={{ scale: 1.02, rotate: 2 }}
              className="relative w-32 h-32 md:w-36 md:h-36 rounded-md overflow-hidden shadow-lg border border-gray-800 bg-black/90 backdrop-blur-lg flex items-center justify-center"
            >
              {userData.avatar_url ? (
                <img
                  src={userData.avatar_url}
                  alt={`${userData.username}'s profile picture`}
                  className="object-cover w-full h-full rounded-md max-w-[8rem] max-h-[8rem] border border-gray-800"
                  width={128}
                  height={128}
                />
              ) : (
                <span className="text-4xl font-bold text-white uppercase flex items-center justify-center w-full h-full border border-gray-800 bg-black/90">
                  {userData.username?.charAt(0) || '?'}
                </span>
              )}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_4px)]" />
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-4xl font-bold text-white flex items-center gap-2 tracking-tight"
                >
                  {userData.username}
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-block w-2 h-2 rounded-sm bg-[#FF6B6B]"
                    aria-hidden="true"
                  />
                </motion.h1>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className={`px-3 py-1 rounded-full ${userTier.bg} ${userTier.border} border`}
                >
                  <span className={`text-sm font-medium ${userTier.color}`}>{userTier.name}</span>
                </motion.div>
              </div>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-lg text-gray-400 font-medium mb-2 tracking-wide"
              >
                {userData.full_name || 'No name provided'}
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap gap-2 justify-center md:justify-start mb-4"
              >
                {earnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative px-3 py-1.5 rounded-full ${badge.bg} ${badge.border} border flex items-center gap-2`}
                  >
                    <badge.icon className={`h-4 w-4 ${badge.color}`} />
                    <span className={`text-sm font-medium ${badge.color}`}>{badge.name}</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 rounded-md text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {badge.description}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 justify-center md:justify-start mt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 px-6 py-3 rounded-md bg-black/90 text-blue-400 border border-blue-500/50 hover:border-blue-400 hover:bg-blue-950/30 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] group"
                  aria-label="Copy profile URL"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span className="text-sm font-medium tracking-wide">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span className="text-sm font-medium tracking-wide">Copy Profile URL</span>
                    </>
                  )}
                </motion.button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-6 py-3 rounded-md bg-black/90 text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-950/30 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group" aria-label="Share profile">
                    <Share2 className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <span className="text-sm font-medium tracking-wide">Share Account</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-black/95 border border-emerald-500/30 rounded-md p-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-xl">
                    <div className="px-2 py-1.5 mb-2">
                      <h3 className="text-sm font-medium text-white/90">Share Profile</h3>
                      <p className="text-xs text-white/60 mt-1">Share this profile with your network</p>
                    </div>
                    <div className="space-y-1">
                      <DropdownMenuItem 
                        className="flex items-center gap-4 text-white hover:text-white hover:bg-gray-900/50 cursor-pointer p-4 rounded-md transition-all duration-200 group"
                        onClick={() => handleShare('twitter')}
                        aria-label="Share on Twitter"
                      >
                        <div className="w-12 h-12 rounded-md bg-[#1DA1F2]/10 flex items-center justify-center border border-[#1DA1F2]/20 group-hover:bg-[#1DA1F2]/20 transition-colors">
                          <Twitter className="h-6 w-6 text-[#1DA1F2]" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">Share on Twitter</span>
                          <span className="text-xs text-white/60">Share with your followers</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-4 text-white hover:text-white hover:bg-gray-900/50 cursor-pointer p-4 rounded-md transition-all duration-200 group"
                        onClick={() => handleShare('linkedin')}
                        aria-label="Share on LinkedIn"
                      >
                        <div className="w-12 h-12 rounded-md bg-[#0077B5]/10 flex items-center justify-center border border-[#0077B5]/20 group-hover:bg-[#0077B5]/20 transition-colors">
                          <Linkedin className="h-6 w-6 text-[#0077B5]" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">Share on LinkedIn</span>
                          <span className="text-xs text-white/60">Share with your professional network</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-4 text-white hover:text-white hover:bg-gray-900/50 cursor-pointer p-4 rounded-md transition-all duration-200 group"
                        onClick={() => handleShare('reddit')}
                        aria-label="Share on Reddit"
                      >
                        <div className="w-12 h-12 rounded-md bg-[#FF4500]/10 flex items-center justify-center border border-[#FF4500]/20 group-hover:bg-[#FF4500]/20 transition-colors">
                          <Globe className="h-6 w-6 text-[#FF4500]" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">Share on Reddit</span>
                          <span className="text-xs text-white/60">Share with the community</span>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          </motion.section>

          {/* Stats Section */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-12 justify-center md:justify-between mt-8"
            aria-label="User statistics"
          >
            {[
              { 
                label: 'Total Works', 
                value: stats.totalItems, 
                color: 'text-white',
                icon: Sparkles,
                bg: 'bg-white/5'
              },
              { 
                label: 'Prompts', 
                value: stats.prompts, 
                color: 'text-[#FF6B6B]',
                icon: MessageSquare,
                bg: 'bg-[#FF6B6B]/5'
              },
              { 
                label: 'Agents', 
                value: stats.agents, 
                color: 'text-[#4ECDC4]',
                icon: Rocket,
                bg: 'bg-[#4ECDC4]/5'
              },
              { 
                label: 'Tools', 
                value: stats.tools, 
                color: 'text-[#FFD93D]',
                icon: Zap,
                bg: 'bg-[#FFD93D]/5'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`flex-1 flex flex-col items-center p-6 rounded-md shadow-lg border border-gray-800 ${stat.bg} backdrop-blur-lg hover:bg-gray-900/50 transition-all duration-200`}
                role="article"
                aria-label={`${stat.label}: ${stat.value}`}
              >
                <div className={`w-12 h-12 rounded-md ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <span className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</span>
                <span className="text-white/80 font-medium tracking-wider text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.section>

          {/* Works Gallery */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mb-8"
            aria-label="User's works"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Public Works</h2>
              <div className="flex flex-wrap gap-2" role="tablist">
                {[
                  { id: 'all', label: 'All', color: 'text-white', bg: 'bg-white/5' },
                  { id: 'prompts', label: 'Prompts', color: 'text-[#FF6B6B]', bg: 'bg-[#FF6B6B]/5' },
                  { id: 'agents', label: 'Agents', color: 'text-[#4ECDC4]', bg: 'bg-[#4ECDC4]/5' },
                  { id: 'tools', label: 'Tools', color: 'text-[#FFD93D]', bg: 'bg-[#FFD93D]/5' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTab(tab.id)}
                    transition={{ duration: 0.1 }}
                    role="tab"
                    aria-selected={selectedTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedTab === tab.id 
                        ? `${tab.color} ${tab.bg} border border-current/20 shadow-lg` 
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>
            <div role="tabpanel" id={`${selectedTab}-panel`}>
              {filteredItems && filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item, index) => {
                    const colors = itemColors[item.itemType as keyof typeof itemColors];
                    
                    return (
                      <motion.article
                        key={item.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <Link
                          href={`/${item.itemType}/${item.id}`}
                          className={`group relative block rounded-md overflow-hidden shadow-lg border border-gray-800 ${colors.bg} backdrop-blur-lg p-6 ${colors.hover} transition-all duration-200`}
                          aria-label={`View ${item.name || 'Untitled'} ${item.itemType}`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {item.itemType === 'prompt' ? (
                              <MessageSquare className={`h-5 w-5 ${colors.icon} group-hover:scale-110 transition-transform`} aria-hidden="true" />
                            ) : item.itemType === 'agent' ? (
                              <Code className={`h-5 w-5 ${colors.icon} group-hover:scale-110 transition-transform`} aria-hidden="true" />
                            ) : (
                              <Wrench className={`h-5 w-5 ${colors.icon} group-hover:scale-110 transition-transform`} aria-hidden="true" />
                            )}
                            <span className={`text-xs uppercase tracking-wider font-medium ${colors.icon}`}>{item.itemType}</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 tracking-tight group-hover:text-white/90 transition-colors">{item.name || 'Untitled'}</h3>
                          <p className="text-white/70 mb-3 line-clamp-2 text-sm group-hover:text-white/80 transition-colors">{item.description || 'No description provided'}</p>
                          <div className="flex items-center justify-between mt-3">
                            <time className="text-xs text-white/60 group-hover:text-white/70 transition-colors" dateTime={item.created_at}>
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </time>
                            <span className={`text-xs font-medium ${colors.icon}`}>
                              {item.tags?.[0] || 'No tags'}
                            </span>
                          </div>
                          <div className={`absolute inset-0 pointer-events-none opacity-5 ${colors.bg}`} />
                        </Link>
                      </motion.article>
                    );
                  })}
                </div>
              ) : (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center text-white/70 py-12 text-sm"
                >
                  No {selectedTab === 'all' ? 'public works' : selectedTab} yet.
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>
        <Footer />
      </main>
    </>
  );
} 