'use client';

import Logo from '@/shared/components/icons/Logo';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import React from 'react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

const pathnames = [
  '/signin',
  '/signup',
  '/pricing',
  '/prompt/',
  '/tool/',
  '/swarms'
];
function AuthModal() {
  const { isAuthModalOpen } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => router.push('/signin');
  const handleSignup = () => router.push('/signin/signup');

  if (pathnames.some((name) => pathname?.includes(name))) {
    return null;
  }

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={() => null}>
      <DialogContent
        hideCloseButton
        className={cn('max-w-sm', isAuthModalOpen && '!block')}
      >
        <div className="flex justify-center height-screen-helper">
          <div className="flex flex-col justify-between p-3 m-auto w-80 text-center ">
            <div className="flex justify-center pb-8 ">
              <Logo width={50} height={50} />
            </div>
            <h2 className="text-lg md:text-2xl">
              Welcome To The Agent Marketplace
            </h2>
            <p className="mt-2 text-sm md:text-lg text-gray-400">
              Sign in or Sign Up to enter The Agent Marketplace.
            </p>

            <div className="flex flex-col w-full mt-8">
              <Button onClick={handleLogin}>Log in</Button>

              <Button variant="outline" onClick={handleSignup} className="mt-2">
                Sign up
              </Button>
            </div>

            <Link
              href="/signin/email_signin"
              className="text-xs mt-2 underline text-center"
            >
              Sign in via magic link
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
