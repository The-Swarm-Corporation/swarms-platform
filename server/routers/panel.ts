import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { User } from '@supabase/supabase-js';
import { generateApiKey } from '@/shared/utils/helpers';
import { createPaymentSession } from '@/shared/utils/stripe/client';
import { getUserCredit } from '@/shared/utils/supabase/admin';
import {
  getSubscriptionStatus,
  getUserStripeCustomerId
} from '@/shared/utils/stripe/server';
const panelRouter = router({
  // api key page
  getApiKeys: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const apiKeys = await ctx.supabase
      .from('swarms_cloud_api_keys')
      .select('id, name, is_deleted, created_at, key')
      .eq('user_id', user.id)
      .or(`is_deleted.eq.false, is_deleted.is.null`)
      .order('created_at', { ascending: false });

    return apiKeys.data?.map((row) => ({
      ...row,
      key: `${row?.key?.slice(0, 5)}.....${row?.key?.slice(-5)}`
    }));
  }),
  addApiKey: userProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.session?.user as User;
      // check subscription status
      const sub = await getSubscriptionStatus(user);
      if (sub.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Subscription is required'
        });
      }
      const name = input.name.trim();
      if (name == '') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Name is required'
        });
      }

      if (name == 'playground') {
        // error
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'cannot create api key with name "playground"'
        });
      }
      try {
        const key = generateApiKey();
        const newApiKey = await ctx.supabase
          .from('swarms_cloud_api_keys')
          .insert({ name: name, key, user_id: user.id });
        if (!newApiKey.error) {
          return {
            key,
            name
          };
        }
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while adding new api key'
        });
      }
    }),
  deleteApiKey: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.session?.user as User;
      const apiKey = await ctx.supabase
        .from('swarms_cloud_api_keys')
        .select('*')
        .eq('id', input)
        .eq('user_id', user.id)
        .single();
      // dont allow delete 'playground' api key
      if (apiKey.error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid api key'
        });
      }

      if (apiKey.data.name == 'playground') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete playground api key'
        });
      }
      const updatedApiKey = await ctx.supabase
        .from('swarms_cloud_api_keys')
        .update({ is_deleted: true })
        .eq('id', input)
        .eq('user_id', user.id);
      if (!updatedApiKey.error) {
        return true;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while deleting api key'
      });
    }),
  // payment
  createStripePaymentSession: userProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const customer = await getUserStripeCustomerId(user);
    if (!customer) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while creating stripe customer'
      });
    }

    const stripeSession = await createPaymentSession(user.id);
    return stripeSession.url;
  }),
  getUserCredit: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const userCredit = await getUserCredit(user.id);
    return userCredit;
  }),

  // onboarding
  getOnboarding: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const userOnboarding = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (userOnboarding.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user onboarding status'
      });
    }
    return {
      basic_onboarding_completed:
        userOnboarding.data.basic_onboarding_completed,
      full_name: userOnboarding.data.full_name
    };
  }),
  updateOnboarding: userProcedure
    .input(
      z.object({
        full_name: z.string().optional(),
        company_name: z.string().optional(),
        job_title: z.string().optional(),
        country_code: z.string().optional(),
        basic_onboarding_completed: z.boolean(),
        referral: z.string().optional(),
        signup_reason: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.session?.user as User;
      const updatedOnboarding = await ctx.supabase
        .from('users')
        .update(input)
        .eq('id', user.id);
      if (updatedOnboarding.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while updating user onboarding status'
        });
      }
      return true;
    })
});

export default panelRouter;
