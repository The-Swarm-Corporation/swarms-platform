'use server';

import { createClient } from '@/shared/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getURL,
  getErrorRedirect,
  getStatusRedirect,
} from '@/shared/utils/helpers';
import { getAuthTypes } from '@/shared/utils/auth-helpers/settings';
import { PLATFORM } from '@/shared/utils/constants';
import { User } from '@supabase/supabase-js';
import {
  createOrRetrieveStripeCustomer,
  supabaseAdmin,
} from '../supabase/admin';
import {
  syncUserEmail,
  updateFreeCreditsOnSignin,
  updateReferralStatus,
} from '../api/user';
import { isDisposableEmail } from './fingerprinting';

function isValidEmail(email: string) {
  var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function afterSignin(user: User) {
  const stripeCustomerId = await createOrRetrieveStripeCustomer({
    email: user?.email || '',
    uuid: user.id,
  });
  if (user.email) {
    await Promise.all([
      syncUserEmail(user.id, user.email),
      updateFreeCreditsOnSignin(user.id),
      updateReferralStatus(user),
    ]);
  }
  return PLATFORM.EXPLORER;
}

export async function checkUserSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }
  return user;
}
export async function redirectToPath(path: string) {
  return redirect(path);
}

export async function SignOut(formData: FormData) {
  const pathName = String(formData.get('pathName')).trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return getErrorRedirect(
      pathName,
      'Hmm... Something went wrong.',
      'You could not be signed out.',
    );
  }
  return '/';
}

export async function signInWithEmail(formData: FormData) {
  const cookieStore = await cookies();
  const callbackURL = getURL('/auth/callback');

  const email = String(formData.get('email')).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    redirectPath = getErrorRedirect(
      '/signin/email_signin',
      'Invalid email address.',
      'Please try again.',
    );
  }

  const supabase = await createClient();
  let options = {
    emailRedirectTo: callbackURL,
    shouldCreateUser: true,
  };

  // If allowPassword is false, do not create a new user
  const { allowPassword } = getAuthTypes();
  if (allowPassword) options.shouldCreateUser = false;
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: options,
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/signin/email_signin',
      'You could not be signed in.',
      error.message,
    );
  } else if (data) {
    cookieStore.set('preferredSignInView', 'email_signin', { path: '/' });
    redirectPath = getStatusRedirect(
      '/signin/email_signin',
      'Success!',
      'Please check your email for a magic link. You may now close this tab.',
      true,
    );
  } else {
    redirectPath = getErrorRedirect(
      '/signin/email_signin',
      'Hmm... Something went wrong.',
      'You could not be signed in.',
    );
  }

  return redirectPath;
}

export async function requestPasswordUpdate(formData: FormData) {
  const callbackURL = getURL('/auth/reset_password');

  // Get form data
  const email = String(formData.get('email')).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    redirectPath = getErrorRedirect(
      '/signin/forgot_password',
      'Invalid email address.',
      'Please try again.',
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackURL,
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/signin/forgot_password',
      error.message,
      'Please try again.',
    );
  } else if (data) {
    redirectPath = getStatusRedirect(
      '/signin/forgot_password',
      'Success!',
      'Please check your email for a password reset link. You may now close this tab.',
      true,
    );
  } else {
    redirectPath = getErrorRedirect(
      '/signin/forgot_password',
      'Hmm... Something went wrong.',
      'Password reset email could not be sent.',
    );
  }

  return redirectPath;
}

export async function signInWithPassword(formData: FormData) {
  const cookieStore = await cookies();
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  let redirectPath: string | undefined;

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log('Supabase Auth Error:', error.message);
    redirectPath = getErrorRedirect(
      '/signin/password_signin',
      'Sign in failed.',
      error.message,
    );
  } else if (data.user) {
    cookieStore.set('preferredSignInView', 'password_signin', { path: '/' });
    return await afterSignin(data.user);
  } else {
    redirectPath = getErrorRedirect(
      '/signin/password_signin',
      'Hmm... Something went wrong.',
      'You could not be signed in.',
    );
  }

  return redirectPath;
}

