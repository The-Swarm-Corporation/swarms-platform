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
          'max-w-[80px] w-full transition-all duration-200 ease-out translate-x-0 max-lg:hidden',
          showTitle && 'max-w-[240px]',
        )}
      />
      <div
        className={cn(
          'flex flex-col fixed flex-shrink-0 max-w-[240px] border-r border-gray-800/50 w-full transition-all ease-out duration-200 translate-x-0 min-h-screen max-lg:hidden shadow-lg z-[9999] bg-white/95 dark:bg-black/95 backdrop-blur-sm',
          !showTitle && 'max-w-[80px]',
        )}
      >
        <div
          onMouseEnter={() => setShowTitle(true)}
          onMouseLeave={() => setShowTitle(false)}
          className={cn(
            'flex flex-col justify-between p-3 w-full h-screen visible',
          )}
        >
          <div className="flex flex-col h-[88%] w-full">
            {/* menu */}
            <div className="flex-grow mt-2">
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
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <NavItem
                        {...item}
                        showTitle={showTitle}
                        isIcon
                        className={cn(
                          'p-2.5 py-2.5 my-1 hover:bg-gray-700/30 hover:text-white rounded-lg hover:shadow-md transition-all duration-200 group',
                          item.link === path &&
                            'bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-white [&_svg]:text-white shadow-lg border border-gray-600/30',
                        )}
                      />
                      {/* sub items */}
                      {isSubMenuActive && showTitle && item.items?.length && (
                        <motion.div 
                          className="flex flex-col gap-1 ml-2 mt-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.items?.map((subItem) => (
                            <NavItem
                              {...subItem}
                              key={subItem.title}
                              className={cn(
                                'pl-8 py-1.5 hover:bg-gray-700/30 hover:text-white rounded-md transition-all duration-200 text-sm',
                                subItem.link === path &&
                                  'bg-gray-700/40 text-white [&_svg]:text-white shadow-md',
                              )}
                              showTitle
                            />
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {/* Command K reminder */}
            <div className="p-2.5 py-2.5 hover:bg-gray-700/30 hover:text-white rounded-lg hover:shadow-md transition-all duration-200 mb-2 group">
              <div className="flex items-center justify-start cursor-pointer w-full">
                <Keyboard size={20} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                {showTitle && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Command Bar</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800/50 border border-gray-700/50 rounded-md">
                      ⌘K
                    </kbd>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2.5 py-2.5 hover:bg-red-600/20 hover:text-red-400 rounded-lg hover:shadow-md transition-all duration-200 group">
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
                          <span className="mr-2 text-sm">Signing Out...</span>
                        )}{' '}
                        <LoadingSpinner />
                      </p>
                    ) : (
                      <p className="flex items-center justify-start">
                        <LogOut size={20} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                        {showTitle && <span className="text-sm">Sign out</span>}
                      </p>
                    )}
                  </button>
                </form>
              ) : (
                <Link href="/signin" className="cursor-pointer">
                  <button className="flex items-center justify-start w-full">
                    <LogIn size={20} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                    {showTitle && <span className="text-sm">Log in</span>}
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
