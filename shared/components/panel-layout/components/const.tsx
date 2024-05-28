import {
  Blocks,
  CircleGauge,
  LayoutDashboard,
  LockKeyhole,
  SquareChevronRight,
  Settings,
  User,
  Building2,
  LogOut,
  CandlestickChart,
  BookOpenText,
  FileText,
} from 'lucide-react';
import { DISCORD, NAVIGATION, PLATFORM } from '@/shared/constants/links';
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
    icon: <CandlestickChart />,
    title: 'Pricing',
    link: NAVIGATION.PRICING,
  },
  {
    icon: <BookOpenText />,
    title: 'Get demo',
    link: NAVIGATION.GET_DEMO,
  },
  {
    title: 'Docs',
    link: NAVIGATION.PRICING,
    icon: <FileText />,
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
      icon: <CircleGauge size={20} />,
      title: 'Billing & Usage',
      link: PLATFORM.USAGE
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
      icon: <SquareChevronRight size={24} />,
      title: 'Playground',
      link: PLATFORM.PLAYGROUND,
    },
    {
      icon: <LockKeyhole size={24} />,
      title: 'API keys',
      link: PLATFORM.API_KEYS,
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
          link: PLATFORM.ACCOUNT,
        },
        {
          title: 'Organization',
          link: PLATFORM.ORGANIZATION,
        },
      ],
    },
  ],
};
