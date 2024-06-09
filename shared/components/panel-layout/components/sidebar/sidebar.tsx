'use client';

import { cn } from '@/shared/utils/cn';
import { LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { SIDE_BAR_MENU } from '../const';
import SidebarMobile from './components/sidebar-mobile';
import NavItem from '../item';

const PanelLayoutSidebar = () => {
  const path = usePathname();
  const router = useRouter();
  const [showTitle, setShowTitle] = useState(true);

  return (
    <>
      {/* desktop */}
      <div
        className={cn(
          'max-w-[250px] w-full transition-all ease-out duration-300 translate-x-0 max-lg:hidden',
        )}
      />
      <div
        className={cn(
          'flex flex-col fixed flex-shrink-0 max-w-[250px] w-full transition-all ease-out duration-300 translate-x-0 min-h-screen border-r border-gray-900 max-lg:hidden',
          !showTitle && 'max-w-[90px]',
        )}
      >
        <div
          onMouseEnter={() => setShowTitle(true)}
          onMouseLeave={() => setShowTitle(false)}
          className={cn(
            'flex flex-col justify-between p-4 w-full h-screen visible',
            // isOn && 'invisible',
          )}
        >
          <div className="flex flex-col h-[88%] w-[90%]">
            {/* menu */}
            <div className="flex-grow mt-3">
              {SIDE_BAR_MENU.platform?.map((item, index) => {
                const isSubMenuActive = item.items?.some(
                  (subItem) => subItem.link === path,
                );
                return (
                  <div key={index}>
                    <NavItem
                      {...item}
                      showTitle = {showTitle}
                      isIcon
                      className={cn(
                        'p-2 py-3 my-1 hover:bg-destructive hover:text-white rounded-md',
                        (isSubMenuActive || item.link === path) &&
                          'bg-primary text-white',
                      )}
                    />
                    {/* sub items */}
                    {isSubMenuActive && item.items?.length && (
                      <div className="flex flex-col gap-2">
                        {item.items?.map((subItem) => (
                          <NavItem

                            {...subItem}
                            className={cn(
                              'pl-10  py-1  hover:bg-primary hover:text-white rounded-md',
                              subItem.link === path &&
                                'border border-gray-400 dark:text-white',
                            )}
                            showTitle
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-2 py-3 hover:bg-destructive hover:text-white rounded-md">
              <form
                onSubmit={(e) => handleRequest(e, SignOut, router)}
                className="w-full"
              >
                <input type="hidden" name="pathName" value={usePathname()?.toString()} />
                <button type="submit" className="flex items-center justify-start  w-full">
                  <LogOut size={24} className="mr-2" /> 
                  {showTitle && <span>SignOut</span>}
                </button>
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
