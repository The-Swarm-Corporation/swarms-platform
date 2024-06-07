'use client';

import { Button } from '@/shared/components/ui/Button';
import { signInWithOAuth } from '@/shared/utils/auth-helpers/client';
import { type Provider } from '@supabase/supabase-js';
import { Github } from 'lucide-react';
import { useState } from 'react';
import Google from '@/shared/components/icons/Google';

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: JSX.Element;
};

export default function OauthSignIn() {
  const oAuthProviders: OAuthProviders[] = [
    {
      name: 'google',
      displayName: 'Google',
      icon: <Google />,
    },
    {
      name: 'github',
      displayName: 'GitHub',
      icon: <Github className="h-5 w-5" />,
    },
    /* Add desired OAuth providers here */
  ];

  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, providerName: string) => {
    e.preventDefault();
    setIsSubmitting(prevState => ({ ...prevState, [providerName]: true })); // Disable the button while the request is being handled

    await signInWithOAuth(e);

    setIsSubmitting(prevState => ({ ...prevState, [providerName]: false }));
  };

  return (
    <div className="mt-8">
      {
        oAuthProviders.map((provider) => (
          <form
            key={provider.name}
            className="pb-2"
            onSubmit={(e) => handleSubmit(e, provider.name)}
          >
            <input type="hidden" name="provider" value={provider.name} />
            <Button
              variant="outline"
              type="submit"
              className="w-full p-4"
              loading={isSubmitting[provider.name] || false}
            >
              <span className="mr-2">{provider.icon}</span>
              <span>{provider.displayName}</span>
            </Button>
          </form>
        ))
      }
    </div>
  );
}
