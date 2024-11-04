'use client';

import { cn } from '@/shared/utils/cn';
import { LogIn, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { SIDE_BAR_MENU } from '../const';
import SidebarMobile from './components/sidebar-mobile';
import NavItem from '../item';
import { User } from '@supabase/supabase-js';
import LoadingSpinner from '@/shared/components/loading-spinner';
import Link from 'next/link';

const PanelLayoutSidebar = ({ user }: { user: User | null }) => {
  const path = usePathname();
  const router = useRouter();
  const [showTitle, setShowTitle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut(e: FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    try {
      await handleRequest(e, SignOut, router);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

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
          'flex flex-col fixed flex-shrink-0 max-w-[250px] w-full transition-all ease-out duration-150 translate-x-0 min-h-screen max-lg:hidden shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] z-[9999] bg-white dark:bg-black',
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
                        'p-2 py-3 my-1 hover:bg-destructive hover:text-white rounded-md hover:shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]',
                        (isSubMenuActive || item.link === path) &&
                          'bg-primary text-white [&_svg]:text-white shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]',
                      )}
                    />
                    {/* sub items */}
                    {isSubMenuActive && showTitle && item.items?.length && (
                      <div className="flex flex-col gap-2">
                        {item.items?.map((subItem) => (
                          <NavItem
                            {...subItem}
                            key={subItem.title}
                            className={cn(
                              'pl-10  py-1  hover:bg-primary hover:text-white rounded-md ',
                              subItem.link === path &&
                                // 'border border-gray-400 dark:text-white',
                                'bg-primary text-white [&_svg]:text-white shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]',
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
            <div className="p-2 py-3 hover:bg-destructive hover:text-white rounded-md  hover:shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] ">
              {user ? (
                <form onSubmit={handleSignOut} className="w-full">
                  <input
                    type="hidden"
                    name="pathName"
                    value={usePathname()?.toString()}
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-start cursor-pointer w-full"
                  >
                    {isLoading ? (
                      <p className="flex items-center justify-start">
                        {showTitle && (
                          <span className="mr-2">Signing Out...</span>
                        )}{' '}
                        <LoadingSpinner />
                      </p>
                    ) : (
                      <p className="flex items-center justify-start">
                        <LogOut size={24} className="mr-2" />
                        {showTitle && <span>Sign out</span>}
                      </p>
                    )}
                  </button>
                </form>
              ) : (
                <Link href="/signin" className="cursor-pointer">
                  <button className="flex items-center justify-start  w-full">
                    <LogIn size={24} className="mr-2" />
                    {showTitle && <span>Log in</span>}
                  </button>
                </Link>
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
