'use client';

import Logo from '@/shared/components/icons/Logo';
import { DISCORD, PLATFORM, SWARMS_GITHUB } from '@/shared/constants/links';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { getRedirectMethod } from '@/shared/utils/auth-helpers/settings';
import { cn } from '@/shared/utils/cn';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SmoothScrollLink from '../../smooth-scroll/SmoothScrollLink';
import { Button } from '../Button';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '../drawer';
import s from './Navbar.module.css';
import ThemeToggler from './theme-toggler';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  return (
    <div className="relative flex flex-row justify-between py-2 align-center md:py-6 px-4">
      <div className="flex flex-shrink-0 items-center">
        {/* desktop */}
        <div className="flex items-center w-[40px] h-[40px] min-w-[40px] max-md:hidden">
          <Logo />
        </div>
        <nav className="flex ml-2 md:ml-6 gap-3 max-md:hidden">
          <SmoothScrollLink href="#get_started" className={s.link}>
            Get Started
          </SmoothScrollLink>
          <SmoothScrollLink href="#pricing" className={s.link}>
            Pricing
          </SmoothScrollLink>
          <Link href={SWARMS_GITHUB} className={cn(s.link, 'hidden md:inline link link--metis')}>
            GitHub
          </Link>
          <Link href={DISCORD} className={cn(s.link, 'hidden md:inline link link--metis')}>
            Community
          </Link>
          <Link href="https://swarms.apac.ai/en/latest/" className={cn(s.link, 'link link--metis')}>
            Docs
          </Link>
          {user && (
            <Link href={PLATFORM.DASHBOARD} className={cn(s.link, 'link link--metis')}>
              Dashboard
            </Link>
          )}
        </nav>
        {/* mobile */}
        <div className="md:hidden">
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <Button className="text-white p-0" variant="link">
                <Menu />
              </Button>
            </DrawerTrigger>

            <DrawerContent className="flex flex-col h-full w-[300px] mt-24 fixed bottom-0 rounded-none">
              <div className="p-4 bg-background flex-1 h-full flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                  <div className="flex items-center w-[40px] h-[40px] min-w-[40px]">
                    <Logo />
                  </div>
                  <h2 className="font-bold text-primary">SWARMS</h2>
                </div>
                <DrawerClose className="absolute top-4 right-4">
                  <X />
                </DrawerClose>
                <Link href="/pricing" className={cn(s.link, 'link link--metis')}>
                  Pricing
                </Link>
                <Link href={SWARMS_GITHUB} className={cn(s.link, 'link link--metis')}>
                  GitHub
                </Link>
                <Link href={DISCORD} className={cn(s.link, 'link link--metis')}>
                  Community
                </Link>
                <Link
                  href="https://swarms.apac.ai/en/latest/"
                  className={cn(s.link, 'link link--metis')}
                >
                  Docs
                </Link>
                {user && (
                  <Link href={PLATFORM.DASHBOARD} className={cn(s.link, 'link link--metis')}>
                    Dashboard
                  </Link>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      {/* common */}
      <div className="flex justify-end items-center gap-2 w-full">
        {user ? (
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()?.toString()} />
            <button type="submit" className={cn(s.link, 'link link--metis')}>
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/signin" className={cn(s.link, 'link link--metis')}>
            Sign In
          </Link>
        )}
        <Link href="/signin/signup" className={cn(s.link, 'link link--metis')}>
          Sign Up
        </Link>
        <Link href="https://calendly.com/swarm-corp/30min" className={cn(s.link, 'link link--metis')}>
          Get Demo
        </Link>
        <ThemeToggler />
      </div>
    </div>
  );
}
