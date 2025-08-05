'use client';

import { Button } from '@/shared/components/ui/button';
import { signInWithOAuth } from '@/shared/utils/auth-helpers/client';
import { type Provider } from '@supabase/supabase-js';
import { Github, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Google from '@/shared/components/icons/Google';
import { useSearchParams } from 'next/navigation';
import TwitterX from '@/shared/components/icons/TwitterX';

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: JSX.Element;
  brandColor: string;
  hoverColor: string;
};

export default function OauthSignIn() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState('');

  const oAuthProviders: OAuthProviders[] = [
    {
      name: 'google',
      displayName: 'Google',
      icon: <Google />,
      brandColor: 'border-zinc-700',
      hoverColor: 'hover:border-zinc-600 hover:bg-zinc-700',
    },
    {
      name: 'github',
      displayName: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      brandColor: 'border-zinc-700',
      hoverColor: 'hover:border-zinc-600 hover:bg-zinc-700',
    },
    {
      name: 'twitter',
      displayName: 'X (Twitter)',
      icon: <TwitterX />,
      brandColor: 'border-zinc-700',
      hoverColor: 'hover:border-zinc-600 hover:bg-zinc-700',
    },
    /* Add desired OAuth providers here */
  ];

  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>(
    {},
  );

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem('referralCode', ref);
    }
  }, [searchParams]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    providerName: string,
  ) => {
    e.preventDefault();
    setIsSubmitting((prevState) => ({ ...prevState, [providerName]: true }));

    if (referralCode) {
      const formElement = e.currentTarget;

      if (!formElement.querySelector('input[name="referralCode"]')) {
        const referralInput = document.createElement('input');
        referralInput.type = 'hidden';
        referralInput.name = 'referralCode';
        referralInput.value = referralCode;
        formElement.appendChild(referralInput);
      }
    }

    await signInWithOAuth(e);

    setIsSubmitting((prevState) => ({ ...prevState, [providerName]: false }));
  };

  return (
    <div className="mt-8 space-y-4">
      {referralCode && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            You&apos;ve been referred by a friend! Sign up for free credits.
          </p>
        </div>
      )}

      {oAuthProviders.map((provider) => (
        <form
          key={provider.name}
          className="pb-2"
          onSubmit={(e) => handleSubmit(e, provider.name)}
        >
          <input type="hidden" name="provider" value={provider.name} />
          {referralCode && (
            <input type="hidden" name="referralCode" value={referralCode} />
          )}
          <Button
            type="submit"
            className={`w-full p-4 border ${provider.brandColor} ${provider.hoverColor} transition-all duration-200 ease-in-out bg-zinc-800 text-white font-medium hover:text-white`}
            loading={isSubmitting[provider.name] || false}
          >
            <span className="mr-3 flex items-center justify-center w-5 h-5">
              {provider.icon}
            </span>
            <span className="text-base">Continue with {provider.displayName}</span>
          </Button>
        </form>
      ))}
    </div>
  );
}
