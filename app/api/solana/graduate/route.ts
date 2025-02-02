import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import AmmImpl, { MAINNET_POOL } from "@mercurial-finance/dynamic-amm-sdk";
import { createClient } from "@supabase/supabase-js";
import { getAccount } from "@solana/spl-token";
import { Wallet, AnchorProvider } from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
const DAO_TREASURY_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS as string);

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const SWARMS_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS as string);

const GRADUATION_FEE_SWARMS = 30000; // Example: 6000 SWARMS tokens required to graduate

export async function POST(req: Request) {
  try {
    const { tokenMint } = await req.json();
    if (!tokenMint) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
    }
    // Fetch Token Data with swarms_reserve
    const { data: tokenData } = await supabase
      .from("ai_tokens")
      .select("bonding_curve_address, swarms_reserve, graduated")
      .eq("mint_address", tokenMint)
      .single();

    if (!tokenData || tokenData.graduated) {
      return new Response(JSON.stringify({ error: "Token already graduated" }), { status: 400 });
    }

    const connection = new Connection(RPC_URL, "confirmed");
    
    // Setup provider
    const payer = Keypair.generate(); // TODO: Replace with actual payer key
    const wallet = new Wallet(payer);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });

    const meteoraPool = await AmmImpl.create(connection, MAINNET_POOL.USDC_SOL);
    
    // Get current token balance
    const bondingCurveAccount = await getAccount(
      connection,
      new PublicKey(tokenData.bonding_curve_address)
    );

    // Deduct SWARMS Fee
    const swarmsAfterFees = tokenData.swarms_reserve - GRADUATION_FEE_SWARMS;
    if (swarmsAfterFees <= 0) {
      return new Response(JSON.stringify({ error: "Insufficient SWARMS for graduation" }), { status: 400 });
    }

    // Create combined transaction
    const transaction = new Transaction();

    // Add DAO fee transfer
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(tokenData.bonding_curve_address),
        toPubkey: DAO_TREASURY_ADDRESS,
        lamports: GRADUATION_FEE_SWARMS
      })
    );

    // Get deposit quote
    const { poolTokenAmountOut, tokenAInAmount, tokenBInAmount } = meteoraPool.getDepositQuote(
      BN(swarmsAfterFees * 10 ** 9),
      BN(Number(bondingCurveAccount.amount)),
      false,
      0.01
    );



    // Add pool deposit
    const depositTx = await meteoraPool.deposit(
      payer.publicKey,
      tokenAInAmount,
      tokenBInAmount,
      poolTokenAmountOut
    );
    transaction.add(depositTx);

    // Send and confirm
    const signature = await provider.sendAndConfirm(transaction);

    // Update DB
    await supabase.from("ai_tokens")
      .update({ 
        graduated: true,
        pool_address: meteoraPool.address.toString()
      })
      .eq("mint_address", tokenMint);

    return new Response(JSON.stringify({ 
      success: true, 
      transactionSignature: signature,
      poolAddress: meteoraPool.address.toString()
    }), { status: 200 });

  } catch (error) {
    console.error("Graduation error:", error);
    return new Response(JSON.stringify({ error: "Graduation failed" }), { status: 500 });
  }
}
