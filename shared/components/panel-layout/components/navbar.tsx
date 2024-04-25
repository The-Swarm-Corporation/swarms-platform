'use client';

import Link from 'next/link';
import Logo from '@/shared/components/icons/Logo';
import { NAV_LINKS } from './const';
import { cn } from '@/shared/utils/cn';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import useToggle from '@/shared/hooks/toggle';
import { useOnClickOutside } from '@/shared/hooks/onclick-outside';
import { useRef } from 'react';

export default function PlatformNavBar({ user }: { user: User | null }) {
  const dropdownRef = useRef(null);
  const path = usePathname();
  const { isOn, toggle, setOff } = useToggle();

  useOnClickOutside(dropdownRef, setOff);
  console.log({ user });
  return (
    <header className="sticky top-0 backdrop-blur-md bg-background/70 shadow z-40 transition-all duration-150 px-4 py-2 h-16 md:h-20">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center w-[40px] h-[40px] min-w-[40px] max-md:hidden mr-5">
            <Logo />
          </div>
          <ul className="p-0 hidden items-center md:flex">
            {NAV_LINKS.internal?.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.link}
                  className={cn(
                    'flex items-center justify-start text-white p-2 py-3 my-1 hover:text-primary outline-none',
                    item.link === path && 'text-primary'
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center space-x-4">
          {NAV_LINKS.external?.map((item) => (
            <Link
              href={item.link}
              key={item.title}
              className={cn(
                'flex items-center justify-start text-white p-2 py-3 my-1 hover:text-primary outline-none',
                item.link === path && 'text-primary'
              )}
            >
              <span>{item.title}</span>
            </Link>
          ))}
          <div
            ref={dropdownRef}
            className="relative ml-5 cursor-pointer"
            onClick={toggle}
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
              className={cn(
                "absolute right-0 mt-4 w-52 group-hover:block z-10 p-0 translate-x-full transition duration-150 invisible bg-secondary bg-opacity-75 rounded-md shadow-lg before:content-[''] before:absolute before:translate-x-1/4 before:block before:border-[10px] before:border-solid before:border-white before:border-t-[transparent] before:border-r-[transparent] before:border-b-secondary before:border-l-[transparent] before:right-3 before:-top-5",
                isOn && 'translate-x-0 visible'
              )}
            >
              {NAV_LINKS.account?.map((item) => {
                return !item.link ? (
                  <li
                    key={item.title}
                    className={cn(
                      'group flex items-center justify-start p-3.5 text-sm hover:bg-destructive hover:text-white outline-none',
                      item.link === path && 'bg-primary text-white'
                    )}
                  >
                    {item.icon && (
                      <span
                        className={cn(
                          'mr-3 text-black dark:text-white group-hover:text-white',
                          item.link === path && 'text-white'
                        )}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span>{item.title}</span>
                  </li>
                ) : (
                  <li key={item.title}>
                    <Link
                      href={item.link}
                      className={cn(
                        'group flex items-center justify-start p-3.5 text-sm hover:bg-destructive hover:text-white outline-none',
                        item.link === path && 'bg-primary text-white'
                      )}
                    >
                      {item.icon && (
                        <span
                          className={cn(
                            'mr-3 text-black dark:text-white group-hover:text-white',
                            item.link === path && 'text-white'
                          )}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span>{item.title}</span>
                    </Link>
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
