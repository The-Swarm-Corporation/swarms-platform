import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { Database } from '@/types_db';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { encrypt, decrypt } from '@/utils/encryption';

const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

export async function POST(req: Request) {
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

    // Initialize Supabase client with service role
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

    // Check for existing active wallet
    const { data: existingWallet } = await supabase
      .from('ai_agent_wallets')
      .select('public_key, private_key')
      .eq('agent_id', agent.id)
      .eq('status', 'active')
      .eq('wallet_type', 'solana')
      .single();

    if (existingWallet) {
      // Get current balance for existing wallet
      const connection = new Connection(RPC_URL, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      });
      
      const publicKey = new PublicKey(existingWallet.public_key);
      const balance = await connection.getBalance(publicKey);

      // Decrypt private key if needed (commented out as in original)
      // const decryptedPrivateKey = decrypt(existingWallet.private_key, existingWallet.iv);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            public_key: existingWallet.public_key,
            // private_key: decryptedPrivateKey,
            wallet_type: 'solana',
            sol_balance: balance / LAMPORTS_PER_SOL,
            message: 'Existing wallet retrieved'
          },
          code: 'SUCCESS_003'
        }),
        { status: 200 }
      );
    }

    // Generate new Solana wallet
    const wallet = Keypair.generate();
    
    // Setup Solana connection
    const connection = new Connection(RPC_URL, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000
    });

    // Create associated token account for SWARMS
    const swarmsATA = await getAssociatedTokenAddress(
      SWARMS_TOKEN_ADDRESS,
      wallet.publicKey
    );

    // Create and send transaction to create ATA
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
    
    // Sign and send the transaction
    transaction.sign(wallet);
    
    try {
      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        { maxRetries: 3 }
      );
      await connection.confirmTransaction(signature, 'confirmed');
    } catch (error) {
      console.error('Failed to create SWARMS token account:', error);
      // Continue even if ATA creation fails - it can be created later
    }
    
    // When storing new wallet
    const privateKeyBase64 = Buffer.from(wallet.secretKey).toString('base64');
    const { encryptedData, iv } = encrypt(privateKeyBase64);

    // Store wallet info in Supabase with encrypted private key
    const { error } = await supabase
      .from('ai_agent_wallets')
      .insert({
        agent_id: agent.id,
        public_key: wallet.publicKey.toString(),
        private_key: encryptedData,
        iv: iv,
        wallet_type: 'solana',
        status: 'active',
      });

    if (error) {
        console.error('Failed to store wallet:', error);
      return new Response(
        JSON.stringify({
          error: 'DATABASE_ERROR',
          code: 'DB_001',
          message: 'Failed to store wallet'
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          public_key: wallet.publicKey.toString(),
          wallet_type: 'solana',
          swarms_token_address: swarmsATA.toString()
        },
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