'use client';

import { Button } from '@/shared/components/ui/button';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { signUp } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// Define prop type with allowEmail boolean
interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function SignUp({ allowEmail, redirectMethod }: SignUpProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      setReferralCode(ref);
    }

    const fingerprintCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sf_rsint='))
      ?.split('=')[1];

    if (fingerprintCookie) {
      setFingerprint(fingerprintCookie);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);

    const formElement = e.currentTarget;

    if (
      referralCode &&
      !formElement.querySelector('input[name="referralCode"]')
    ) {
      const referralInput = document.createElement('input');
      referralInput.type = 'hidden';
      referralInput.name = 'referralCode';
      referralInput.value = referralCode;
      formElement.appendChild(referralInput);
    }

    if (
      fingerprint &&
      !formElement.querySelector('input[name="fingerprint"]')
    ) {
      const fingerprintInput = document.createElement('input');
      fingerprintInput.type = 'hidden';
      fingerprintInput.name = 'fingerprint';
      fingerprintInput.value = fingerprint;
      formElement.appendChild(fingerprintInput);
    }

    await handleRequest(e, signUp, router);
    setIsSubmitting(false);
  };

  return (
    <div className="my-8 space-y-6">
      {referralCode && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            You&apos;ve been referred by a friend! Sign up for free credits.
          </p>
        </div>
      )}

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
            {referralCode && (
              <input type="hidden" name="referralCode" value={referralCode} />
            )}
            {fingerprint && (
              <input type="hidden" name="fingerprint" value={fingerprint} />
            )}
          </div>
          <Button
            variant="outline"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            loading={isSubmitting}
          >
            Sign up
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-zinc-400">Or continue with</span>
          </div>
        </div>

        <div className="grid gap-3">
          <Link 
            href="/signin/password_signin"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign in with password
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
            href="/forgot-password"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
