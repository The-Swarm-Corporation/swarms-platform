import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { Database } from '@/types_db';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { encrypt, decrypt } from '@/shared/utils/encryption';

const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

export async function POST(req: Request) {
  try {
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
    
    // Get all active agents for this API key
    const { data: agents, error: agentsError } = await supabase
      .from('ai_agents')
      .select('id')
      .eq('api_key', apiKey)
      .eq('status', 'active');

    if (agentsError || !agents?.length) {
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          code: 'AUTH_002',
          message: 'Invalid API key'
        }),
        { status: 401 }
      );
    }

    const results = [];

    // Create wallets for each agent that doesn't have one
    for (const agent of agents) {
      // Check for existing wallet
      const { data: existingWallet } = await supabase
        .from('ai_agent_wallets')
        .select('public_key, private_key')
        .eq('agent_id', agent.id)
        .eq('status', 'active')
        .eq('wallet_type', 'solana')
        .single();

      if (existingWallet) {
        // Get balance for existing wallet
        const connection = new Connection(RPC_URL, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 60000
        });
        
        const publicKey = new PublicKey(existingWallet.public_key);
        const balance = await connection.getBalance(publicKey);

        results.push({
          agent_id: agent.id,
          public_key: existingWallet.public_key,
          wallet_type: 'solana',
          sol_balance: balance / LAMPORTS_PER_SOL,
          status: 'existing'
        });
        continue;
      }

      // Generate new wallet if none exists
      try {
        const wallet = Keypair.generate();
        const connection = new Connection(RPC_URL, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 60000
        });

        // Create SWARMS token account
        const swarmsATA = await getAssociatedTokenAddress(
          SWARMS_TOKEN_ADDRESS,
          wallet.publicKey
        );

        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            swarmsATA,
            wallet.publicKey,
            SWARMS_TOKEN_ADDRESS
          )
        );

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
        transaction.sign(wallet);

        try {
          const signature = await connection.sendRawTransaction(
            transaction.serialize(),
            { maxRetries: 3 }
          );
          await connection.confirmTransaction(signature, 'confirmed');
        } catch (error) {
          console.error(`Failed to create SWARMS token account for agent ${agent.id}:`, error);
        }

        // Store wallet
        const privateKeyBase64 = Buffer.from(wallet.secretKey).toString('base64');
        const { encryptedData, iv } = encrypt(privateKeyBase64);

        const { error: walletError } = await supabase
          .from('ai_agent_wallets')
          .insert({
            agent_id: agent.id,
            public_key: wallet.publicKey.toString(),
            private_key: encryptedData,
            iv: iv,
            wallet_type: 'solana',
            status: 'active',
          });

        if (!walletError) {
          results.push({
            agent_id: agent.id,
            public_key: wallet.publicKey.toString(),
            wallet_type: 'solana',
            swarms_token_address: swarmsATA.toString(),
            status: 'created'
          });
        }
      } catch (error) {
        console.error(`Failed to create wallet for agent ${agent.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        code: 'SUCCESS_001'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Wallet generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        code: 'ERR_001',
        message: 'Failed to generate wallet'
      }),
      { status: 500 }
    );
  }
} 