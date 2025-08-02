'use client';

import { cn } from '@/shared/utils/cn';
import { LogIn, LogOut, Keyboard, Bookmark } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { SIDE_BAR_MENU } from '../const';
import SidebarMobile from './components/sidebar-mobile';
import NavItem from '../item';
import LoadingSpinner from '@/shared/components/loading-spinner';
import Link from 'next/link';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useStarredApps } from '@/shared/components/starred-apps-context';
import { AnimatePresence, motion } from 'framer-motion';

// Map APPS ids to sidebar titles for robust matching
const appIdToSidebarTitle = {
  dashboard: 'Dashboard',
  marketplace: 'Marketplace',
  registry: 'Registry',
  appstore: 'App Store',
  apps: 'Apps',
  chat: 'Chat',
  spreadsheet: 'Spreadsheet Swarm',
  dragndrop: 'Drag & Drop',
  leaderboard: 'Leaderboard',
  apikeys: 'API Keys',
  telemetry: 'Telemetry',
  settings: 'Settings',
  profile: 'Profile',
  bookmarks: 'Bookmarks',
  playground: 'Playground',
};

const PanelLayoutSidebar = () => {
  const { user } = useAuthContext();
  const path = usePathname();
  const router = useRouter();
  const [showTitle, setShowTitle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { starred } = useStarredApps();

  // Always show the Apps page in the sidebar
  const appsMenuItem = SIDE_BAR_MENU.platform?.find(
    (item) => item.title.toLowerCase() === 'apps',
  );
  const bookmarksMenuItem = SIDE_BAR_MENU.platform?.find(
    (item) => item.title.toLowerCase() === 'bookmarks',
  );
  let filteredMenu = [];
  if (starred.length === 0) {
    filteredMenu = SIDE_BAR_MENU.platform || [];
  } else {
    filteredMenu =
      SIDE_BAR_MENU.platform?.filter((item) =>
        starred.includes(
          Object.keys(appIdToSidebarTitle).find(
            (id) =>
              appIdToSidebarTitle[id as keyof typeof appIdToSidebarTitle] ===
              item.title,
          ) || '',
        ),
      ) || [];
    // Ensure Apps page is always present
    if (
      appsMenuItem &&
      !filteredMenu.some((item) => item.title.toLowerCase() === 'apps')
    ) {
      filteredMenu.splice(2, 0, appsMenuItem); // Insert after Marketplace (index 2)
    }
  }

  async function handleSignOut(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await handleRequest(e, SignOut, router);

      if (success) {
        toast({
          title: "You're logged out successfully",
          variant: 'destructive',
        });
      }
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
          'w-16 transition-all duration-150 ease-out translate-x-0 max-lg:hidden',
          showTitle && 'w-64',
        )}
      />
      <div
        className={cn(
          'flex flex-col fixed flex-shrink-0 w-16 border-r border-gray-800 transition-all ease-out duration-150 translate-x-0 h-screen max-lg:hidden shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] z-[9999] bg-white dark:bg-black',
          showTitle && 'w-64',
        )}
      >
        <div
          onMouseEnter={() => setShowTitle(true)}
          onMouseLeave={() => setShowTitle(false)}
          className="flex flex-col h-full"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col p-4 space-y-2">
              {/* menu */}
              <div className="flex-grow">
                <AnimatePresence>
                  {filteredMenu?.map((item, index) => {
                    const isSubMenuActive = item.items?.some(
                      (subItem) => subItem.link === path,
                    );
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <NavItem
                          {...item}
                          showTitle={showTitle}
                          isIcon
                          className={cn(
                            'p-2 py-2 my-1 hover:bg-gray-700/40 hover:text-white rounded-lg hover:shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] bg-gray-800/20 border border-gray-700/30',
                            item.link === path &&
                              'bg-gray-700/40 text-white [&_svg]:text-white shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] border-gray-600',
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
                                  'pl-10 py-1 hover:bg-gray-700/40 hover:text-white rounded-lg bg-gray-800/20 border border-gray-700/30',
                                  subItem.link === path &&
                                    'bg-gray-700/40 text-white [&_svg]:text-white shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] border-gray-600',
                                )}
                                showTitle
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Fixed bottom section */}
          <div className="flex-shrink-0 p-4 space-y-2 border-t border-gray-800">
            {/* Command K reminder */}
            <div className="p-2 py-2 hover:bg-gray-700/40 hover:text-white rounded-lg hover:shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] bg-gray-800/20 border border-gray-700/30">
              <div className="flex items-center justify-start cursor-pointer w-full">
                <Keyboard size={20} className="mr-2" />
                {showTitle && (
                  <div className="flex items-center gap-2">
                    <span>Command Bar</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800 border border-gray-700 rounded">
                      ⌘K
                    </kbd>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sign out/Login button */}
            <div className="p-2 py-2 hover:bg-destructive hover:text-white rounded-lg hover:shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] bg-gray-800/20 border border-gray-700/30">
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
                        <LogOut size={20} className="mr-2" />
                        {showTitle && <span>Sign out</span>}
                      </p>
                    )}
                  </button>
                </form>
              ) : (
                <Link href="/signin" className="cursor-pointer">
                  <button className="flex items-center justify-start w-full">
                    <LogIn size={20} className="mr-2" />
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