export async function signUp(formData: FormData, req?: Request) {
  const callbackURL = getURL('/auth/callback');

  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  const referralCode = String(formData.get('referralCode') || '').trim();
  const fingerprint = String(formData.get('fingerprint') || '').trim();

  let redirectPath: string;

  if (!isValidEmail(email)) {
    redirectPath = getErrorRedirect(
      '/signin/signup',
      'Invalid email address.',
      'Please try again.',
    );
    return redirectPath;
  }

  if (isDisposableEmail(email)) {
    redirectPath = getErrorRedirect(
      '/signin/signup',
      'Invalid email provider.',
      'Please use a valid, non-temporary email provider.',
    );
    return redirectPath;
  }

  const supabase = await createClient();

  let referrerId = null;
  if (referralCode) {
    const { data: referrerData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    referrerId = referrerData?.id;

    if (!referrerId) {
      redirectPath = getErrorRedirect(
        '/signin/signup',
        'Invalid referral code.',
        'Please try again with a valid code.',
      );
      return redirectPath;
    }

    if (await isReferralLimitReached(referrerId)) {
      redirectPath = getErrorRedirect(
        '/signin/signup',
        'Referral limit reached.',
        'This referral code has reached its daily limit. Please try again tomorrow.',
      );
      return redirectPath;
    }
  }

  if (fingerprint && (await checkRecentFingerprint(fingerprint))) {
    redirectPath = getErrorRedirect(
      '/signin/signup',
      'Sign-up limit reached.',
      'Please wait 24 hours before creating another account.',
    );
    return redirectPath;
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackURL,
      data: {
        referred_by: referralCode || null,
      },
    },
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/signin/signup',
      'Sign up failed.',
      error.message,
    );
  } else if (data.session) {
    if (referrerId) {
      await supabaseAdmin.from('swarms_cloud_users_referral').insert({
        referrer_id: referrerId,
        referred_id: data?.user?.id ?? '',
        status: 'Pending',
      });

      await supabaseAdmin
        .from('users')
        .update({ referred_by: referralCode })
        .eq('id', data?.user?.id ?? '');
    }

    if (fingerprint && data?.user?.id) {
      await trackSignupFingerprint(data.user.id, fingerprint);
    }

    redirectPath = getStatusRedirect('/', 'Success!', 'You are now signed in.');
  } else if (
    data.user &&
    data.user.identities &&
    data.user.identities.length == 0
  ) {
    redirectPath = getErrorRedirect(
      '/signin/signup',
      'Sign up failed.',
      'There is already an account associated with this email address. Try resetting your password.',
    );
  } else if (data.user) {
    if (referrerId) {
      await supabaseAdmin.from('swarms_cloud_users_referral').insert({
        referrer_id: referrerId,
        referred_id: data.user.id,
        status: 'Pending',
      });

      await supabaseAdmin
        .from('users')
        .update({ referred_by: referralCode })
        .eq('id', data.user.id);
    }

    if (fingerprint && data.user.id) {
      await trackSignupFingerprint(data.user.id, fingerprint);
    }

    redirectPath = getStatusRedirect(
      '/',
      'Success!',
      'Please check your email for a confirmation link. You may now close this tab.',
    );
  } else {
    redirectPath = getErrorRedirect(
      '/signin/signup',
      'Hmm... Something went wrong.',
      'You could not be signed up.',
    );
  }

  return redirectPath;
}
export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password')).trim();
  const passwordConfirm = String(formData.get('passwordConfirm')).trim();
  let redirectPath: string;

  // Check that the password and confirmation match
  if (password !== passwordConfirm) {
    redirectPath = getErrorRedirect(
      '/signin/update_password',
      'Your password could not be updated.',
      'Passwords do not match.',
    );
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/signin/update_password',
      'Your password could not be updated.',
      error.message,
    );
  } else if (data.user) {
    redirectPath = getStatusRedirect(
      '/',
      'Success!',
      'Your password has been updated.',
    );
  } else {
    redirectPath = getErrorRedirect(
      '/signin/update_password',
      'Hmm... Something went wrong.',
      'Your password could not be updated.',
    );
  }

  return redirectPath;
}

export async function updateEmail(formData: FormData) {
  // Get form data
  const newEmail = String(formData.get('newEmail')).trim();

  // Check that the email is valid
  if (!isValidEmail(newEmail)) {
    return getErrorRedirect(
      PLATFORM.ACCOUNT,
      'Your email could not be updated.',
      'Invalid email address.',
    );
  }

  const supabase = await createClient();

  const callbackUrl = getURL(
    getStatusRedirect(
      PLATFORM.ACCOUNT,
      'Success!',
      `Your email has been updated.`,
    ),
  );

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: callbackUrl,
    },
  );

  if (error) {
    return getErrorRedirect(
      PLATFORM.ACCOUNT,
      'Your email could not be updated.',
      error.message,
    );
  } else {
    return getStatusRedirect(
      PLATFORM.ACCOUNT,
      'Confirmation emails sent.',
      `You will need to confirm the update by clicking the links sent to both the old and new email addresses.`,
    );
  }
}

export async function updateName(formData: FormData) {
  // Get form data
  const fullName = String(formData.get('fullName')).trim();

  const supabase = await createClient();
  const { error, data } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) {
    return getErrorRedirect(
      PLATFORM.ACCOUNT,
      'Your name could not be updated.',
      error.message,
    );
  } else if (data.user) {
    return getStatusRedirect(
      PLATFORM.ACCOUNT,
      'Success!',
      'Your name has been updated.',
    );
  } else {
    return getErrorRedirect(
      PLATFORM.ACCOUNT,
      'Hmm... Something went wrong.',
      'Your name could not be updated.',
    );
  }
}

export async function trackSignupFingerprint(
  userId: string,
  fingerprint: string,
) {
  const { data, error } = await supabaseAdmin.from('user_fingerprints').insert({
    user_id: userId,
    fingerprint,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error tracking user fingerprint:', error);
  }

  return !error;
}
export async function checkRecentFingerprint(
  fingerprint: string,
): Promise<boolean> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { count, error } = await supabaseAdmin
    .from('user_fingerprints')
    .select('created_at', { count: 'exact', head: true })
    .eq('fingerprint', fingerprint)
    .gte('created_at', oneDayAgo.toISOString());

  if (error) {
    console.error('Error checking recent fingerprint:', error);
    return false;
  }

  return (count ?? 0) > 2;
}

export async function countRecentReferrals(
  referrerId: string,
): Promise<number> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data, error } = await supabaseAdmin
    .from('swarms_cloud_users_referral')
    .select('id')
    .eq('referrer_id', referrerId)
    .gte('created_at', oneDayAgo.toISOString());

  if (error) {
    console.error('Error counting recent referrals:', error);
    return 0;
  }

  return data?.length || 0;
}

export async function isReferralLimitReached(
  referrerId: string,
): Promise<boolean> {
  const MAX_REFERRALS_PER_DAY = 5;
  const recentReferrals = await countRecentReferrals(referrerId);
  return recentReferrals >= MAX_REFERRALS_PER_DAY;
}
