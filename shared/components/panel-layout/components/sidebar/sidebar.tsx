'use client';

import { cn } from '@/shared/utils/cn';
import { LogIn, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { SIDE_BAR_MENU } from '../const';
import SidebarMobile from './components/sidebar-mobile';
import NavItem from '../item';
import { User } from '@supabase/supabase-js';

const PanelLayoutSidebar = ({ user }: { user: User | null }) => {
  const path = usePathname();
  const router = useRouter();
  const [showTitle, setShowTitle] = useState(false);

  return (
    <>
      {/* desktop */}
      <div
        className={cn(
          'max-w-[90px] w-full transition-all duration-150 ease-out translate-x-0 max-lg:hidden',
          showTitle && 'max-w-[250px]',
        )}
      />
      <div
        className={cn(
          'flex flex-col fixed flex-shrink-0 max-w-[250px] w-full transition-all ease-out duration-150 translate-x-0 min-h-screen border-r border-gray-900 max-lg:hidden',
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
                      showTitle={showTitle}
                      isIcon
                      className={cn(
                        'p-2 py-3 my-1 hover:bg-destructive hover:text-white rounded-md',
                        (isSubMenuActive || item.link === path) &&
                          'bg-primary text-white',
                      )}
                    />
                    {/* sub items */}
                    {isSubMenuActive && showTitle && item.items?.length && (
                      <div className="flex flex-col gap-2">
                        {item.items?.map((subItem) => (
                          <NavItem
                            {...subItem}
                            className={cn(
                              'pl-10  py-1  hover:bg-primary hover:text-white rounded-md',
                              subItem.link === path &&
                                // 'border border-gray-400 dark:text-white',
                                'bg-primary',
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
              {user ? (
                <form
                  onSubmit={(e) => handleRequest(e, SignOut, router)}
                  className="w-full"
                >
                  <input
                    type="hidden"
                    name="pathName"
                    value={usePathname()?.toString()}
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-start  w-full"
                  >
                    <LogOut size={24} className="mr-2" />
                    {showTitle && <span>SignOut</span>}
                  </button>
                </form>
              ) : (
                <button
                  type="submit"
                  className="flex items-center justify-start  w-full"
                >
                  <LogIn size={24} className="mr-2" />
                  {showTitle && <span>Log in</span>}
                </button>
              )}
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
