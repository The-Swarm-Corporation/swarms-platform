import { Connection, PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { Database } from '@/types_db';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const RPC_URL = process.env.RPC_URL as string;
const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string);

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const apiKey = headersList.get('x-api-key');
    console.log('Received API key:', apiKey); // Debug log
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          message: 'Missing API key'
        }),
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false }
      }
    );

    // Get all agents for this API key
    const { data: agents, error: agentError } = await supabase
      .from('ai_agents')
      .select('id')
      .eq('api_key', apiKey)
      .eq('status', 'active');

    console.log('Agents query result:', { agents, error: agentError });

    if (!agents?.length) {
      return new Response(
        JSON.stringify({
          error: 'NOT_FOUND',
          message: 'No agents found',
          apiKey: apiKey
        }),
        { status: 404 }
      );
    }

    // Process each agent's transactions
    const results = await Promise.all(agents.map(async (agent) => {
      // Get the wallet for this agent
      const { data: wallet } = await supabase
        .from('ai_agent_wallets')
        .select('public_key')
        .eq('agent_id', agent.id)
        .single();

      if (!wallet) {
        console.log('No wallet found for agent:', agent.id);
        return { agent_id: agent.id, new_transactions: 0 };
      }

      const publicKey = new PublicKey(wallet.public_key);

      // Connect to Solana
      const connection = new Connection(RPC_URL, 'confirmed');

      // Get transaction history
      const signatures = await connection.getSignaturesForAddress(publicKey, {
      });
      
      console.log('signatures', signatures);

      // First, get all existing transaction hashes for this agent
      const { data: existingTransactions } = await supabase
        .from('ai_agent_transactions')
        .select('transaction_hash')
        .eq('agent_id', agent.id);

      const existingHashes = new Set(existingTransactions?.map(tx => tx.transaction_hash));

      // Process new transactions
      const newTransactions = [];
      for (const sig of signatures) {
        // Skip if transaction already exists
        if (existingHashes.has(sig.signature)) continue;

        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });

        if (!tx?.meta) continue;

        // Check if this is a SWARMS token transaction
        const isSwarmsTx = tx.meta.preTokenBalances?.some(b => 
          b.mint === SWARMS_TOKEN_ADDRESS.toString());
        
        if (!isSwarmsTx) continue;

        // Get SWARMS token balance changes
        const postTokenBalance = tx.meta.postTokenBalances?.find(b => 
          b.owner === publicKey.toString() && 
          b.mint === SWARMS_TOKEN_ADDRESS.toString()
        )?.uiTokenAmount.uiAmount || 0;

        const preTokenBalance = tx.meta.preTokenBalances?.find(b => 
          b.owner === publicKey.toString() && 
          b.mint === SWARMS_TOKEN_ADDRESS.toString()
        )?.uiTokenAmount.uiAmount || 0;

        const balanceChange = postTokenBalance - preTokenBalance;

        if (balanceChange !== 0) {
          // If balance decreased (sent tokens), recipient is the other wallet
          // If balance increased (received tokens), recipient is this wallet
          const recipient = balanceChange < 0 
            ? tx.meta.postTokenBalances?.find(b => 
                b.owner !== publicKey.toString() && 
                b.mint === SWARMS_TOKEN_ADDRESS.toString()
              )?.owner || 'unknown'
            : publicKey.toString(); // When receiving, this wallet is the recipient

          newTransactions.push({
            agent_id: agent.id,
            transaction_hash: sig.signature,
            amount: Math.abs(balanceChange),
            recipient,
            status: 'COMPLETED',
            created_at: new Date(sig.blockTime! * 1000).toISOString()
          });
        }
      }

      // Bulk insert only new transactions
      if (newTransactions.length > 0) {
        const { error } = await supabase
          .from('ai_agent_transactions')
          .insert(newTransactions);

        if (error) throw error;
      }

      return { agent_id: agent.id, new_transactions: newTransactions.length };
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: results
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Check account history error:', error);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: 'Failed to check account history'
      }),
      { status: 500 }
    );
  }
}
