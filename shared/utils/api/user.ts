import { createClient } from '@/shared/utils/supabase/server';
import { supabaseAdmin } from '../supabase/admin';
import axios from 'axios';
import { User } from '@supabase/supabase-js';
import { isReferralLimitReached } from '../auth-helpers/server';
import { isDisposableEmail } from '../auth-helpers/fingerprinting';

// we use this method as patch , we added trigger for new users so their auth email will sync with postgres to users table.
export const syncUserEmail = async (id: string, email: string) => {
  if (!email || !id) return;
  try {
    const user = await supabaseAdmin
      .from('users')
      .select('id,email')
      .eq('id', id)
      .single();
    if (user.data?.id && !user.data?.email) {
      await supabaseAdmin.from('users').update({ email }).eq('id', id);
    }
  } catch (error) {
    console.error('syncUserEmail', id, error);
  }
};

export const getUserById = async (id: string) => {
  if (!id) return;
  try {
    const user = await supabaseAdmin
      .from('users')
      .select('id, email, username, full_name')
      .eq('id', id)
      .single();

    return user.data;
  } catch (error) {
    console.error('getUserById', id, error);
  }
};

export const updateReferralStatus = async (user: User) => {
  if (user.email && isDisposableEmail(user.email)) {
    console.warn(
      `Blocked referral credits for disposable email: ${user.email}`,
    );
    return;
  }

  const { data: referralData } = await supabaseAdmin
    .from('swarms_cloud_users_referral')
    .select('referrer_id, status')
    .eq('referred_id', user.id)
    .eq('status', 'Pending')
    .single();

  if (referralData) {
    if (await isReferralLimitReached(referralData.referrer_id)) {
      console.warn(
        `Referral limit reached for referrer: ${referralData.referrer_id}`,
      );
      return;
    }

    await supabaseAdmin
      .from('swarms_cloud_users_referral')
      .update({ status: 'Completed' })
      .eq('referred_id', user.id)
      .eq('referrer_id', referralData.referrer_id);

    const referralAmount = 20;

    await supabaseAdmin.rpc('add_referral_credits', {
      p_user_id: referralData.referrer_id,
      p_amount: referralAmount,
    });
  }
};

export const updateFreeCreditsOnSignin = async (id: string): Promise<void> => {
  'use server';

  if (!id) {
    return; // Early return for invalid input
  }

  try {
    // Fetch user data and check for existing free credits
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('had_free_credits')
      .eq('id', id)
      .single();

    if (user?.had_free_credits) {
      return; // User already has free credits
    }

    // Check for email confirmation
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user?.email_confirmed_at) {
      return; // User email not confirmed
    }

    // Update free credits and user flag
    const { error: creditError } = await supabaseAdmin
      .from('swarms_cloud_users_credits')
      .select('*')
      .eq('user_id', id)
      .single();

    if (creditError) {
      if (creditError.code === 'PGRST116') {
        // Insert a new entry with initial credit values
        await supabaseAdmin.from('swarms_cloud_users_credits').insert([
          {
            user_id: id,
            free_credit: 20,
          },
        ]);
      }
    } else {
      await supabaseAdmin
        .from('swarms_cloud_users_credits')
        .update({ free_credit: 20 })
        .eq('user_id', id);
    }

    await supabaseAdmin
      .from('users')
      .update({ had_free_credits: true })
      .eq('id', id);
  } catch (error) {
    console.error('Error updating free credits:', error);
  }
};
