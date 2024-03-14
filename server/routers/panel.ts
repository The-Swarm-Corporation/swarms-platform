import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { User } from '@supabase/supabase-js';
import { generateApiKey } from '@/shared/utils/helpers';
import { createPaymentSession } from '@/shared/utils/stripe/client';
import { getUserCredit } from '@/shared/utils/supabase/admin';
import {
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
      if (input.name.trim() == '') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Name is required'
        });
      }
      try {
        const user = ctx.session.data.session?.user as User;
        const key = generateApiKey();
        const newApiKey = await ctx.supabase
          .from('swarms_cloud_api_keys')
          .insert({ name: input.name, key, user_id: user.id });
        if (!newApiKey.error) {
          return {
            key,
            name: input.name
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
});

export default panelRouter;
