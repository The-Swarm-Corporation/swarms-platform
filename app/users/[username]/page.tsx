'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Code, MessageSquare, Wrench, Share2, Twitter, Linkedin, Globe, Sparkles, Zap, Rocket, Trophy, Star, Crown, Target, Flame, Heart, Brain, Copy, Check, Grid, List, ChevronDown, ChevronRight, Award, Lock, X } from 'lucide-react';
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
import BookmarkButton from '@/shared/components/bookmark-button';
import Image from 'next/image';
import Input from '@/shared/components/ui/Input/Input';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache cleanup interval (10 minutes)
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000;

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache object with cleanup mechanism
const cache: Record<string, CacheEntry<any>> = {};

// Cache cleanup function
const cleanupCache = () => {
  const now = Date.now();
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > CACHE_DURATION) {
      delete cache[key];
    }
  });
};

// Run cache cleanup periodically
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL);
}

// Safe window.location access for SSR
const getCurrentUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

// Error boundary for skill requirements
const safeRequirementCheck = (skill: any, stats: any, userData: any) => {
  try {
    return skill.requirement(stats, userData);
  } catch (error) {
    console.error(`Error checking requirement for skill ${skill.id}:`, error);
    return false;
  }
};

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
      try {
        const joinDate = new Date(userData.created_at);
        const firstMonth = new Date('2024-01-01'); // Adjust this date
        return joinDate <= firstMonth;
      } catch (error) {
        console.error('Error checking early adopter requirement:', error);
        return false;
      }
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

