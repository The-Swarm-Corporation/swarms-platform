import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { User } from '@supabase/supabase-js';
import { getUserCredit } from '@/shared/utils/supabase/admin';

type CreditPlan = 'default' | 'invoice';

const panelRouter = router({
  getUserCredit: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const { credit, free_credit } = await getUserCredit(user.id);
    return credit + free_credit;
  }),
  getUserCreditPlan: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const { data, error } = await ctx.supabase
      .from('swarms_cloud_users_credits')
      .select('credit_plan, credit_count')
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user credit plan',
      });
    }

    return data;
  }),
  updateUserCreditPlan: userProcedure
    .input(z.object({ credit_plan: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.session?.user as User;

      const userCredit = await getUserCredit(user.id);

      const invoices = await ctx.supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      if (invoices.error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Error while fetching user invoices',
        });
      }

      if (
        input.credit_plan === 'invoice' &&
        invoices.data.length < 5 &&
        userCredit.credit_count < 5
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You need at least five(5) credit payments before switching to invoice plan',
        });
      }

      const credits = await ctx.supabase
        .from('swarms_cloud_users_credits')
        .update({ credit_plan: input.credit_plan as CreditPlan })
        .eq('user_id', user.id);

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
});

export default panelRouter;
