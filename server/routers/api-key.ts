import { publicProcedure, router, userProcedure } from '@/app/api/trpc/trpc-router';
import { generateApiKey } from '@/shared/utils/helpers';
import { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { stripe } from '@/shared/utils/stripe/config';
import Stripe from 'stripe';
import {
  createOrRetrieveStripeCustomer,
  getUserCredit,
} from '@/shared/utils/supabase/admin';

const apiKeyRouter = router({
  // api key page
  getApiKeys: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user as User;
    const apiKeys = await ctx.supabase
      .from('swarms_cloud_api_keys')
      .select('id, name, is_deleted, created_at, key')
      .eq('user_id', user.id)
      .or(`is_deleted.eq.false, is_deleted.is.null`)
      .order('created_at', { ascending: false });

    return apiKeys.data?.map((row) => ({
      ...row,
      key: `${row?.key?.slice(0, 5)}.....${row?.key?.slice(-5)}`,
    }));
  }),
  addApiKey: userProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;
      const name = input.name.trim();

      if (!user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      if (name === '') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Name is required',
        });
      }

      if (name === 'playground') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot create API key with name "playground"',
        });
      }

      // Retrieve or create Stripe customer
      const stripeCustomerId = await createOrRetrieveStripeCustomer({
        email: user.email ?? '',
        uuid: user.id,
      });

      if (!stripeCustomerId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while creating Stripe customer',
        });
      }

      const { credit, free_credit, referral_credits } = await getUserCredit(user.id);
      const totalCredit = credit + free_credit + referral_credits;

      if (totalCredit <= 0) {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
        });

        if (!paymentMethods.data.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message:
              'No credit available and payment method missing. Add a valid card to continue and click on added card to set as default',
          });
        }
      }

      try {
        const key = generateApiKey();
        const newApiKey = await ctx.supabase
          .from('swarms_cloud_api_keys')
          .insert({ name: name, key, user_id: user.id });

        if (!newApiKey.error) {
          return { key, name };
        }
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while adding new API key',
        });
      }
    }),

  deleteApiKey: userProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;
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
          message: 'Invalid api key',
        });
      }

      if (apiKey.data.name === 'playground') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete playground api key',
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
        message: 'Error while deleting api key',
      });
    }),

  getValidApiKey: publicProcedure
    .input(z.object({ isShareId: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.isShareId) {
        const userId = process.env.DEFAULT_USER_ID ?? '';

        const { data, error } = await ctx.supabase
          .from('swarms_cloud_api_keys')
          .select('id, name, is_deleted, created_at, key')
          .eq('user_id', userId)
          .not('is_deleted', 'eq', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        return data?.[0] ?? null;
      }

      const user = ctx.session.data.user as User;

      if (!user || !user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const { data, error } = await ctx.supabase
        .from('swarms_cloud_api_keys')
        .select('id, name, is_deleted, created_at, key')
        .eq('user_id', user.id)
        .not('is_deleted', 'eq', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      return data?.[0] ?? null;
    }),

  createDefaultApiKey: userProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.data.user as User;

    if (!user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      const existingKeys = await ctx.supabase
        .from('swarms_cloud_api_keys')
        .select('id')
        .eq('user_id', user.id)
        .not('is_deleted', 'eq', true)
        .limit(1);

      if (existingKeys.data && existingKeys.data.length > 0) {
        return null;
      }

      const stripeCustomerId = await createOrRetrieveStripeCustomer({
        email: user.email ?? '',
        uuid: user.id,
      });

      if (!stripeCustomerId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while creating Stripe customer',
        });
      }

      const { credit, free_credit, referral_credits } = await getUserCredit(user.id);
      const totalCredit = credit + free_credit + referral_credits;

      if (totalCredit <= 0) {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
        });

        if (!paymentMethods.data.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No credit available and payment method missing.',
          });
        }
      }

      const key = generateApiKey();
      const defaultName = `Auto-generated-${user.id}`;

      const newApiKey = await ctx.supabase
        .from('swarms_cloud_api_keys')
        .insert({ name: defaultName, key, user_id: user.id });

      if (newApiKey.error) {
        throw new Error(newApiKey.error.message);
      }

      return { key, name: defaultName };
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error while automatically creating API key: ${e instanceof Error ? e.message : 'Unknown error'}`,
      });
    }
  }),
});

export default apiKeyRouter;
