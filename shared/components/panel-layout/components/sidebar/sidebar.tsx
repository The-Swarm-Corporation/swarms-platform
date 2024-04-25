'use client';

import { cn } from '@/shared/utils/cn';
import { Menu, ChevronsLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import useToggle from '@/shared/hooks/toggle';
import { Button } from '@/shared/components/ui/Button';
import { SIDE_BAR_MENU } from '../const';
import SidebarMobile from './components/sidebar-mobile';

const collapsedMenu = 'collapsedMenu';
const PanelLayoutSidebar = () => {
  const path = usePathname();
  const router = useRouter();
  const { isOn, toggle } = useToggle('off', collapsedMenu);

  return (
    <>
      {/* desktop */}
      <div
        className={cn(
          'max-w-[250px] w-full transition-all ease-out duration-300 translate-x-0 max-lg:hidden',
          isOn && 'max-w-0 -translate-x-full'
        )}
      />
      <div
        className={cn(
          'flex flex-col fixed flex-shrink-0 max-w-[250px] w-full transition-all ease-out duration-300 translate-x-0 min-h-screen border-r border-gray-900 max-lg:hidden',
          isOn && 'max-w-0 -translate-x-full'
        )}
      >
        <Button
          onClick={toggle}
          className={cn(
            'rounded-full absolute -right-4 top-9 max-w-8 h-8 w-full cursor-pointer flex p-0 transition-all duration-300 shadow-md',
            isOn &&
              'rounded-l-[12px] rounded-r-sm top-28 -right-10 max-w-[none] w-12 h-[30px]'
          )}
        >
          {isOn ? <Menu /> : <ChevronsLeft />}
        </Button>
        <div
          className={cn(
            'flex flex-col justify-between p-4 w-full h-screen visible',
            isOn && 'invisible'
          )}
        >
          <div className="h-3/4">
            {/* menu */}
            <div className="mt-12">
              {SIDE_BAR_MENU.platform?.map((item, index) => {
                const isSubMenuActive = item.items?.some(
                  (subItem) => subItem.link === path
                );
                return (
                  <div className="flex flex-col gap-2" key={index}>
                    <Link
                      href={item.link}
                      className={cn(
                        'group flex items-center justify-start p-2 py-3 my-1 hover:bg-destructive hover:text-white rounded-md outline-none',
                        (isSubMenuActive || item.link === path) &&
                          'bg-primary text-white'
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
                    {isSubMenuActive && item.items?.length && (
                      <div className="flex flex-col gap-2">
                        {item.items?.map((subItem) => (
                          <Link
                            href={subItem.link}
                            className={cn(
                              'pl-10  py-1 group flex items-center justify-start hover:bg-primary hover:text-white rounded-md outline-none',
                              subItem.link === path &&
                                'border border-gray-400 dark:text-white'
                            )}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-2">
              <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                <input type="hidden" name="pathName" value={usePathname()} />
                <button type="submit">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* mobile */}
      <SidebarMobile />
    </>
  );
};

export default PanelLayoutSidebar;
