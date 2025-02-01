import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { getURL } from '@/shared/utils/helpers';

interface Transaction {
  id: string;
  transaction_hash: string;
  amount: number;
  recipient: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  created_at: string;
  agent_id: string;
  transaction_type: 'send' | 'received';
}

const walletRouter = router({
  // Get user's active API keys
  getApiKeys: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;

    const { data: apiKeys, error } = await ctx.supabase
      .from('swarms_cloud_api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (error) {
      throw new Error('Failed to fetch API keys');
    }

    return apiKeys;
  }),

  // Get active AI agents for user's API keys
  getActiveAgents: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;

    // First get the user's API keys
    const { data: apiKeys, error: apiKeysError } = await ctx.supabase
      .from('swarms_cloud_api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (apiKeysError || !apiKeys) {
      throw new Error('Failed to fetch API keys');
    }

    // Get all active agents that match any of the user's API keys
    const { data: agents, error: agentsError } = await ctx.supabase
      .from('ai_agents')
      .select('*')
      .in('api_key', apiKeys.map(k => k.key))
      .eq('status', 'active');

    if (agentsError) {
      throw new Error('Failed to fetch AI agents');
    }

    return agents;
  }),

  // Get wallets for active AI agents
  getAgentWallets: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;

    // First get the user's API keys
    const { data: apiKeys, error: apiKeysError } = await ctx.supabase
      .from('swarms_cloud_api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (apiKeysError) {
      throw new Error('Failed to fetch API keys');
    }

    if (!apiKeys?.length) {
      return [];
    }

    // Get all active agents with their API keys
    const { data: agents, error: agentsError } = await ctx.supabase

      .from('ai_agents')
      .select('id, api_key')
      .in('api_key', apiKeys.map(k => k.key))
      .eq('status', 'active');

    if (agentsError || !agents) {
      throw new Error('Failed to fetch AI agents');
    }

    // Get all wallets for these agents
    const { data: wallets, error: walletsError } = await ctx.supabase
      .from('ai_agent_wallets')
      .select('*')
      .in('agent_id', agents.map(agent => agent.id));

    if (walletsError) {
      throw new Error('Failed to fetch agent wallets');
    }

    // If no wallets found or some agents don't have wallets, create them
    if (!wallets?.length || wallets.length < agents.length) {
      for (const agent of agents) {
        // Skip if agent already has a wallet
        if (wallets?.some(w => w.agent_id === agent.id)) {
          continue;
        }

        try {
          const response = await fetch(`${getURL()}/api/solana/generate-wallet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': agent.api_key
            }
          });

          if (!response.ok) {
            continue;
          }
        } catch (error) {
          console.error(`Failed to create wallet for agent ${agent.id}:`, error);
        }
      }

      // Fetch updated wallets after creation
      const { data: updatedWallets } = await ctx.supabase
        .from('ai_agent_wallets')
        .select('*')
        .in('agent_id', agents.map(agent => agent.id));

      return updatedWallets;
    }

    return wallets;
  }),

  // Get transactions for active AI agents
  getAgentTransactions: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    
    // Get all user's API keys
    const { data: apiKeys, error: apiKeysError } = await ctx.supabase
      .from('swarms_cloud_api_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (apiKeysError) {
      throw new Error('Failed to fetch API keys');
    }

    // Return empty array if no API keys
    if (!apiKeys?.length) {
      return [];
    }

    // Get all active agents for all API keys
    const { data: agents, error: agentsError } = await ctx.supabase
      .from('ai_agents')
      .select('id, api_key')
      .in('api_key', apiKeys.map(k => k.key))
      .eq('status', 'active');

    if (agentsError) {
      throw new Error('Failed to fetch agents');
    }

    // Return empty array if no agents
    if (!agents?.length) {
      return [];
    }

    try {
      // Update transaction history for each agent
      await Promise.allSettled(agents.map(async (agent) => {
        try {
          const response = await fetch(`${getURL()}/api/solana/check-account-history`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-api-key': agent.api_key
            }
          });
          if (!response.ok) {
            console.error(`Failed to update history for agent ${agent.id}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error updating history for agent ${agent.id}:`, error);
        }
      }));
    } catch (error) {
      console.error('Error updating transaction history:', error);
      // Continue execution even if history update fails
    }

    // Get all transactions for these agents
    const { data: transactions, error: txError } = await ctx.supabase
      .from('ai_agent_transactions')
      .select('*')
      .in('agent_id', agents.map(agent => agent.id))
      .order('created_at', { ascending: false });

    if (txError) {
      throw new Error('Failed to fetch transactions');
    }

    // Return empty array if no transactions, otherwise map the transactions
    return transactions?.map(tx => ({
      ...tx,
      status: tx.status as 'COMPLETED' | 'PENDING' | 'FAILED',
      transaction_type: 'send' as 'send' | 'received'
    })) || [];
  }),

  deployAgent: userProcedure
    .input(
      z.object({
        name: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.session.data.session?.user as User;

        // Get user's API key
        const { data: apiKeys, error: apiKeyError } = await ctx.supabase
          .from('swarms_cloud_api_keys')
          .select('key')
          .eq('user_id', user.id)
          .eq('is_deleted', false)
          .limit(1);

        if (apiKeyError) {
          throw new Error('Failed to fetch API key');
        }

        if (!apiKeys?.length) {
          throw new Error('No API key found. Please create an API key first.');
        }

        // Create new agent with all required fields
        const { data: agent, error: agentError } = await ctx.supabase
          .from('ai_agents')
          .insert({
            name: input.name,
            api_key: apiKeys[0].key,
            status: 'active',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (agentError || !agent) {
          throw new Error('Failed to create agent');
        }

        // Generate wallet for the agent using the agent's ID
        try {
          const response = await fetch(`${getURL()}/api/solana/generate-wallet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': agent.api_key
            }
          });

          if (!response.ok) {
            // Delete the agent if wallet creation fails
            await ctx.supabase
              .from('ai_agents')
              .delete()
              .eq('id', agent.id);
            
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate wallet');
          }

          const walletData = await response.json();
          if (!walletData.success) {
            // Delete the agent if wallet creation fails
            await ctx.supabase
              .from('ai_agents')
              .delete()
              .eq('id', agent.id);
            
            throw new Error(walletData.message || 'Failed to generate wallet');
          }

          return agent;
        } catch (error) {
          // Delete the agent if wallet creation fails
          await ctx.supabase
            .from('ai_agents')
            .delete()
            .eq('id', agent.id);
          
          throw new Error(error instanceof Error ? error.message : 'Failed to setup agent wallet');
        }
      } catch (error) {
        console.error('Deploy agent error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to deploy agent');
      }
    }),

  // Add this new procedure to walletRouter
  getAgentMetrics: userProcedure
    .input(
      z.object({
        agentId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(10)
      })
    )
    .query(async ({ ctx, input }) => {
      const { agentId, startDate, endDate, status, type, page, pageSize } = input;
      
      // Get the agent's API key
      const { data: agent } = await ctx.supabase
        .from('ai_agents')
        .select('api_key')
        .eq('id', agentId)
        .single();

      if (!agent) {
        throw new Error('Agent not found');
      }

      // Call the get-metrics endpoint
      const response = await fetch(`${getURL()}/api/solana/get-metrics?${new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
        ...(type && { type }),
        page: page.toString(),
        pageSize: pageSize.toString()
      })}`, {
        headers: {
          'x-api-key': agent.api_key
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent metrics');
      }

      const data = await response.json();
      return data.data;
    }),
});

export { walletRouter };
