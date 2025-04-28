import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { getURL } from '@/shared/utils/helpers';
import { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

const referralRouter = router({
  getUserReferralCode: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user as User;
    const { data, error } = await ctx.supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user referral code',
      });
    }

    const baseUrl = getURL();
    return {
      code: data.referral_code,
      link: `${baseUrl}signin/signup?ref=${data.referral_code}`,
    };
  }),

  getReferralStats: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user as User;

    const { data: referrals, error: referralsError } = await ctx.supabase
      .from('swarms_cloud_users_referral')
      .select('status, created_at')
      .eq('referrer_id', user.id);

    if (referralsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching referral data',
      });
    }

    const { data: credits, error: creditsError } = await ctx.supabase
      .from('swarms_cloud_users_credits')
      .select('referral_credits')
      .eq('user_id', user.id)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching referral credits',
      });
    }

    const totalSignups = referrals.length;
    const completedSignups = referrals.filter(
      (r) => r.status?.toLowerCase() === 'completed',
    ).length;
    const activeReferrals = completedSignups;
    const retentionRate =
      totalSignups > 0 ? (activeReferrals / totalSignups) * 100 : 0;
    const totalCredits = credits?.referral_credits || 0;
    const conversionRate =
      totalSignups > 0 ? (completedSignups / totalSignups) * 100 : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentSignups = referrals.filter(
      (r) => new Date(r.created_at) > oneWeekAgo,
    ).length;

    const olderSignups = totalSignups - recentSignups;
    const weeklyChange =
      olderSignups > 0
        ? ((recentSignups - olderSignups) / olderSignups) * 100
        : 0;

    return {
      totalSignups,
      weeklyChange,
      totalCredits,
      conversionRate,
      activeReferrals,
      retentionRate,
    };
  }),

  getReferralData: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user as User;

    const { data, error } = await ctx.supabase
      .from('swarms_cloud_users_referral')
      .select(
        `
          status, 
          created_at,
          referred:referred_id(
            id,
            email,
            full_name,
            username
          )
        `,
      )
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching referral details',
      });
    }

    return data.map((item: any) => ({
      id: item.referred?.id,
      name: item.referred?.username || item.referred?.full_name || 'User',
      email: item.referred?.email,
      date: new Date(item.created_at).toISOString().split('T')[0],
      status: item.status,
    }));
  }),
});

export default referralRouter;
