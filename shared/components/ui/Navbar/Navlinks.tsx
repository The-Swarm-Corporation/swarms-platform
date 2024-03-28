'use client';

import Link from 'next/link';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import Logo from '@/shared/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/shared/utils/auth-helpers/settings';
import s from './Navbar.module.css';
import { DISCORD, PLATFORM, SWARMS_GITHUB } from '@/shared/constants/links';
import { cn } from '@/shared/utils/cn';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex flex-shrink-0 items-center ">
        <div className="flex items-center w-[40px] h-[40px] min-w-[40px]">
          <Logo />
        </div>
        <nav className="flex ml-2 md:ml-6 gap-3">
          <Link href="/pricing" className={s.link}>
            Pricing
          </Link>
          <Link href={SWARMS_GITHUB} className={cn(s.link, 'hidden md:inline')}>
            GitHub
          </Link>
          <Link href={DISCORD} className={cn(s.link, 'hidden md:inline')}>
            Community
          </Link>
          <Link href="https://swarms.apac.ai/en/latest/" className={s.link}>
              Docs
            </Link>
          {user && (
            <Link href={PLATFORM.DASHBOARD} className={s.link}>
              Dashboard
            </Link>
          )}
        </nav>
      </div>
      <div className="flex justify-end items-center space-x-8 w-full">
        {user ? (
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()} />
            <button type="submit" className={s.link}>
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/signin" className={s.link}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
