'use client';
import { cn } from '@/shared/utils/cn';
import {
  CircleGauge,
  LayoutDashboard,
  LockKeyhole,
  SquareChevronRight,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import Logo from '../icons/Logo';
import { PLATFORM } from '@/shared/constants/links';

const panelMenu: {
  icon?: React.ReactNode;
  title: string;
  link: string;
}[] = [
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
    icon: <User size={24} />,
    title: 'Account',
    link: PLATFORM.ACCOUNT
  }
];

const PanelLayoutSidebar = () => {
  const path = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col justify-between p-4 w-full h-screen">
        <div className="h-full">
          <div>
            {/* logo */}
            <Logo />
          </div>

          {/* menu */}
          <div className="mt-8">
            {panelMenu.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className={cn(
                  'group flex items-center justify-start p-2 py-3 my-1 hover:bg-primary hover:text-white rounded-md outline-none',
                  item.link === path && 'bg-primary text-white'
                )}
              >
                {item.icon && (
                  <span
                    className={cn(
                      'mr-2 text-black dark:text-white group-hover:text-white',
                      item.link === path && 'text-white'
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="p-2">
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()} />
            <button type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PanelLayoutSidebar;
