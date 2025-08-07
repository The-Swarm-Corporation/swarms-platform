'use client';

import Logo from '@/shared/components/icons/Logo';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import React from 'react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import Web3SignIn from '@/shared/components/ui/AuthForms/Web3SignIn';

const pathnames = ['/signin', '/signup', '/pricing', '/tool/', '/prompt', '/agent', '/tool'];

function AuthModal() {
  const { isAuthModalOpen } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const conversationId = searchParams?.get('conversationId');
  const shareId = searchParams?.get('shareId');

  if (conversationId && shareId) {
    pathnames.push('/platform/chat');
  }

  const handleLogin = () => router.push('/signin');
  const handleSignup = () => router.push('/signin/signup');

  if (pathnames.some((name) => pathname?.includes(name) || pathname === '/')) {
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
            <DialogTitle className="text-lg md:text-2xl">
              Welcome To The Agent Marketplace
            </DialogTitle>
            <p className="mt-2 text-sm md:text-lg text-gray-400">
              Sign in or Sign Up to enter The Agent Marketplace.
            </p>

            <div className="flex flex-col w-full mt-8 space-y-4">
              {process.env.NEXT_PUBLIC_WEB3_AUTH_ENABLED === 'true' && (
                <div className="space-y-2">
                  <Web3SignIn redirectMethod="client" />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
