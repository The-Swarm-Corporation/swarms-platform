'use client';

import { createClient } from '@/shared/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/shared/utils/helpers';
import { redirectToPath } from './server';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string | null | undefined>,
  router: AppRouterInstance | null = null,
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const redirectUrl = await requestFunc(formData);

  if (!redirectUrl) {
    return;
  }

  if (router) {
    router.push(redirectUrl);
  } else {
    await redirectToPath(redirectUrl);
  }

  return true;
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const provider = String(formData.get('provider')).trim() as Provider;
  
  const referralCode = String(formData.get('referralCode') || '').trim();
  
  const supabase = createClient();
  const baseRedirectURL = getURL('/auth/callback');
  
  
  const redirectURL = referralCode 
    ? `${baseRedirectURL}?code_ref=${encodeURIComponent(referralCode)}` 
    : baseRedirectURL;
  
  await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: redirectURL,
    },
  });
}
