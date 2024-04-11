'use client';
import { cn } from '@/shared/utils/cn';
import {
  Blocks,
  CircleGauge,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  SquareChevronRight,
  User,
  X,
  ChevronsLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import Logo from '../../icons/Logo';
import { PLATFORM } from '@/shared/constants/links';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger
} from '../../ui/drawer';
import { Button } from '../../ui/Button';

const panelMenu: {
  icon?: React.ReactNode;
  title: string;
  link: string;
  items?: { title: string; link: string }[];
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
    icon: <User size={24} />,
    title: 'Account',
    link: PLATFORM.ACCOUNT
    /*     items: [
      {
        title: 'Profile',
        link: PLATFORM.ACCOUNT_PROFILE
      },
      {
        title: 'billing',
        link: PLATFORM.ACCOUNT_BILLING
      }
    ] */
  }
];

const collapsedMenu = 'collapsedMenu';
const PanelLayoutSidebar = () => {
  const path = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
    localStorage.setItem(collapsedMenu, JSON.stringify(!isCollapsed));
  }

  useEffect(() => {
    const value = localStorage.getItem(collapsedMenu);
    if (value) {
      setIsCollapsed(JSON.parse(value));
    }
  }, []);

  return (
    <>
      {/* desktop */}
      <div
        className={cn(
          'flex flex-col relative flex-shrink-0 max-w-[250px] w-full transition-all ease-out duration-300 translate-x-0 h-screen border-r border-gray-900 max-lg:hidden',
          isCollapsed && 'max-w-0 -translate-x-full'
        )}
      >
        <Button
          onClick={toggleSidebar}
          className={cn(
            'rounded-full absolute -right-4 top-9 max-w-8 h-8 w-full cursor-pointer flex p-0 transition-all duration-300 shadow-md',
            isCollapsed &&
              'rounded-l-[12px] rounded-r-sm top-28 -right-10 max-w-[none] w-12 h-[30px]'
          )}
        >
          {isCollapsed ? <Menu /> : <ChevronsLeft />}
        </Button>
        <div
          className={cn(
            'flex flex-col justify-between p-4 w-full h-screen visible',
            isCollapsed && 'invisible'
          )}
        >
          <div className="h-full">
            <div>
              {/* logo */}
              <Logo />
            </div>

            {/* menu */}
            <div className="mt-8">
              {panelMenu.map((item, index) => (
                <div className="flex flex-col gap-2" key={index}>
                  <Link
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
                  {/* sub items */}
                  {item.link === path && item.items?.length && (
                    <div className="flex flex-col gap-2">
                      {item.items?.map((subItem) => (
                        <Link
                          href={subItem.link}
                          className={cn(
                            'pl-10  py-1 group flex items-center justify-start hover:bg-primary hover:text-white rounded-md outline-none',
                            subItem.link === path && 'bg-primary text-white'
                          )}
                        >
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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
      </div>

      {/* mobile */}
      <div className="lg:hidden">
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <div className="flex w-full h-auto py-2 backdrop-blur-md bg-background/70 top-0 absolute z-[20] ">
              <Button className="text-foreground" variant="link">
                <Menu />
              </Button>
            </div>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col h-full w-[300px] mt-24 fixed bottom-0 rounded-none">
            <div className="p-4 bg-background flex-1 h-full flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <div className="flex items-center w-[40px] h-[40px] min-w-[40px]">
                  <Logo />
                </div>
                <h2 className="font-bold text-primary">SWARMS</h2>
              </div>
              <DrawerClose className="absolute top-4 right-4">
                <X />
              </DrawerClose>
              <div className="flex flex-col gap-1">
                {panelMenu.map((item, index) => (
                  <div className="flex flex-col gap-2" key={index}>
                    <Link
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
                    {/* sub items */}
                    {item.link === path && item.items?.length && (
                      <div className="flex flex-col gap-2">
                        {item.items?.map((subItem) => (
                          <Link
                            href={subItem.link}
                            className={cn(
                              'pl-10  py-1 group flex items-center justify-start hover:bg-primary hover:text-white rounded-md outline-none',
                              subItem.link === path && 'bg-primary text-white'
                            )}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default PanelLayoutSidebar;
