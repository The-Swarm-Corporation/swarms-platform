import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { headers } from 'next/headers';
import { Database } from '@/types_db';
import { createClient } from '@supabase/supabase-js';

const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.SWARMS_TOKEN_ADDRESS as string);
const RPC_URL = process.env.RPC_URL as string;
const LAMPORTS_PER_SOL = 1_000_000_000;

export async function GET(req: Request) {
  try {
    // Get API key from headers
    const headersList = await headers();
    const apiKey = headersList.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          code: 'AUTH_001',
          message: 'Missing API key'
        }),
        { status: 401 }
      );
    }

    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false
          }
        }
      );
          
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('id')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .single();

    if (!agent) {
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          code: 'AUTH_002',
          message: 'Invalid API key'
        }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const expectedAmount = searchParams.get('amount');
    
    if (!expectedAmount) {
      return new Response(
        JSON.stringify({
          error: 'BAD_REQUEST',
          code: 'REQ_001',
          message: 'Missing amount parameter'
        }),
        { status: 400 }
      );
    }

    // Get agent's wallet
    const { data: wallet } = await supabase
      .from('ai_agent_wallets')
      .select('public_key')
      .eq('agent_id', agent.id)
      .eq('status', 'active')
      .single();

    if (!wallet) {
      return new Response(
        JSON.stringify({
          error: 'NOT_FOUND',
          code: 'WAL_001',
          message: 'Wallet not found'
        }),
        { status: 404 }
      );
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const publicKey = new PublicKey(wallet.public_key);

    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceInSOL = solBalance / LAMPORTS_PER_SOL;

    // Get SWARMS token balance
    const tokenAccount = await getAssociatedTokenAddress(
      SWARMS_TOKEN_ADDRESS,
      publicKey
    );

    // Check if token account exists and get balance
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
    let swarmsBalance = 0;

    if (tokenAccountInfo !== null) {
      const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
      swarmsBalance = tokenBalance.value.uiAmount || 0;
    }

    // Check if received amount matches expected
    const expected = parseFloat(expectedAmount);
    const matches = Math.abs(swarmsBalance - expected) < 0.000001;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          solana_address: publicKey.toString(),
          received: swarmsBalance,
          expected,
          matches,
          balances: {
            sol: solBalanceInSOL,
            swarms: swarmsBalance
          },
          swarms_address: tokenAccount.toString()
        },
        code: 'SUCCESS_001'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Check receipt error:', error);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        code: 'ERR_001',
        message: 'Failed to check receipt'
      }),
      { status: 500 }
    );
  }
} 