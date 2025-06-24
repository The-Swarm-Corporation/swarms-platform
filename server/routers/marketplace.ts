import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { checkUserTrustworthiness } from '@/shared/services/fraud-prevention';
import { calculateCommission, validateCommissionCalculation } from '@/shared/utils/marketplace/commission';

const transactionLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

const marketplaceRouter = router({
  saveUserWallet: userProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { walletAddress } = input;
      const userId = ctx.session.data.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const existingWallet = await ctx.supabase
        .from('marketplace_user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingWallet.data) {
        const { error } = await ctx.supabase
          .from('marketplace_user_wallets')
          .update({
            wallet_address: walletAddress,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update wallet',
          });
        }
      } else {
        const { error } = await ctx.supabase
          .from('marketplace_user_wallets')
          .insert({
            user_id: userId,
            wallet_address: walletAddress,
            is_primary: true,
          });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to save wallet',
          });
        }
      }

      return { success: true };
    }),

  getUserWallet: userProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.data.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const wallet = await ctx.supabase
      .from('marketplace_user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    return wallet.data;
  }),

  checkUserPurchase: userProcedure
    .input(
      z.object({
        itemId: z.string(),
        itemType: z.enum(['prompt', 'agent']),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { itemId, itemType } = input;
      const userId = ctx.session.data.user?.id;

      if (!userId) {
        return { hasPurchased: false };
      }

      const purchase = await ctx.supabase
        .from('marketplace_user_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .single();

      return { hasPurchased: !!purchase.data };
    }),

  createTransaction: userProcedure
    .input(
      z.object({
        sellerId: z.string(),
        itemId: z.string(),
        itemType: z.enum(['prompt', 'agent']),
        amount: z.number(),
        transactionSignature: z.string(),
        buyerWalletAddress: z.string(),
        sellerWalletAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        sellerId,
        itemId,
        itemType,
        amount,
        transactionSignature,
        buyerWalletAddress,
        sellerWalletAddress,
      } = input;

      const buyerId = ctx.session.data.user?.id;

      if (!buyerId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      try {
        await transactionLimiter.consume(buyerId);
      } catch (rateLimitError) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message:
            'Too many transaction attempts. Please wait before trying again.',
        });
      }

      const existingTransaction = await ctx.supabase
        .from('marketplace_transactions')
        .select('id')
        .eq('transaction_signature', transactionSignature)
        .single();

      if (existingTransaction.data) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Transaction already recorded',
        });
      }

      // Calculate platform fee with proper decimal precision using utility
      const commission = calculateCommission(amount);
      const { platformFee, sellerAmount } = commission;

      if (!validateCommissionCalculation(amount, platformFee, sellerAmount)) {
        console.error('Commission calculation validation failed', {
          amount,
          platformFee,
          sellerAmount,
          expected: commission,
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Commission calculation error',
        });
      }

      // Fetch current SOL price for USD conversion at time of transaction
      let solPriceAtTime = 100; // Fallback price
      let amountUsd = null;
      let platformFeeUsd = null;
      let sellerAmountUsd = null;

      try {
        const priceResponse = await fetch(
          process.env.COIN_GECKO_API ||
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );

        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          solPriceAtTime = priceData.solana?.usd || 100;

          amountUsd = amount * solPriceAtTime;
          platformFeeUsd = platformFee * solPriceAtTime;
          sellerAmountUsd = sellerAmount * solPriceAtTime;
        }
      } catch (error) {
        console.warn('Failed to fetch SOL price for transaction, using fallback:', error);
        amountUsd = amount * solPriceAtTime;
        platformFeeUsd = platformFee * solPriceAtTime;
        sellerAmountUsd = sellerAmount * solPriceAtTime;
      }

      const { data: transaction, error: transactionError } = await ctx.supabase
        .from('marketplace_transactions')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          item_id: itemId,
          item_type: itemType,
          amount,
          amount_usd: amountUsd,
          platform_fee: platformFee,
          platform_fee_usd: platformFeeUsd,
          seller_amount: sellerAmount,
          seller_amount_usd: sellerAmountUsd,
          sol_price_at_time: solPriceAtTime,
          transaction_signature: transactionSignature,
          status: 'completed',
          buyer_wallet_address: buyerWalletAddress,
          seller_wallet_address: sellerWalletAddress,
        })
        .select()
        .single();

      if (transactionError) {
        console.error(
          'Failed to create marketplace transaction:',
          transactionError,
        );
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create transaction',
        });
      }

      const { error: purchaseError } = await ctx.supabase
        .from('marketplace_user_purchases')
        .insert({
          user_id: buyerId,
          item_id: itemId,
          item_type: itemType,
          transaction_id: transaction.id,
        });

      if (purchaseError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create purchase record',
        });
      }

      return { success: true, transactionId: transaction.id };
    }),

  getUserTransactions: userProcedure
    .input(
      z.object({
        type: z.enum(['purchases', 'sales', 'all']).default('all'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { type } = input;
      const userId = ctx.session.data.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      let query = ctx.supabase
        .from('marketplace_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (type === 'purchases') {
        query = query.eq('buyer_id', userId);
      } else if (type === 'sales') {
        query = query.eq('seller_id', userId);
      } else {
        query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transactions',
        });
      }

      return data || [];
    }),

  getItemNames: userProcedure
    .input(z.object({
      itemIds: z.array(z.object({
        id: z.string(),
        type: z.enum(['prompt', 'agent'])
      }))
    }))
    .query(async ({ ctx, input }) => {
      const { itemIds } = input;
      const itemNames = new Map<string, string>();

      // Get prompt names
      const promptIds = itemIds.filter(item => item.type === 'prompt').map(item => item.id);
      if (promptIds.length > 0) {
        const { data: prompts } = await ctx.supabase
          .from('swarms_cloud_prompts')
          .select('id, name')
          .in('id', promptIds);

        prompts?.forEach(prompt => {
          if (prompt.name) {
            itemNames.set(prompt.id, prompt.name);
          }
        });
      }

      // Get agent names
      const agentIds = itemIds.filter(item => item.type === 'agent').map(item => item.id);
      if (agentIds.length > 0) {
        const { data: agents } = await ctx.supabase
          .from('swarms_cloud_agents')
          .select('id, name')
          .in('id', agentIds);

        agents?.forEach(agent => {
          if (agent.name) {
            itemNames.set(agent.id, agent.name);
          }
        });
      }

      return Object.fromEntries(itemNames);
    }),

  getMarketplaceStats: publicProcedure.query(async ({ ctx }) => {
    const { count: totalTransactions } = await ctx.supabase
      .from('marketplace_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { data: volumeData } = await ctx.supabase
      .from('marketplace_transactions')
      .select('amount')
      .eq('status', 'completed');

    const totalVolume =
      volumeData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    const { data: feeData } = await ctx.supabase
      .from('marketplace_transactions')
      .select('platform_fee')
      .eq('status', 'completed');

    const totalPlatformFees =
      feeData?.reduce((sum, tx) => sum + tx.platform_fee, 0) || 0;

    return {
      totalTransactions: totalTransactions || 0,
      totalVolume,
      totalPlatformFees,
    };
  }),

  checkUserTrustworthiness: userProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.data.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      const result = await checkUserTrustworthiness(userId);
      return result;
    } catch (error) {
      console.error('Error checking user trustworthiness:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check user eligibility',
      });
    }
  }),
});

export default marketplaceRouter;
