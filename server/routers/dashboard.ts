import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Connection } from '@solana/web3.js';

export enum TransactionType {
  USD_DEPOSIT = 'USD_DEPOSIT',
  CREDIT_PURCHASE = 'CREDIT_PURCHASE',
  CREDIT_USAGE = 'CREDIT_USAGE',
  CREDIT_REFUND = 'CREDIT_REFUND',
  PROMOTIONAL_CREDIT = 'PROMOTIONAL_CREDIT',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  SUBSCRIPTION_CHARGE = 'SUBSCRIPTION_CHARGE',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
  CRYPTO_DEPOSIT = 'CRYPTO_DEPOSIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'completed',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

const dashboardRouter = router({
  getUserRequestCount: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user;
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    const userRequestCount = await ctx.supabase
      .from('swarms_cloud_api_activities')
      .select('request_count')
      .eq('user_id', user.id)
      .is('organization_id', null);

    if (userRequestCount.error) {
      console.error(
        'Error fetching user request count:',
        userRequestCount.error.details,
      );
      return 0;
    }

    const orgRequestCount = await ctx.supabase
      .from('swarms_cloud_api_activities')
      .select(
        `request_count, organization_id, swarms_cloud_organizations!inner(owner_user_id)`,
      )
      .not('organization_id', 'is', null)
      .eq('swarms_cloud_organizations.owner_user_id', user.id);

    if (orgRequestCount.error) {
      console.error(
        'Error fetching org request count:',
        orgRequestCount.error.details,
      );
      return 0;
    }

    // TODO: GET NUMBER OF MODELS USED BY USER

    const allCounts = [...userRequestCount.data, ...orgRequestCount.data];
    const totalCount = allCounts.reduce((acc, curr) => {
      return acc + (curr.request_count || 0);
    }, 0);

    return totalCount;
  }),

  // Add new procedure for adding USD balance
  addCryptoTransactionCredit: userProcedure
    .input(
      z.object({
        amountUsd: z.number().positive(),
        transactionHash: z.string(),
        swarmsAmount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      console.log('Starting addCryptoTransactionCredit with input:', input);
      
      const user = ctx.session.data.user;
      if (!user) {
        console.error('No user found in session');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        });
      }

      try {
        // Debug RPC connection
        console.log('Connecting to Solana RPC:', process.env.RPC_URL);
        const connection = new Connection(process.env.RPC_URL!);
        
        // Debug transaction verification
        console.log('Verifying transaction:', input.transactionHash);
        const transaction = await connection.getTransaction(input.transactionHash, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed'
        });
        console.log('Transaction:', transaction);
        console.log('Transaction details:', {
          exists: !!transaction,
          error: transaction?.meta?.err,
          balances: transaction?.meta?.postTokenBalances
        });

        if (!transaction || transaction.meta?.err) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid transaction: ${transaction?.meta?.err || 'Not found'}`,
          });
        }

        // Verify the destination address matches our DAO treasury
        const isValidDestination = transaction?.meta?.postTokenBalances?.some(
          balance => balance.owner === process.env.DAO_TREASURY_ADDRESS
        );

        if (!isValidDestination) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid destination address',
          });
        }

        // Get current credits
        const currentCredits = await ctx.supabase
          .from('swarms_cloud_users_credits')
          .select('credit')
          .eq('user_id', user.id)
          .single();

        if (currentCredits.error) {
          console.error('Error fetching credits:', currentCredits.error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch current credits',
          });
        }

        // Convert USD to credits (1:1 ratio, adjust as needed)
        const USD_TO_CREDITS_RATIO = 1;
        const creditsToAdd = input.amountUsd * USD_TO_CREDITS_RATIO;
        const newCreditBalance = (currentCredits.data?.credit || 0) + creditsToAdd;

        // Update credits
        const updateResult = await ctx.supabase
          .from('swarms_cloud_users_credits')
          .update({
            credit: newCreditBalance,
          })
          .eq('user_id', user.id);

        if (updateResult.error) {
          console.error('Error updating credits:', updateResult.error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update credits',
          });
        }

        // Log the transaction with lowercase status
        const transactionResult = await ctx.supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            amount_usd: input.amountUsd,
            credits_added: creditsToAdd,
            transaction_type: TransactionType.CRYPTO_DEPOSIT,
            status: 'completed',
            transaction_hash: input.transactionHash,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (transactionResult.error) {
          console.error('Error logging transaction:', transactionResult.error, {
            attemptedStatus: 'completed',
          });
          // Don't throw here as the credit update was successful
        }

        return {
          success: true,
          newBalance: newCreditBalance,
          creditsAdded: creditsToAdd,
        };
      } catch (error) {
        console.error('Detailed error in addCryptoTransactionCredit:', {
          error,
          input,
          rpcUrl: process.env.RPC_URL,
          userId: user.id
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process crypto deposit',
        });
      }
    }),
    
  getCreditTransactions: userProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }: { ctx: any, input: any }) => {
      const { data, error } = await ctx.supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transactions',
        });
      }

      return data;
    }),
});

export default dashboardRouter;
