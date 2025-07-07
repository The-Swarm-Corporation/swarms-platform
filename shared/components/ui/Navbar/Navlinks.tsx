'use client';

import React from 'react';
import Link from 'next/link';
import { SignOut } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import Logo from '@/shared/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/shared/utils/auth-helpers/settings';
import s from './Navbar.module.css';
import { DISCORD, PLATFORM, SWARMS_GITHUB, TWITTER } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '../drawer';
import { Button } from '../button';
import { Menu, X, Twitter } from 'lucide-react';
import { useAuthContext } from '../auth.provider';
import { motion, AnimatePresence } from 'framer-motion';
import Discord from '@/shared/components/icons/Discord';

export default function Navlinks() {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname();
  const { user } = useAuthContext();

  const isSwarmsPath = pathname === '/swarms';

  const navButtonClass =
    'relative px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm backdrop-blur-sm border border-white/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]';
  const activeNavButtonClass =
    'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]';

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const glowEffect =
    'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-primary/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300';

  return (
    <div className="relative flex flex-row justify-between py-2 align-center md:py-6 px-4">
      <div className="flex flex-shrink-0 items-center">
        {/* desktop */}
        <motion.div
          className="flex items-center w-[40px] h-[40px] min-w-[40px] max-md:hidden"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Logo />
        </motion.div>
        <nav className="flex ml-2 md:ml-6 gap-4 max-md:hidden">
          {!isSwarmsPath && (
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href="https://github.com/kyegomez/swarms"
                className={cn(navButtonClass, glowEffect)}
              >
                Github
              </Link>
            </motion.div>
          )}
          {!isSwarmsPath && (
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={DISCORD}
                className={cn(navButtonClass, glowEffect, 'hidden md:inline')}
              >
                Community
              </Link>
            </motion.div>
          )}
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="https://docs.swarms.world/en/latest/"
              className={cn(navButtonClass, glowEffect)}
            >
              Docs
            </Link>
          </motion.div>
          {user && (
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={PLATFORM.DASHBOARD}
                className={cn(navButtonClass, glowEffect)}
              >
                Dashboard
              </Link>
            </motion.div>
          )}
        </nav>
        {/* mobile */}
        <div className="md:hidden">
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <Button
                className="text-white p-0 hover:bg-white/10 rounded-full"
                variant="ghost"
              >
                <Menu />
              </Button>
            </DrawerTrigger>

            <DrawerContent className="flex flex-col h-full w-[300px] mt-24 fixed bottom-0 rounded-none backdrop-blur-xl bg-background/80 border-r border-white/10">
              <div className="p-4 flex-1 h-full flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                  <motion.div
                    className="flex items-center w-[40px] h-[40px] min-w-[40px]"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Logo />
                  </motion.div>
                  <h2 className="font-bold text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    SWARMS
                  </h2>
                </div>
                <DrawerClose className="absolute top-4 right-4 hover:bg-white/10 rounded-full p-2 transition-colors">
                  <X />
                </DrawerClose>
                {!isSwarmsPath && (
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      href="/pricing"
                      className={cn(navButtonClass, glowEffect)}
                    >
                      Pricing
                    </Link>
                  </motion.div>
                )}
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href={SWARMS_GITHUB}
                    className={cn(navButtonClass, glowEffect)}
                  >
                    GitHub
                  </Link>
                </motion.div>
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href={DISCORD}
                    className={cn(navButtonClass, glowEffect)}
                  >
                    Community
                  </Link>
                </motion.div>
                {!isSwarmsPath && (
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      href="https://docs.swarms.world/en/latest/"
                      className={cn(navButtonClass, glowEffect)}
                    >
                      Docs
                    </Link>
                  </motion.div>
                )}
                {user && (
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      href={PLATFORM.DASHBOARD}
                      className={cn(navButtonClass, glowEffect)}
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                )}
                {/* Mobile Auth Buttons */}
                <div className="mt-auto border-t border-white/10 pt-4">
                  {user ? (
                    <form onSubmit={(e) => handleRequest(e, SignOut, router)} className="w-full">
                      <input
                        type="hidden"
                        name="pathName"
                        value={usePathname()?.toString()}
                      />
                      <motion.div
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full"
                      >
                        <button
                          type="submit"
                          className={cn(
                            navButtonClass,
                            'w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
                          )}
                        >
                          Sign out
                        </button>
                      </motion.div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <motion.div
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full"
                      >
                        <Link href="/signin" className={cn(navButtonClass, glowEffect, 'w-full text-center')}>
                          Sign In
                        </Link>
                      </motion.div>
                      <motion.div
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full"
                      >
                        <Link
                          href="/signin/signup"
                          className={cn(
                            navButtonClass,
                            'w-full text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]',
                          )}
                        >
                          Sign Up
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      {/* common - now with responsive classes */}
      <div className="flex justify-end items-center gap-3 w-full">
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
              <input
                type="hidden"
                name="pathName"
                value={usePathname()?.toString()}
              />
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <button
                  type="submit"
                  className={cn(
                    navButtonClass,
                    'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
                  )}
                >
                  Sign out
                </button>
              </motion.div>
            </form>
          ) : (
            <>
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Link href="/signin" className={cn(navButtonClass, glowEffect)}>
                  Sign In
                </Link>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href="/signin/signup"
                  className={cn(
                    navButtonClass,
                    'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]',
                  )}
                >
                  Sign Up
                </Link>
              </motion.div>
            </>
          )}
        </div>
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="hidden sm:block"
        >
          <Link
            href="https://cal.com/swarms"
            className={cn(navButtonClass, glowEffect)}
          >
            Customer Support
          </Link>
        </motion.div>
        <div className="hidden sm:flex items-center space-x-2">
          <a
            href={DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 text-white rounded-md border border-white/15 backdrop-blur-sm bg-black/40 hover:bg-white/10 hover:border-primary/50 hover:text-primary transition-all duration-300"
          >
            <Discord className="w-5 h-5" />
          </a>
          <a
            href={TWITTER}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 text-white rounded-md border border-white/15 backdrop-blur-sm bg-black/40 hover:bg-white/10 hover:border-primary/50 hover:text-primary transition-all duration-300"
          >
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
