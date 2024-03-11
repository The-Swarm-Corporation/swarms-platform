import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { User } from '@supabase/supabase-js';
import { generateApiKey, getURL } from '@/shared/utils/helpers';
import { createPaymentSession } from '@/shared/utils/stripe/client';
import { getUserCredit } from '@/shared/utils/supabase/admin';
import {
  checkoutWithStripe,
  createStripePortal
} from '@/shared/utils/stripe/server';
import { PLATFORM } from '@/shared/constants/links';
import { stripe } from '@/shared/utils/stripe/config';
import { SubscriptionWithPriceAndProduct } from '@/shared/models/supscription';
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
    console.log('user', user.id);

    const stripeSession = await createPaymentSession(user.id);
    return stripeSession.url;
  }),
  getUserCredit: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const userCredit = await getUserCredit(user.id);
    return userCredit;
  }),
  // subscription
  createSubscriptionCheckoutSession: userProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const stripe_product_id = process.env
      .NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRODUCT_ID as string;
    if (!stripe_product_id) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stripe product id not found'
      });
    }
    const res = await ctx.supabase
      .from('prices')
      .select('*')
      .eq('id', stripe_product_id)
      .eq('type', 'recurring')
      .single();
    console.log('res', res);

    if (res.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while getting stripe price'
      });
    }
    const productRow = res.data;
    if (!productRow) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stripe price not found'
      });
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      productRow,
      PLATFORM.ACCOUNT
    );
    if (errorRedirect) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: errorRedirect
      });
    } else {
      return sessionId as string;
    }
  }),
  createStripePortalLink: userProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const url = await createStripePortal(
      user,
      `${getURL()}${PLATFORM.ACCOUNT}`
    );
    return url;
  }),
  getSubscriptionStatus: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const { data } = await ctx.supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .eq('user_id', user.id)
      .in('status', ['trialing', 'active'])
      .maybeSingle();
    const subscription: SubscriptionWithPriceAndProduct | null = data;
    const subscriptionPrice =
      subscription &&
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: subscription?.prices?.currency!,
        minimumFractionDigits: 0
      }).format((subscription?.prices?.unit_amount || 0) / 100);
    return {
      status: subscription?.status,
      subscriptionPrice,
      isCanceled: subscription?.cancel_at_period_end,
      renewAt: subscription?.current_period_end
    };
  })
});

export default panelRouter;
