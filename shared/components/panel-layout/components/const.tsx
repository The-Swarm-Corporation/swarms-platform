import React from 'react';

import {
  Blocks,
  CircleGauge,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  User,
  Building2,
  LogOut,
  FileText,
  FileSpreadsheet,
  GripVertical,
  MessageSquareMore,
  Atom,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import { DISCORD, NAVIGATION, PLATFORM } from '@/shared/utils/constants';
import Discord from '@/shared/components/icons/Discord';

type MenuProps = {
  icon?: React.ReactNode;
  title: string;
  link: string;
  isMobileEnabled?: boolean;
  items?: { title: string; link: string }[];
  color?: string;
  className?: string;
};

export type NavMenuPropsKeys = 'account' | 'external' | 'base' | 'platform';

type NavMenuProps = {
  [K in NavMenuPropsKeys]?: MenuProps[];
};

const navItemClass = "p-2 rounded-md bg-gray-50/5 hover:bg-gray-50/10 transition-colors duration-200";

const SHARED_LINKS: MenuProps[] = [
  {
    icon: <Blocks className="text-blue-500" />,
    title: 'Marketplace',
    link: '/',
    className: navItemClass,
  },
  {
    title: 'Docs',
    link: NAVIGATION.DOCS,
    icon: <FileText className="text-purple-500" />,
    className: navItemClass,
  },
  {
    title: 'Learn More',
    link: NAVIGATION.LEARN_MORE,
    icon: <Lightbulb className="text-yellow-500" />,
    className: navItemClass,
  },
];

export const NAV_LINKS: NavMenuProps = {
  external: SHARED_LINKS,
  account: [
    {
      icon: <User size={20} className="text-gray-400" />,
      title: 'Manage account',
      link: PLATFORM.ACCOUNT,
      className: navItemClass,
    },
    {
      icon: <Building2 size={20} className="text-gray-400" />,
      title: 'Organization',
      link: PLATFORM.ORGANIZATION,
      className: navItemClass,
    },
    {
      icon: <Discord />,
      title: 'Community',
      link: DISCORD,
      className: navItemClass,
    },
    {
      icon: <LogOut size={20} className="text-red-500" />,
      title: 'Sign out',
      link: '',
      className: navItemClass,
    },
  ],
};

export const SIDE_BAR_MENU: NavMenuProps = {
  base: SHARED_LINKS,
  platform: [
    {
      icon: <LayoutDashboard size={24} className="text-emerald-500" />,
      title: 'Dashboard',
      link: PLATFORM.DASHBOARD,
      className: navItemClass,
    },
    {
      icon: <Blocks size={24} className="text-blue-500" />,
      title: 'Marketplace',
      link: PLATFORM.EXPLORER,
      className: navItemClass,
    },
    {
      icon: <Atom size={24} className="text-gray-400" />,
      title: 'Apps',
      link: PLATFORM.APPS,
      className: navItemClass,
    },
    {
      icon: <MessageSquareMore size={24} className="text-indigo-500" />,
      title: 'Chat',
      link: PLATFORM.CHAT,
      className: navItemClass,
    },
    {
      icon: <FileSpreadsheet size={24} className="text-green-500" />,
      title: 'Spreadsheet Swarm',
      link: PLATFORM.SPREADSHEET,
      className: navItemClass,
    },
    {
      icon: <GripVertical size={24} className="text-orange-500" />,
      title: 'Drag & Drop',
      link: PLATFORM.DRAG_N_DROP,
      className: navItemClass,
    },
    {
      icon: <LockKeyhole size={24} className="text-red-500" />,
      title: 'API Keys',
      link: PLATFORM.API_KEYS,
      className: navItemClass,
    },
    {
      icon: <CircleGauge size={24} className="text-cyan-500" />,
      title: 'Telemetry',
      link: PLATFORM.TELEMETRY,
      className: navItemClass,
    },
    {
      icon: <Trophy size={24} className="text-yellow-500" />,
      title: 'Leaderboard',
      link: PLATFORM.LEADERBOARD,
      className: navItemClass,
    },
    {
      icon: <Settings size={24} className="text-gray-400" />,
      title: 'Settings',
      link: PLATFORM.ACCOUNT,
      className: navItemClass,
      items: [
        {
          title: 'Account',
          link: PLATFORM.ACCOUNT,
        },
        {
          title: 'History',
          link: PLATFORM.HISTORY,
        },
        {
          title: 'Referral',
          link: PLATFORM.REFERRAL,
        },
        {
          title: 'Organization',
          link: PLATFORM.ORGANIZATION,
        },
      ],
    },
  ],
};
