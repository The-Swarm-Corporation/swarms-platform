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
} from 'lucide-react';
import { DISCORD, NAVIGATION, PLATFORM } from '@/shared/utils/constants';
import Discord from '@/shared/components/icons/Discord';

type MenuProps = {
  icon?: React.ReactNode;
  title: string;
  link: string;
  isMobileEnabled?: boolean;
  items?: { title: string; link: string }[];
};

export type NavMenuPropsKeys = 'account' | 'external' | 'base' | 'platform';

type NavMenuProps = {
  [K in NavMenuPropsKeys]?: MenuProps[];
};

const SHARED_LINKS: MenuProps[] = [
  {
    icon: <Blocks />,
    title: 'Marketplace',
    link: '/',
  },
  {
    title: 'Docs',
    link: NAVIGATION.DOCS,
    icon: <FileText />,
  },
  {
    title: 'Learn More',
    link: NAVIGATION.LEARN_MORE,
    icon: <Lightbulb />,
  },
];

export const NAV_LINKS: NavMenuProps = {
  external: SHARED_LINKS,
  account: [
    {
      icon: <User size={20} />,
      title: 'Manage account',
      link: PLATFORM.ACCOUNT,
    },
    {
      icon: <Building2 size={20} />,
      title: 'Organization',
      link: PLATFORM.ORGANIZATION,
    },
    {
      icon: <Discord />,
      title: 'Community',
      link: DISCORD,
    },
    {
      icon: <LogOut size={20} />,
      title: 'Sign out',
      link: '',
    },
  ],
};

export const SIDE_BAR_MENU: NavMenuProps = {
  base: SHARED_LINKS,
  platform: [
    {
      icon: <LayoutDashboard size={24} />,
      title: 'Dashboard',
      link: PLATFORM.DASHBOARD,
    },
    {
      icon: <Blocks size={24} />,
      title: 'Explorer',
      link: PLATFORM.EXPLORER,
    },
    {
      icon: <MessageSquareMore size={24} />,
      title: 'Chat',
      link: PLATFORM.CHAT,
    },
    {
      icon: <FileSpreadsheet size={24} />,
      title: 'Spreadsheet Swarm',
      link: PLATFORM.SPREADSHEET,
    },
    {
      icon: <GripVertical size={24} />,
      title: 'Drag & Drop',
      link: PLATFORM.DRAG_N_DROP,
    },
    {
      icon: <LockKeyhole size={24} />,
      title: 'API Keys',
      link: PLATFORM.API_KEYS,
    },
    {
      icon: <CircleGauge size={24} />,
      title: 'Telemetry',
      link: PLATFORM.TELEMETRY,
    },
    {
      icon: <Settings size={24} />,
      title: 'Settings',
      link: PLATFORM.ACCOUNT,
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
