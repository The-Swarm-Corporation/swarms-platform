import {
  Blocks,
  CircleGauge,
  LayoutDashboard,
  LockKeyhole,
  SquareChevronRight,
  Settings,
  User,
  Building2,
  LogOut
} from 'lucide-react';
import { DISCORD, NAVIGATION, PLATFORM } from '@/shared/constants/links';
import Discord from '@/shared/components/icons/Discord';

type MenuProps = {
  icon?: React.ReactNode;
  title: string;
  link: string;
  items?: { title: string; link: string }[];
};

type NavMenuPropsKeys = 'account' | 'internal' | 'external';

type NavMenuProps = {
  [K in NavMenuPropsKeys]: MenuProps[];
};

export const SIDE_BAR_MENU: MenuProps[] = [
  {
    icon: <LayoutDashboard size={24} />,
    title: 'Dashboard',
    link: PLATFORM.DASHBOARD
  },
  {
    icon: <SquareChevronRight size={24} />,
    title: 'Playground',
    link: PLATFORM.PLAYGROUND
  },
  {
    icon: <Blocks size={24} />,
    title: 'Explorer',
    link: PLATFORM.EXPLORER
  },
  {
    icon: <LockKeyhole size={24} />,
    title: 'API keys',
    link: PLATFORM.API_KEYS
  },
  {
    icon: <CircleGauge size={24} />,
    title: 'Usage',
    link: PLATFORM.USAGE
  },
  {
    icon: <Settings size={24} />,
    title: 'Settings',
    link: PLATFORM.ACCOUNT,
    items: [
      {
        title: 'Account',
        link: PLATFORM.ACCOUNT
      },
      {
        title: 'Organization',
        link: PLATFORM.ORGANIZATION
      }
    ]
  }
];

export const NAV_LINKS: NavMenuProps = {
  internal: [
    {
      title: 'Pricing',
      link: NAVIGATION.PRICING
    },
    {
      title: 'Get Demo',
      link: NAVIGATION.GET_DEMO
    }
  ],
  external: [
    {
      title: 'Docs',
      link: NAVIGATION.PRICING
    }
  ],
  account: [
    {
      icon: <User size={20} />,
      title: 'Manage account',
      link: PLATFORM.ACCOUNT
    },
    {
      icon: <Building2 size={20} />,
      title: 'Organization',
      link: PLATFORM.ORGANIZATION
    },
    {
      icon: <Discord />,
      title: 'Community',
      link: DISCORD
    },
    {
      icon: <CircleGauge size={20} />,
      title: 'Billing & Usage',
      link: PLATFORM.USAGE
    },
    {
      icon: <LogOut size={20} />,
      title: 'Sign out',
      link: ''
    }
  ]
};
