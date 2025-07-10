'use client';

import { Github, LogIn, Coins, Twitter } from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/shared/components/icons/Logo';
import { cn } from '@/shared/utils/cn';
import { User } from '@supabase/supabase-js';
import useToggle from '@/shared/hooks/toggle';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { NAV_LINKS } from '../const';
import NavItem from '../item';
import NavbarSearch from './components/search';
import { trpc } from '@/shared/utils/trpc/trpc';
import Avatar from '@/shared/components/avatar';
import { NAVIGATION, SWARMS_GITHUB, DISCORD, TWITTER } from '@/shared/utils/constants';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import useSubscription from '@/shared/hooks/subscription';
import Discord from '@/shared/components/icons/Discord';

export default function PlatformNavBar() {
  const { user } = useAuthContext();
  const dropdownRef = useRef<HTMLUListElement>(null!);
  const path = usePathname();
  const router = useRouter();
  const { isOn, setOn, setOff } = useToggle();
  const subscription = useSubscription();

  const isChatInterface = path?.includes('/platform/chat');

  const getUser = trpc.main.getUser.useQuery(undefined, {
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const profileName = user
    ? getUser.data?.username || user?.user_metadata?.email
    : null;

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isSwarmsPath = path === '/swarms';

  const FILTERED_NAV_LINKS = useMemo(
    () =>
      !isSwarmsPath
        ? NAV_LINKS.external
        : NAV_LINKS.external
            ?.filter(
              (item) =>
                item.link !== NAVIGATION.PRICING &&
                item.link !== NAVIGATION.GET_DEMO,
            )
            .concat([
              {
                icon: <Github />,
                title: 'Github',
                link: SWARMS_GITHUB,
              },
            ]),
    [isSwarmsPath],
  );

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

  useOnClickOutside(dropdownRef, setOff);
  return (
    <header
      className={cn(
        'fixed w-full top-0 backdrop-blur-sm border-b border-gray-800 bg-black shadow-md transition-all duration-150 px-3 sm:px-4 py-2 h-14 sm:h-16 md:h-20',
        isChatInterface ? 'z-50' : 'z-[9999]',
      )}
    >
      <nav className="flex items-center justify-between w-full relative">
        <div className="flex items-center max-md:flex-1 max-md:min-w-0 md:w-1/2 xl:w-1/3">
          <div className="flex items-center w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] md:w-[40px] max-lg:hidden md:h-[40px] min-w-[32px] sm:min-w-[36px] md:min-w-[40px] mr-2 sm:mr-3 md:mr-4 flex-shrink-0">
            <Logo />
          </div>

          <NavbarSearch />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
          <ul className="p-0 hidden items-center sm:flex gap-1 md:gap-2">
            <li>
              <a
                href={DISCORD}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-white',
                  'rounded-md border border-white/15 backdrop-blur-sm bg-black/40 hover:bg-white/10 hover:border-primary/50 hover:text-primary',
                  'transition-all duration-300'
                )}
              >
                <Discord className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </li>
            <li>
              <a
                href={TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-white',
                  'rounded-md border border-white/15 backdrop-blur-sm bg-black/40 hover:bg-white/10 hover:border-primary/50 hover:text-primary',
                  'transition-all duration-300'
                )}
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </li>
            {FILTERED_NAV_LINKS?.map((item) => (
              <li key={item.title}>
                <NavItem
                  {...item}
                  className={cn(
                    'inline-flex items-center justify-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 my-1 font-medium text-xs sm:text-sm text-white',
                    'rounded-md border border-white/15 backdrop-blur-sm bg-black/40 hover:bg-white/10 hover:border-primary/50 hover:text-primary',
                    'transition-all duration-300 whitespace-nowrap',
                    item.link === path &&
                      'bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb,255,0,0),0.4)]',
                  )}
                  showTitle
                >
                  {item.title}
                </NavItem>
              </li>
            ))}
          </ul>
          {/* Credits Display */}
          {user && (
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-black/40 border border-white/15 rounded-md backdrop-blur-sm">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white/80 hidden sm:inline">Credits:</span>
              <span className="text-xs sm:text-sm font-semibold text-primary">
                {subscription.creditLoading
                  ? '...'
                  : `$${(subscription.credit ?? 0).toFixed(2)}`}
              </span>
            </div>
          )}
          <div
            className="relative ml-2 sm:ml-3 md:ml-5 cursor-pointer"
            onClick={setOn}
          >
            <Avatar user={user as User} profileName={profileName} />
            {user && (
              <ul
                ref={dropdownRef}
                className={cn(
                  "absolute right-0 mt-4 w-72 group-hover:block z-10 p-0 transition duration-150 invisible bg-black/85 text-white border border-secondary bg-opacity-75 rounded-md shadow-lg before:content-[''] before:absolute before:translate-x-1/4 before:block before:border-[10px] before:border-solid before:border-white before:border-t-[transparent] before:border-r-[transparent] before:border-b-secondary before:border-l-[transparent] before:right-3 before:-top-5",
                  isOn && 'translate-x-0 visible',
                )}
              >
                <li
                  className={cn(
                    'p-4 text-sm rounded-t-md border-b-slate-800 border-b flex justify-between items-center',
                  )}
                >
                  <NavItem title={profileName} />
                  <span
                    title="Active user"
                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-xs sm:text-sm border border-input bg-secondary text-foreground font-medium shadow-sm hover:bg-accent hover:text-accent-foreground h-7 sm:h-8 py-1 sm:py-2 gap-1 sm:gap-[6px] rounded-full px-1.5 sm:px-2"
                  >
                    <span className="hidden sm:inline">{profileName?.charAt(0)?.toUpperCase()}_swarms+</span>
                    <span className="sm:hidden">{profileName?.charAt(0)?.toUpperCase()}</span>
                  </span>
                </li>
                {NAV_LINKS.account?.map((item, index, array) => {
                  const isLast = index === array.length - 1;
                  return (
                    <li
                      key={item.title}
                      className={cn(
                        'text-sm hover:bg-destructive hover:text-white ',
                        item.link === path && 'bg-primary text-white',
                        isLast && 'rounded-b-md border-t-slate-800 border-t',
                      )}
                    >
                      {!item.link ? (
                        user?.role === 'authenticated' ? (
                          <NavItem
                            {...item}
                            as="form"
                            isIcon
                            className="w-full p-4"
                            onSubmit={handleSignOut}
                          >
                            <button
                              type="submit"
                              className="flex items-center w-full"
                            >
                              {isLoading ? 'Signin out...' : 'Sign out'}
                            </button>
                          </NavItem>
                        ) : (
                          <NavItem
                            link="/signin"
                            title="Sign in"
                            className="w-full p-4"
                            isIcon
                            icon={<LogIn size={20} />}
                            showTitle
                          />
                        )
                      ) : (
                        <NavItem {...item} isIcon showTitle />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
