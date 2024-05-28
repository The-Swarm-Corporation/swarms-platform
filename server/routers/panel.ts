import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { User } from '@supabase/supabase-js';
import {
  createOrRetrieveStripeCustomer,
  getUserCredit,
} from '@/shared/utils/supabase/admin';
import { stripe } from '@/shared/utils/stripe/config';
import Stripe from 'stripe';
import { Tables } from '@/types_db';
import { userAPICluster } from '@/shared/utils/api/usage';
import { isEmpty } from '@/shared/utils/helpers';

const panelRouter = router({
  getUserCredit: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const { credit, free_credit } = await getUserCredit(user.id);
    return credit + free_credit;
  }),
  getUserCreditPlan: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const { data, error } = await ctx.supabase
      .from('users')
      .select('credit_plan')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user credit plan',
      });
    }

    return data;
  }),
  getUserFreeCredits: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const { data, error } = await ctx.supabase
      .from('users')
      .select('had_free_credits')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching users',
      });
    }

    if (!data?.had_free_credits) {
      console.log('User already has no free credits yet');
      return; // User already has no free credits yet
    }

    const { data: credits, error: creditError } = await ctx.supabase
      .from('swarms_cloud_users_credits')
      .select('free_credit')
      .eq('user_id', user.id)
      .single();

    if (creditError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user free credits',
      });
    }

    return credits.free_credit;
  }),
  updateUserCreditPlan: userProcedure
    .input(z.object({ credit_plan: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.session?.user as User;

      const userCredit = await getUserCredit(user.id);

      if (input.credit_plan === 'invoice' && userCredit.credit_count < 3) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You need at least three(3) manual credit payments before switching to invoice plan',
        });
      }

      const stripeCustomerId = await createOrRetrieveStripeCustomer({
        email: user.email ?? '',
        uuid: user.id,
      });

      if (!stripeCustomerId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while creating stripe customer',
        });
      }
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });

      if (!paymentMethods.data.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Please add a payment method in the "Manage Cards" section to switch to invoice plan',
        });
      }

      const customer = (await stripe.customers.retrieve(
        stripeCustomerId,
      )) as Stripe.Customer;
      if (!customer || !customer.invoice_settings.default_payment_method) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'No default payment method found. Click on added card to set as default',
        });
      }

      const credits = await ctx.supabase
        .from('users')
        .update({
          credit_plan: input.credit_plan as Tables<'users'>['credit_plan'],
        })
        .eq('id', user.id);

      if (credits.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while updating user credit plan',
        });
      }
      return true;
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
        message: 'Error while fetching user onboarding status',
      });
    }
    return {
      basic_onboarding_completed:
        userOnboarding.data.basic_onboarding_completed,
      full_name: userOnboarding.data.full_name,
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
        signup_reason: z.string().optional(),
        about_company: z.string().optional(),
      }),
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
          message: 'Error while updating user onboarding status',
        });
      }
      return true;
    }),
  getUsageAPICluster: userProcedure
    .input(
      z.object({
        month: z.date(),
      }),
    )
    .mutation(async ({ ctx, input: { month } }) => {
      const user = ctx.session.data.session?.user as User;

      const cluster = await userAPICluster(user.id, month);

      if (cluster.status !== 200) {
        throw new Error(cluster.message);
      }

      if (isEmpty(cluster.user)) {
        return null;
      }

      return cluster.user;
    }),
});

export default panelRouter;
