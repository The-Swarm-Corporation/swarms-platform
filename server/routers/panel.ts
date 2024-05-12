import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { User } from '@supabase/supabase-js';
import { generateApiKey } from '@/shared/utils/helpers';
import { createPaymentSession } from '@/shared/utils/stripe/client';
import { getUserCredit } from '@/shared/utils/supabase/admin';
import {
  getSubscriptionStatus,
  getUserStripeCustomerId,
} from '@/shared/utils/stripe/server';
const panelRouter = router({
  getUserCredit: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const { credit, free_credit } = await getUserCredit(user.id);
    return credit + free_credit;
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
