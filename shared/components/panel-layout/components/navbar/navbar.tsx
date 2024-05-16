'use client';

import { LogIn } from 'lucide-react';
import { useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
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

export default function PlatformNavBar({ user }: { user: User | null }) {
  const dropdownRef = useRef(null);
  const path = usePathname();
  const router = useRouter();
  const { isOn, setOn, setOff } = useToggle();

  useOnClickOutside(dropdownRef, setOff);
  return (
    <header className="fixed max-sm:flex max-sm:items-center w-full top-0 backdrop-blur-sm bg-black shadow-md z-40 transition-all duration-150 px-4 py-2 h-16 md:h-20">
      <nav className="flex items-center justify-between max-sm:w-full relative">
        <div className="flex items-center w-4/5 sm:w-1/2 xl:w-1/3">
          <div className="flex items-center w-[40px] h-[40px] min-w-[40px] max-lg:hidden mr-4">
            <Logo />
          </div>

          <NavbarSearch />
        </div>
        <div className="flex items-center space-x-4">
          <ul className="p-0 hidden items-center sm:flex">
            {NAV_LINKS.external?.map((item) => (
              <li key={item.title}>
                <NavItem
                  {...item}
                  className={cn(
                    'text-white p-2 py-3 my-1 hover:text-primary',
                    item.link === path && 'text-primary',
                  )}
                />
              </li>
            ))}
          </ul>
          <div
            className="relative ml-5 cursor-pointer max-sm:mt-1"
            onClick={setOn}
          >
            {user?.user_metadata?.avatar_url ? (
              <Image
                src={user?.user_metadata?.avatar_url}
                alt="profile"
                height={32}
                width={32}
                className="rounded-full"
              />
            ) : (
              user?.user_metadata?.email && (
                <div className="bg-secondary flex justify-center items-center h-8 w-8 rounded-full uppercase">
                  {user?.user_metadata?.email?.charAt(0)}
                </div>
              )
            )}
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
                <NavItem title={user?.user_metadata?.email} />
                <span
                  title="Active user"
                  className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm border border-input bg-secondary text-foreground font-medium shadow-sm hover:bg-accent hover:text-accent-foreground h-8 py-2 gap-[6px] rounded-full px-2"
                >
                  A+
                </span>
              </li>
              {NAV_LINKS.account?.map((item, index, array) => {
                const isLast = index === array.length - 1;
                return (
                  <li
                    key={item.title}
                    className={cn(
                      'p-4 text-sm hover:bg-destructive hover:text-white ',
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
                          className="w-full"
                          onSubmit={(e) => handleRequest(e, SignOut, router)}
                        >
                          <input
                            type="hidden"
                            name="pathName"
                            value={usePathname()?.toString()}
                          />
                          <button
                            type="submit"
                            className="flex items-center w-full"
                          >
                            Sign out
                          </button>
                        </NavItem>
                      ) : (
                        <NavItem
                          link="/signin"
                          title="Sign in"
                          isIcon
                          icon={<LogIn size={20} />}
                        />
                      )
                    ) : (
                      <NavItem {...item} isIcon />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