// Skill Tree Structure - organized by progression paths
const SKILL_TREE = {
  // Core AI Development Path
  AI_FOUNDATION: {
    id: 'ai_foundation',
    name: 'AI Foundation',
    category: 'Core',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    position: { x: 50, y: 10 },
    skills: [
      {
        id: 'first_creation',
        name: 'First Creation',
        description: 'Create your first AI work',
        icon: Star,
        tier: 1,
        requirement: (stats: any) => stats.totalItems >= 1,
        unlocks: ['contributor', 'specialization_choice']
      },
      {
        id: 'contributor',
        name: 'Contributor',
        description: 'Create 5 or more works',
        icon: Trophy,
        tier: 2,
        requirement: (stats: any) => stats.totalItems >= 5,
        prerequisite: 'first_creation',
        unlocks: ['prolific_creator', 'community_builder']
      },
      {
        id: 'prolific_creator',
        name: 'Prolific Creator',
        description: 'Create 20 or more works',
        icon: Crown,
        tier: 3,
        requirement: (stats: any) => stats.totalItems >= 20,
        prerequisite: 'contributor',
        unlocks: ['ai_master']
      },
      {
        id: 'ai_master',
        name: 'AI Master',
        description: 'Create 50 or more works',
        icon: Target,
        tier: 4,
        requirement: (stats: any) => stats.totalItems >= 50,
        prerequisite: 'prolific_creator',
        unlocks: ['innovation_leader']
      }
    ]
  },

  // Prompt Engineering Specialization
  PROMPT_MASTERY: {
    id: 'prompt_mastery',
    name: 'Prompt Mastery',
    category: 'Specialization',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    position: { x: 20, y: 30 },
    skills: [
      {
        id: 'specialization_choice',
        name: 'Specialization Choice',
        description: 'Unlock specialization paths',
        icon: Brain,
        tier: 1,
        requirement: (stats: any) => stats.totalItems >= 3,
        prerequisite: 'first_creation',
        unlocks: ['prompt_apprentice', 'agent_apprentice', 'tool_apprentice']
      },
      {
        id: 'prompt_apprentice',
        name: 'Prompt Apprentice',
        description: 'Create 3 prompts',
        icon: Brain,
        tier: 2,
        requirement: (stats: any) => stats.prompts >= 3,
        prerequisite: 'specialization_choice',
        unlocks: ['prompt_craftsman']
      },
      {
        id: 'prompt_craftsman',
        name: 'Prompt Craftsman',
        description: 'Create 10 prompts',
        icon: Brain,
        tier: 3,
        requirement: (stats: any) => stats.prompts >= 10,
        prerequisite: 'prompt_apprentice',
        unlocks: ['prompt_master']
      },
      {
        id: 'prompt_master',
        name: 'Prompt Master',
        description: 'Create 25 high-quality prompts',
        icon: Brain,
        tier: 4,
        requirement: (stats: any) => stats.prompts >= 25,
        prerequisite: 'prompt_craftsman',
        unlocks: ['language_architect']
      }
    ]
  },

  // Agent Development Specialization
  AGENT_MASTERY: {
    id: 'agent_mastery',
    name: 'Agent Mastery',
    category: 'Specialization',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    position: { x: 50, y: 30 },
    skills: [
      {
        id: 'agent_apprentice',
        name: 'Agent Apprentice',
        description: 'Create 3 agents',
        icon: Zap,
        tier: 2,
        requirement: (stats: any) => stats.agents >= 3,
        prerequisite: 'specialization_choice',
        unlocks: ['agent_craftsman']
      },
      {
        id: 'agent_craftsman',
        name: 'Agent Craftsman',
        description: 'Create 10 agents',
        icon: Zap,
        tier: 3,
        requirement: (stats: any) => stats.agents >= 10,
        prerequisite: 'agent_apprentice',
        unlocks: ['agent_expert']
      },
      {
        id: 'agent_expert',
        name: 'Agent Expert',
        description: 'Create 25 sophisticated agents',
        icon: Zap,
        tier: 4,
        requirement: (stats: any) => stats.agents >= 25,
        prerequisite: 'agent_craftsman',
        unlocks: ['swarm_orchestrator']
      }
    ]
  },

  // Tool Building Specialization
  TOOL_MASTERY: {
    id: 'tool_mastery',
    name: 'Tool Mastery',
    category: 'Specialization',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    position: { x: 80, y: 30 },
    skills: [
      {
        id: 'tool_apprentice',
        name: 'Tool Apprentice',
        description: 'Create 3 tools',
        icon: Wrench,
        tier: 2,
        requirement: (stats: any) => stats.tools >= 3,
        prerequisite: 'specialization_choice',
        unlocks: ['tool_craftsman']
      },
      {
        id: 'tool_craftsman',
        name: 'Tool Craftsman',
        description: 'Create 10 tools',
        icon: Wrench,
        tier: 3,
        requirement: (stats: any) => stats.tools >= 10,
        prerequisite: 'tool_apprentice',
        unlocks: ['tool_builder']
      },
      {
        id: 'tool_builder',
        name: 'Tool Builder',
        description: 'Create 25 powerful tools',
        icon: Wrench,
        tier: 4,
        requirement: (stats: any) => stats.tools >= 25,
        prerequisite: 'tool_craftsman',
        unlocks: ['system_architect']
      }
    ]
  },

  // Community & Leadership Path
  COMMUNITY_LEADER: {
    id: 'community_leader',
    name: 'Community Leadership',
    category: 'Social',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    position: { x: 20, y: 60 },
    skills: [
      {
        id: 'community_builder',
        name: 'Community Builder',
        description: 'Active in the community',
        icon: Heart,
        tier: 2,
        requirement: (stats: any) => stats.totalItems >= 10,
        prerequisite: 'contributor',
        unlocks: ['mentor', 'innovator']
      },
      {
        id: 'mentor',
        name: 'Mentor',
        description: 'Help others in the community',
        icon: Heart,
        tier: 3,
        requirement: (stats: any) => stats.totalItems >= 15,
        prerequisite: 'community_builder',
        unlocks: ['community_leader']
      },
      {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Joined during the first month',
        icon: Flame,
        tier: 1,
        requirement: (stats: any, userData: any) => {
          try {
            const joinDate = new Date(userData.created_at);
            const firstMonth = new Date('2024-01-01');
            return joinDate <= firstMonth;
          } catch (error) {
            console.error('Error checking early adopter requirement:', error);
            return false;
          }
        },
        unlocks: ['pioneer']
      }
    ]
  },

  // Innovation & Research Path
  INNOVATION: {
    id: 'innovation',
    name: 'Innovation',
    category: 'Research',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    position: { x: 80, y: 60 },
    skills: [
      {
        id: 'innovator',
        name: 'Innovator',
        description: 'Create unique and innovative works',
        icon: Target,
        tier: 3,
        requirement: (stats: any) => stats.totalItems >= 15,
        prerequisite: 'community_builder',
        unlocks: ['research_pioneer']
      },
      {
        id: 'cross_discipline',
        name: 'Cross-Discipline Expert',
        description: 'Master multiple specializations',
        icon: Star,
        tier: 4,
        requirement: (stats: any) => stats.prompts >= 10 && stats.agents >= 10 && stats.tools >= 10,
        prerequisite: 'innovator',
        unlocks: ['platform_architect']
      }
    ]
  }
};

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const [selectedTab, setSelectedTab] = useState('all');
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 9 works per page
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const [showStats, setShowStats] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<any>(null); // State for skill details panel

  // Debug search query changes
  useEffect(() => {
    console.log('Search query changed to:', searchQuery);
  }, [searchQuery]);

  // Memoize the cache key (for user data)
  const cacheKey = useMemo(() => `user_${username}`, [username]);
  // Cache for paginated/search results
  const worksCacheKey = useMemo(() => `works_${username}_${selectedTab}_${searchQuery}_${currentPage}_${pageSize}_${viewMode}`, [username, selectedTab, searchQuery, currentPage, pageSize, viewMode]);

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

  // Debug userData
  useEffect(() => {
    if (userData) {
      console.log('UserData received:', {
        username: userData.username,
        promptsLength: userData.prompts?.length || 0,
        agentsLength: userData.agents?.length || 0,
        toolsLength: userData.tools?.length || 0,
        hasPrompts: !!userData.prompts,
        hasAgents: !!userData.agents,
        hasTools: !!userData.tools
      });
    }
  }, [userData]);

  // Memoize stats calculation
  const stats = useMemo(() => ({
    totalItems: (userData?.prompts?.length || 0) + (userData?.agents?.length || 0) + (userData?.tools?.length || 0),
    prompts: userData?.prompts?.length || 0,
    agents: userData?.agents?.length || 0,
    tools: userData?.tools?.length || 0,
  }), [userData]);

  // Memoize filtered items (by tab)
  const filteredItems = useMemo(() => {
    if (!userData) {
      console.log('No userData available');
      return [];
    }
    
    let items = selectedTab === 'all' 
      ? [...(userData.prompts || []), ...(userData.agents || []), ...(userData.tools || [])]
      : selectedTab === 'prompts' 
        ? userData.prompts 
        : selectedTab === 'agents'
          ? userData.agents
          : userData.tools;
    
    console.log(`Filtered items for tab "${selectedTab}":`, items?.length || 0, 'items');
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      console.log('Searching for:', q, 'in', items.length, 'items');
      items = items.filter((item: any) => {
        const nameMatch = item.name && item.name.toLowerCase().includes(q);
        const descMatch = item.description && item.description.toLowerCase().includes(q);
        const tagMatch = Array.isArray(item.tags) && item.tags.some((tag: string) => tag.toLowerCase().includes(q));
        return nameMatch || descMatch || tagMatch;
      });
      console.log('Found', items.length, 'matching items');
    }
    
    console.log('Final filtered items:', items?.length || 0);
    return items || [];
  }, [userData, selectedTab, searchQuery]);

  // Pagination logic with caching
  const paginatedItems = useMemo(() => {
    console.log('Pagination calculation:', {
      hasUserData: !!userData,
      filteredItemsLength: filteredItems.length,
      currentPage,
      pageSize,
      cacheKey: worksCacheKey
    });
    
    // Only cache if we have data and filteredItems is not empty
    if (!userData || filteredItems.length === 0) {
      console.log('No userData or filteredItems, returning empty array');
      return [];
    }
    
    // Check cache
    const now = Date.now();
    if (cache[worksCacheKey] && now - cache[worksCacheKey].timestamp < CACHE_DURATION) {
      console.log('Using cached paginated items:', cache[worksCacheKey].data.length);
      return cache[worksCacheKey].data;
    }
    
    // Compute paginated items
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageItems = filteredItems.slice(startIdx, endIdx);
    
    console.log('Computed paginated items:', {
      startIdx,
      endIdx,
      pageItemsLength: pageItems.length,
      totalFilteredItems: filteredItems.length
    });
    
    // Only cache if we have actual items
    if (pageItems.length > 0) {
      cache[worksCacheKey] = { data: pageItems, timestamp: now };
      console.log('Cached paginated items');
    }
    
    return pageItems;
  }, [userData, filteredItems, currentPage, pageSize, worksCacheKey]);

  const totalPages = useMemo(() => Math.ceil(filteredItems.length / pageSize) || 1, [filteredItems, pageSize]);

  // Reset page when tab, search, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchQuery, pageSize]);

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
        url: getCurrentUrl(),
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
    const url = getCurrentUrl();
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

    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  }, [shareMessage]);

  // Add copy URL handler
  const handleCopyUrl = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(getCurrentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
    return Object.values(BADGES).filter(badge => {
      try {
        return badge.requirement(stats, userData);
      } catch (error) {
        console.error(`Error checking badge requirement for ${badge.id}:`, error);
        return false;
      }
    });
  }, [stats, userData]);

  // Pre-compute flattened skills array for better performance
  const allSkills = useMemo(() => 
    Object.values(SKILL_TREE).flatMap(branch => branch.skills), 
    []
  );

  // Create a skills lookup map for O(1) access
  const skillsMap = useMemo(() => 
    new Map(allSkills.map(skill => [skill.id, skill])), 
    [allSkills]
  );

  // Create a branch lookup map for O(1) access
  const branchMap = useMemo(() => {
    const map = new Map();
    Object.values(SKILL_TREE).forEach(branch => {
      branch.skills.forEach(skill => {
        map.set(skill.id, branch);
      });
    });
    return map;
  }, []);

  // Calculate earned skills (for skill tree)
  const earnedSkills = useMemo(() => {
    if (!userData) return [];
    return allSkills.filter(skill => safeRequirementCheck(skill, stats, userData));
  }, [stats, userData, allSkills]);

  // Create earned skills set for O(1) lookup
  const earnedSkillsSet = useMemo(() => 
    new Set(earnedSkills.map(skill => skill.id)), 
    [earnedSkills]
  );

  // Memoized helper functions
  const getTotalSkillCount = useCallback(() => allSkills.length, [allSkills.length]);
  const getSkillName = useCallback((id: string) => skillsMap.get(id)?.name || id, [skillsMap]);
  const getSkillBranchColor = useCallback((skill: any) => {
    const branch = branchMap.get(skill.id);
    return branch || { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
  }, [branchMap]);
  const isSkillUnlocked = useCallback((skill: any) => earnedSkillsSet.has(skill.id), [earnedSkillsSet]);
  const isSkillAvailable = useCallback((skill: any) => {
    if (!skill.prerequisite) return true;
    return earnedSkillsSet.has(skill.prerequisite);
  }, [earnedSkillsSet]);

  // Helper to render skill connections
  const renderSkillConnections = useCallback(() => {
    // For now, return empty SVG elements since the complex DOM manipulation is causing type issues
    // This can be enhanced later with proper type definitions
    return [];
  }, []);

  // Calculate user's level based on earned skills
  const calculateLevel = useCallback((earnedSkillCount: number) => {
    if (earnedSkillCount === 0) return 1;
    if (earnedSkillCount < 5) return 2;
    if (earnedSkillCount < 10) return 3;
    if (earnedSkillCount < 15) return 4;
    return 5; // Assuming max level is 5
  }, []);

  // Memoize page metadata
  const pageTitle = useMemo(() => 
    `${userData?.full_name || userData?.username || 'User'}'s Profile | Swarms Platform`,
    [userData?.full_name, userData?.username]
  );

  const pageDescription = useMemo(() => 
    `Explore ${userData?.username || 'this user'}'s AI creations including ${stats.prompts} prompts, ${stats.agents} agents, and ${stats.tools} tools on Swarms Platform.`,
    [userData?.username, stats.prompts, stats.agents, stats.tools]
  );

  // Memoize page numbers array
  const pageNumbers = useMemo(() => 
    Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

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

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`AI, Swarms Platform, ${userData.username}, prompts, agents, tools, artificial intelligence`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={getCurrentUrl()} />
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
                <Image
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
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
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
                  className={`px-2 py-1 rounded-full ${userTier.bg} ${userTier.border} border flex items-center gap-1.5`}
                >
                  <Award className={`h-3 w-3 ${userTier.color}`} />
                  <span className={`text-xs font-medium ${userTier.color}`}>{userTier.name}</span>
                </motion.div>
              </div>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-lg text-gray-400 font-medium mb-3 tracking-wide"
              >
                {userData.full_name || 'No name provided'}
              </motion.p>
              
              {/* Enhanced Achievements Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-white">Achievements</h3>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                      <span className="text-xs font-medium text-yellow-400">{earnedBadges.length}</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/50">
                    {earnedBadges.length} of {Object.keys(BADGES).length} unlocked
                  </div>
                </div>

                {/* Achievement Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/70">Progress</span>
                    <span className="text-xs text-white/70">
                      {Math.round((earnedBadges.length / Object.keys(BADGES).length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(earnedBadges.length / Object.keys(BADGES).length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                    />
                  </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.values(BADGES).map((badge, index) => {
                    const isEarned = earnedBadges.some(earned => earned.id === badge.id);
                    
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: index * 0.05,
                          duration: 0.3,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                        className={`
                          group relative p-3 rounded-lg border transition-all duration-300 cursor-pointer
                          ${isEarned 
                            ? `${badge.bg} ${badge.border} hover:scale-105 hover:shadow-lg` 
                            : 'bg-gray-900/30 border-gray-800/50 hover:border-gray-700/50'
                          }
                        `}
                        whileHover={{ y: -2 }}
                      >
                        {/* Achievement Icon */}
                        <div className="flex items-center justify-center mb-2">
                          <div className={`
                            p-2 rounded-full transition-all duration-300
                            ${isEarned 
                              ? `${badge.bg} ${badge.border} border` 
                              : 'bg-gray-800/50 border border-gray-700/50'
                            }
                          `}>
                            <badge.icon 
                              className={`h-5 w-5 transition-colors duration-300 ${
                                isEarned ? badge.color : 'text-gray-500'
                              }`} 
                            />
                          </div>
                        </div>
                        
                        {/* Achievement Info */}
                        <div className="text-center">
                          <h4 className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isEarned ? badge.color : 'text-gray-500'
                          }`}>
                            {badge.name}
                          </h4>
                          <p className="text-xs text-white/50 leading-tight">
                            {badge.description}
                          </p>
                        </div>

                        {/* Earned Indicator */}
                        {isEarned && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}

                        {/* Locked Overlay */}
                        {!isEarned && (
                          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 rounded-md text-xs text-white/90 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700 shadow-lg backdrop-blur-sm pointer-events-none">
                          <div className="font-medium mb-1">{badge.name}</div>
                          <div className="text-white/70">{badge.description}</div>
                          {!isEarned && (
                            <div className="text-yellow-400 mt-1">🔒 Not yet unlocked</div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Achievement Categories or Featured Section */}
                {earnedBadges.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 rounded-lg bg-gradient-to-r from-yellow-400/5 to-orange-400/5 border border-yellow-400/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Latest Achievement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${earnedBadges[earnedBadges.length - 1]?.bg} ${earnedBadges[earnedBadges.length - 1]?.border} border`}>
                        {earnedBadges[earnedBadges.length - 1] && (() => {
                          const IconComponent = earnedBadges[earnedBadges.length - 1].icon;
                          return (
                            <IconComponent 
                              className={`h-4 w-4 ${earnedBadges[earnedBadges.length - 1].color}`} 
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${earnedBadges[earnedBadges.length - 1]?.color}`}>
                          {earnedBadges[earnedBadges.length - 1]?.name}
                        </div>
                        <div className="text-xs text-white/50">
                          {earnedBadges[earnedBadges.length - 1]?.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Skill Tree Achievements Section */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold text-white">Skill Tree</h3>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                      <span className="text-xs font-medium text-yellow-400">{earnedSkills.length}</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/50">
                    Level {calculateLevel(earnedSkills.length)} • {earnedSkills.length}/{getTotalSkillCount()} skills unlocked
                  </div>
                </div>

                {/* Skill Tree Visualization */}
                <div className="relative bg-gray-900/30 rounded-lg border border-gray-800/50 p-6 min-h-[600px] overflow-x-auto">
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    {renderSkillConnections()}
                  </svg>

                  {/* Skill Nodes */}
                  <div className="relative" style={{ zIndex: 2 }}>
                    {Object.values(SKILL_TREE).map(branch => (
                      <div key={branch.id} className="skill-branch">
                        {/* Branch Header */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`absolute ${branch.bg} ${branch.border} border rounded-lg px-3 py-1`}
                          style={{
                            left: `${branch.position.x}%`,
                            top: `${branch.position.y - 5}%`,
                            transform: 'translateX(-50%)'
                          }}
                        >
                          <span className={`text-xs font-medium ${branch.color}`}>
                            {branch.name}
                          </span>
                        </motion.div>

                        {/* Skills in Branch */}
                        {branch.skills.map((skill, index) => {
                          const isUnlocked = isSkillUnlocked(skill);
                          const isAvailable = isSkillAvailable(skill);
                          const isEarned = isUnlocked;
                          
                          return (
                            <motion.div
                              key={skill.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ 
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 200,
                                damping: 15
                              }}
                              className={`
                                absolute w-16 h-16 rounded-full border-2 cursor-pointer transition-all duration-300
                                ${isEarned 
                                  ? `${branch.bg} ${branch.border} shadow-lg scale-110` 
                                  : isAvailable
                                    ? 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/50 hover:scale-105'
                                    : 'bg-gray-900/50 border-gray-800/30 opacity-50'
                                }
                              `}
                              style={{
                                left: `${branch.position.x + (index % 2 === 0 ? -10 : 10)}%`,
                                top: `${branch.position.y + 15 + (skill.tier * 15)}%`,
                                transform: 'translateX(-50%)',
                                zIndex: skill.tier
                              }}
                              whileHover={isAvailable ? { y: -2 } : {}}
                              onClick={() => setSelectedSkill(skill)}
                            >
                              {/* Skill Icon */}
                              <div className="w-full h-full flex items-center justify-center">
                                <skill.icon 
                                  className={`h-6 w-6 transition-colors duration-300 ${
                                    isEarned ? branch.color : isAvailable ? 'text-gray-400' : 'text-gray-600'
                                  }`} 
                                />
                              </div>

                              {/* Earned Indicator */}
                              {isEarned && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-gray-900"
                                >
                                  <Check className="h-2 w-2 text-white" />
                                </motion.div>
                              )}

                              {/* Skill Tier */}
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                                <div className={`text-xs px-1 py-0.5 rounded ${
                                  isEarned ? branch.bg : 'bg-gray-800/50'
                                } ${isEarned ? branch.color : 'text-gray-500'}`}>
                                  T{skill.tier}
                                </div>
                              </div>

                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 rounded-md text-xs text-white/90 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700 shadow-lg backdrop-blur-sm pointer-events-none">
                                <div className="font-medium mb-1">{skill.name}</div>
                                <div className="text-white/70 mb-1">{skill.description}</div>
                                <div className={`${isEarned ? 'text-green-400' : isAvailable ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {isEarned ? '✓ Unlocked' : isAvailable ? '⚡ Available' : '🔒 Locked'}
                                </div>
                                {skill.prerequisite && !isAvailable && (
                                  <div className="text-gray-400 text-xs mt-1">
                                    Requires: {getSkillName(skill.prerequisite)}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Details Panel */}
                {selectedSkill && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-400/5 to-purple-400/5 border border-blue-400/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getSkillBranchColor(selectedSkill).bg} ${getSkillBranchColor(selectedSkill).border} border`}>
                          <selectedSkill.icon className={`h-5 w-5 ${getSkillBranchColor(selectedSkill).color}`} />
                        </div>
                        <div>
                          <h4 className={`text-lg font-semibold ${getSkillBranchColor(selectedSkill).color}`}>
                            {selectedSkill.name}
                          </h4>
                          <p className="text-sm text-white/70">{selectedSkill.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                            <span>Tier {selectedSkill.tier}</span>
                            {selectedSkill.prerequisite && (
                              <span>Requires: {getSkillName(selectedSkill.prerequisite)}</span>
                            )}
                            {selectedSkill.unlocks && (
                              <span>Unlocks: {selectedSkill.unlocks.map(getSkillName).join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSkill(null)}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Progression Stats */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.values(SKILL_TREE).map(branch => {
                    const branchSkills = branch.skills.filter(skill => 
                      earnedSkills.some(earned => earned.id === skill.id)
                    );
                    const progress = (branchSkills.length / branch.skills.length) * 100;
                    
                    return (
                      <div key={branch.id} className={`p-3 rounded-lg ${branch.bg} ${branch.border} border`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${branch.color.replace('text', 'bg')}`} />
                          <span className="text-xs font-medium text-white">{branch.name}</span>
                        </div>
                        <div className="text-xs text-white/50 mb-1">
                          {branchSkills.length}/{branch.skills.length} skills
                        </div>
                        <div className="w-full bg-gray-800/50 rounded-full h-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full rounded-full ${branch.color.replace('text', 'bg')}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-black/90 text-blue-400 border border-blue-500/50 hover:border-blue-400 hover:bg-blue-950/30 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] group"
                  aria-label="Copy profile URL"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span className="text-xs font-medium tracking-wide">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span className="text-xs font-medium tracking-wide">Copy URL</span>
                    </>
                  )}
                </motion.button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-md bg-black/90 text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-950/30 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group" aria-label="Share profile">
                    <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <span className="text-xs font-medium tracking-wide">Share</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-black/95 border border-emerald-500/30 rounded-lg p-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-xl">
                    <div className="px-2 py-1 mb-2 border-b border-gray-800/50">
                      <h3 className="text-xs font-medium text-white/90 uppercase tracking-wider">Share Profile</h3>
                    </div>
                    <div className="space-y-0.5">
                      <DropdownMenuItem 
                        className="flex items-center gap-3 text-white hover:text-white hover:bg-gray-900/50 cursor-pointer p-2.5 rounded-md transition-all duration-200 group"
                        onClick={() => handleShare('twitter')}
                        aria-label="Share on Twitter"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#1DA1F2]/10 flex items-center justify-center border border-[#1DA1F2]/20 group-hover:bg-[#1DA1F2]/20 transition-colors">
                          <Twitter className="h-4 w-4 text-[#1DA1F2]" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium block">Twitter</span>
                          <span className="text-xs text-white/50">Share with followers</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-3 text-white hover:text-white hover:bg-gray-900/50 cursor-pointer p-2.5 rounded-md transition-all duration-200 group"
                        onClick={() => handleShare('linkedin')}
                        aria-label="Share on LinkedIn"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#0077B5]/10 flex items-center justify-center border border-[#0077B5]/20 group-hover:bg-[#0077B5]/20 transition-colors">
                          <Linkedin className="h-4 w-4 text-[#0077B5]" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium block">LinkedIn</span>
                          <span className="text-xs text-white/50">Share with network</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-3 text-white hover:text-white hover:bg-gray-900/50 cursor-pointer p-2.5 rounded-md transition-all duration-200 group"
                        onClick={() => handleShare('reddit')}
                        aria-label="Share on Reddit"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#FF4500]/10 flex items-center justify-center border border-[#FF4500]/20 group-hover:bg-[#FF4500]/20 transition-colors">
                          <Globe className="h-4 w-4 text-[#FF4500]" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium block">Reddit</span>
                          <span className="text-xs text-white/50">Share with community</span>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <BookmarkButton
                  id={userData.username || ''}
                  type="user"
                  name={userData.full_name || userData.username || ''}
                  description={`AI Developer with ${stats.totalItems} creations including ${stats.prompts} prompts, ${stats.agents} agents, and ${stats.tools} tools`}
                  created_at={new Date().toISOString()}
                  username={userData.username || ''}
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Stats Section */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mb-8 mt-8"
            aria-label="User statistics"
          >
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 text-lg text-white/80 hover:text-white transition-colors group mb-4"
            >
              <motion.div
                animate={{ rotate: showStats ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>
              <span className="font-semibold">Statistics Overview</span>
            </button>
            
            <motion.div
              initial={false}
              animate={{ 
                height: showStats ? 'auto' : 0,
                opacity: showStats ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-between">
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
              </div>
            </motion.div>
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
                        : 'bg-gray-900/30 border border-gray-800/50 hover:border-gray-700/50'
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Search input */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Input
                  type="text"
                  placeholder="Search works by name, description, or tag..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="w-full sm:w-96 bg-black/80 border border-gray-700 text-white placeholder:text-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search works"
                />
                {/* View and Page Size Controls */}
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-black/80 border border-gray-700 rounded-md p-1">
                    <button
                      onClick={() => setViewMode('gallery')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'gallery' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-white/60 hover:text-white/80 hover:bg-gray-700/50'
                      }`}
                      aria-label="Gallery view"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'table' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-white/60 hover:text-white/80 hover:bg-gray-700/50'
                      }`}
                      aria-label="Table view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Page Size Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md bg-black/80 text-white/80 border border-gray-700 hover:bg-gray-700/50 transition-all duration-200">
                      <span className="text-sm">{pageSize} per page</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 bg-black/95 border border-gray-700 rounded-md p-2 shadow-lg backdrop-blur-xl">
                      {[6, 9, 12, 18, 24].map((size) => (
                        <DropdownMenuItem
                          key={size}
                          onClick={() => setPageSize(size)}
                          className={`flex items-center justify-between px-3 py-2 rounded-md text-white hover:text-white hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${
                            pageSize === size ? 'bg-blue-600/20 text-blue-400' : ''
                          }`}
                        >
                          <span>{size} per page</span>
                          {pageSize === size && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Pagination info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <span>Page {currentPage} of {totalPages}</span>
                  <span className="mx-2">|</span>
                  <span>{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}</span>
                  <span className="mx-2">|</span>
                  <span>View: {viewMode === 'gallery' ? 'Gallery' : 'Table'}</span>
                </div>
              </div>
            </div>

            <div role="tabpanel" id={`${selectedTab}-panel`}>
              {paginatedItems && paginatedItems.length > 0 ? (
                viewMode === 'gallery' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((item: any, index: number) => {
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
                                {Array.isArray(item.tags) ? item.tags[0] || 'No tags' : 'No tags'}
                              </span>
                            </div>
                            <div className={`absolute inset-0 pointer-events-none opacity-5 ${colors.bg}`} />
                          </Link>
                        </motion.article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Type</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Name</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Description</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Tags</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Created</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((item: any, index: number) => {
                          const colors = itemColors[item.itemType as keyof typeof itemColors];
                          return (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {item.itemType === 'prompt' ? (
                                    <MessageSquare className={`h-4 w-4 ${colors.icon}`} />
                                  ) : item.itemType === 'agent' ? (
                                    <Code className={`h-4 w-4 ${colors.icon}`} />
                                  ) : (
                                    <Wrench className={`h-4 w-4 ${colors.icon}`} />
                                  )}
                                  <span className={`text-xs font-medium ${colors.icon} uppercase tracking-wider`}>
                                    {item.itemType}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Link
                                  href={`/${item.itemType}/${item.id}`}
                                  className="text-white hover:text-blue-400 transition-colors font-medium"
                                >
                                  {item.name || 'Untitled'}
                                </Link>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-white/70 text-sm line-clamp-2 max-w-xs">
                                  {item.description || 'No description provided'}
                                </p>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(item.tags) && item.tags.length > 0 ? (
                                    item.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                      <span
                                        key={tagIndex}
                                        className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.border} border`}
                                      >
                                        {tag}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-white/40">No tags</span>
                                  )}
                                  {Array.isArray(item.tags) && item.tags.length > 3 && (
                                    <span className="text-xs text-white/40">+{item.tags.length - 3} more</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <time className="text-xs text-white/60" dateTime={item.created_at}>
                                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </time>
                              </td>
                              <td className="py-3 px-4">
                                <Link
                                  href={`/${item.itemType}/${item.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors text-sm font-medium"
                                >
                                  View
                                </Link>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center text-white/70 py-12 text-sm"
                >
                  No {selectedTab === 'all' ? 'public works' : selectedTab} found.
                </motion.div>
              )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md text-sm font-medium border border-gray-700 bg-black/80 text-white/80 hover:bg-gray-900 transition-all duration-200 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  aria-label="Previous page"
                >
                  Prev
                </button>
                {/* Page numbers */}
                {pageNumbers.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-md text-sm font-medium border border-gray-700 ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-black/80 text-white/80 hover:bg-gray-900'} transition-all duration-200`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md text-sm font-medium border border-gray-700 bg-black/80 text-white/80 hover:bg-gray-900 transition-all duration-200 ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </motion.section>
        </div>
        <Footer />
      </main>
    </>
  );
}
