import {
  Trophy,
  Star,
  Crown,
  Brain,
  Zap,
  Wrench,
  Medal,
  LucideIcon,
  MessageSquare,
  Bot,
} from 'lucide-react';

export interface UserStats {
  totalItems: number;
  prompts: number;
  agents: number;
  tools: number;
}

export interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  prompts: any[];
  agents: any[];
  tools: any[];
}

export type Category = 'total' | 'prompts' | 'agents' | 'tools';

export const BADGES = {
  CONTRIBUTOR: {
    id: 'contributor',
    name: 'Contributor',
    description: 'Created 5 or more works',
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    requirement: (stats: any) => stats.totalItems >= 5,
  },
  PROLIFIC: {
    id: 'prolific',
    name: 'Prolific Creator',
    description: 'Created 20 or more works',
    icon: Star,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    requirement: (stats: any) => stats.totalItems >= 20,
  },
  MASTER: {
    id: 'master',
    name: 'AI Master',
    description: 'Created 50 or more works',
    icon: Crown,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    requirement: (stats: any) => stats.totalItems >= 50,
  },
  PROMPT_MASTER: {
    id: 'prompt_master',
    name: 'Prompt Master',
    description: 'Created 10 or more prompts',
    icon: Brain,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    requirement: (stats: any) => stats.prompts >= 10,
  },
  AGENT_EXPERT: {
    id: 'agent_expert',
    name: 'Agent Expert',
    description: 'Created 10 or more agents',
    icon: Zap,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    requirement: (stats: any) => stats.agents >= 10,
  },
  TOOL_BUILDER: {
    id: 'tool_builder',
    name: 'Tool Builder',
    description: 'Created 10 or more tools',
    icon: Wrench,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    requirement: (stats: any) => stats.tools >= 10,
  },
};

export const TIERS = [
  {
    name: 'Novice',
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
    requirement: (stats: any) => stats.totalItems < 5,
  },
  {
    name: 'Contributor',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    requirement: (stats: any) => stats.totalItems >= 5 && stats.totalItems < 20,
  },
  {
    name: 'Expert',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    requirement: (stats: any) =>
      stats.totalItems >= 20 && stats.totalItems < 50,
  },
  {
    name: 'Master',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    requirement: (stats: any) => stats.totalItems >= 50,
  },
];

export type RankingBadge = {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  label: string;
};

export type RankingBadges = {
  [key: number]: RankingBadge;
};

export const RANKING_BADGES: RankingBadges = {
  1: {
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    label: 'Champion',
  },
  2: {
    icon: Trophy,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
    label: 'Runner-up',
  },
  3: {
    icon: Medal,
    color: 'text-amber-600',
    bg: 'bg-amber-600/10',
    border: 'border-amber-600/20',
    label: 'Bronze',
  },
};

export interface LeaderboardProps {
  search?: string;
  viewMode?: 'grid' | 'table';
}

export const CATEGORIES = [
  { id: 'total', label: 'Total Works', icon: Trophy },
  { id: 'prompts', label: 'Prompts', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'tools', label: 'Tools', icon: Wrench },
] as const;
