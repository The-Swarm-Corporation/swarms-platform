import { Connection, PublicKey, Transaction, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount
} from '@solana/spl-token';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { headers } from 'next/headers';
import { Database } from '@/types_db';
import { ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from '@/shared/utils/encryption';

const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const DAO_TREASURY_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS as string);

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

    const { recipientAddress, amount, solanaFee } = await req.json();
    
    if (!recipientAddress || !amount) {
      return new Response(
        JSON.stringify({
          error: 'BAD_REQUEST',
          code: 'REQ_001',
          message: 'Missing required parameters'
        }),
        { status: 400 }
      );
    }

    // Get agent's wallet
    const { data: wallet } = await supabase
      .from('ai_agent_wallets')
      .select('private_key, public_key, iv')
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
    
 // Setup connection with enhanced options
 const connection = new Connection(RPC_URL, {
    commitment: 'processed',
    confirmTransactionInitialTimeout: 60000
  });
    // Decrypt the private key before creating the keypair
    const decryptedPrivateKey = decrypt(wallet.private_key, wallet.iv);
    const senderKeypair = Keypair.fromSecretKey(
      Buffer.from(decryptedPrivateKey, 'base64')
    );

    // Use provided solanaFee or default to 0.009 SOL
    const TARGET_SOL_FEE = solanaFee ? parseFloat(solanaFee) : 0.009;
    const minimumSolBalance = TARGET_SOL_FEE * LAMPORTS_PER_SOL;
    
    // Check SOL balance with provided fee
    const solBalance = await connection.getBalance(senderKeypair.publicKey);
    if (solBalance < minimumSolBalance) {
      return new Response(
        JSON.stringify({
          error: 'INSUFFICIENT_BALANCE',
          code: 'BAL_001',
          message: 'Insufficient SOL balance for transaction fees',
          details: {
            needed: TARGET_SOL_FEE,
            current: solBalance / LAMPORTS_PER_SOL,
            fee: TARGET_SOL_FEE
          }
        }),
        { status: 400 }
      );
    }

    // Get token accounts
    const sourceAccount = await getAssociatedTokenAddress(
      SWARMS_TOKEN_ADDRESS,
      senderKeypair.publicKey
    );

    const destinationPubKey = new PublicKey(recipientAddress);
    const destinationAccount = await getAssociatedTokenAddress(
      SWARMS_TOKEN_ADDRESS,
      destinationPubKey
    );

    const daoAccount = await getAssociatedTokenAddress(
      SWARMS_TOKEN_ADDRESS,
      DAO_TREASURY_ADDRESS
    );

    // Calculate amounts and taxes
    const DECIMALS = 6;
    const rawAmount = Math.floor(parseFloat(amount) * Math.pow(10, DECIMALS));
    const accountTax = Math.floor(rawAmount * 0.02); // 2% extra from account
    const receivedTax = Math.floor(rawAmount * 0.02); // 2% from the amount being sent
    const totalNeededFromAccount = rawAmount + accountTax;
    const recipientAmount = rawAmount - receivedTax;

    // Verify balance including taxes
    let sourceAccountInfo;
    try {
      sourceAccountInfo = await getAccount(connection, sourceAccount);
      const tokenBalance = BigInt(sourceAccountInfo.amount);
      
      if (tokenBalance < BigInt(totalNeededFromAccount)) {
        return new Response(
          JSON.stringify({
            error: 'INSUFFICIENT_TOKENS',
            code: 'BAL_002',
            message: 'Insufficient token balance including taxes',
            details: {
              available: Number(tokenBalance) / Math.pow(10, DECIMALS),
              requested: amount,
              totalNeeded: totalNeededFromAccount / Math.pow(10, DECIMALS),
              includingTaxes: true
            }
          }),
          { status: 400 }
        );
      }
    } catch (e) {
      console.log(e);
    }

    // Setup priority fees with provided or default SOL fee
    const COMPUTE_UNIT_LIMIT = 600000;
    const TARGET_TOTAL_FEE_LAMPORTS = BigInt(Math.floor(TARGET_SOL_FEE * 1e9));
    const priorityFeeInMicroLamports = (TARGET_TOTAL_FEE_LAMPORTS * BigInt(1000000)) / BigInt(COMPUTE_UNIT_LIMIT);

    // Create transaction with compute budget instructions
    const transaction = new Transaction();
    
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFeeInMicroLamports
      })
    );
    
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: COMPUTE_UNIT_LIMIT
      })
    );

    // Check if recipient token account exists
    try {
      await getAccount(connection, destinationAccount);
    } catch (e) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderKeypair.publicKey,
          destinationAccount,
          destinationPubKey,
          SWARMS_TOKEN_ADDRESS
        )
      );
    }

    // Add tax transfers with memos
    transaction.add(
      createTransferCheckedInstruction(
        sourceAccount,
        SWARMS_TOKEN_ADDRESS,
        daoAccount,
        senderKeypair.publicKey,
        accountTax,
        DECIMALS
      )
    );
    
    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from("Sender Fee (2%)"),
      })
    );

    transaction.add(
      createTransferCheckedInstruction(
        sourceAccount,
        SWARMS_TOKEN_ADDRESS,
        daoAccount,
        senderKeypair.publicKey,
        receivedTax,
        DECIMALS
      )
    );
    
    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from("Receiver Fee (2%)"),
      })
    );

    // Add main transfer
    transaction.add(
      createTransferCheckedInstruction(
        sourceAccount,
        SWARMS_TOKEN_ADDRESS,
        destinationAccount,
        senderKeypair.publicKey,
        recipientAmount,
        DECIMALS
      )
    );

    // Get blockhash and sign
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('processed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.sign(senderKeypair);

    // Send and confirm transaction
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
      preflightCommitment: 'processed'
    });
    
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'processed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    // Log transaction
    await supabase.from('ai_agent_transactions').insert({
      agent_id: agent.id,
      transaction_hash: signature,
      amount: amount,
      recipient: recipientAddress,
      status: 'completed'
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          signature,
          details: {
            sender: senderKeypair.publicKey.toString(),
            recipient: recipientAddress,
            daoAddress: DAO_TREASURY_ADDRESS.toString(),
            requestedSendAmount: amount,
            totalNeededFromAccount: totalNeededFromAccount / Math.pow(10, DECIMALS),
            accountTax: accountTax / Math.pow(10, DECIMALS),
            receivedTax: receivedTax / Math.pow(10, DECIMALS),
            recipientReceives: recipientAmount / Math.pow(10, DECIMALS),
            taxBreakdown: "2% extra from account + 2% from sent amount",
            computeUnits: COMPUTE_UNIT_LIMIT,
            priorityFee: Number(priorityFeeInMicroLamports) / 1_000_000
          }
        },
        code: 'SUCCESS_001'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Send tokens error:', error);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        code: 'ERR_001',
        message: 'Failed to send tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 