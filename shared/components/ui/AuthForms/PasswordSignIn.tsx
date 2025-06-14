'use client';

import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { signInWithPassword } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod,
}: PasswordSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  return (
    <div className="my-8 space-y-6">
      <form
        noValidate={true}
        className="mb-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="grid gap-4">
          <div className="grid gap-3">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="w-full p-3 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              placeholder="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full p-3 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
          <Button
            variant="outline"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            loading={isSubmitting}
          >
            Sign in
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-zinc-400">Other options</span>
          </div>
        </div>

        <div className="grid gap-3">
          <Link 
            href="/signin/forgot_password"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Forgot your password?
          </Link>

          {allowEmail && (
            <Link 
              href="/signin/email_signin"
              className="w-full flex items-center justify-center px-4 py-2.5 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign in with magic link
            </Link>
          )}

          <Link 
            href="/signin/signup"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
