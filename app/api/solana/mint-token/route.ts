import { Keypair, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";


const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;
const DAO_TREASURY_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS as string);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const TOKEN_DECIMALS = 6;
const SOL_MINIMUM_BUY_IN = 1 * LAMPORTS_PER_SOL; // Minimum SOL required to mint
const SOL_RESERVE = 30;
const GRADUATION_CAP = 69_000;

export async function POST(req: Request) {
  try {
    const { userPublicKey, tokenName, tickerSymbol, transactionSignature } = await req.json();
    if (!userPublicKey || !tokenName || !tickerSymbol || !transactionSignature) {
      return new Response(JSON.stringify({ error: "Invalid Request" }), { status: 400 });
    }

    const connection = new Connection(RPC_URL, "confirmed");

    // Verify transaction was made and meets the buy-in requirement
    const transaction = await connection.getTransaction(transactionSignature, { commitment: "confirmed" });
    if (!transaction) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 400 });
    }
    
    if (!transaction.meta?.preBalances || !transaction.meta?.postBalances) {
      return new Response(JSON.stringify({ error: "Transaction meta data not found" }), { status: 400 });
    }


    const solPaid = transaction.meta?.preBalances?.[0] - transaction.meta?.postBalances?.[0];
    if (!solPaid || solPaid < SOL_MINIMUM_BUY_IN) {
      return new Response(JSON.stringify({ error: "Minimum SOL buy-in not met" }), { status: 400 });
    }


    // 1. Create Token Mint with DAO as authority
    const payer = Keypair.generate();
    const tokenMint = await createMint(
      connection, 
      payer, 
      null as any, 
      null as any, 
      TOKEN_DECIMALS
    );

    // 2. Create Bonding Curve Account owned by DAO
    const bondingCurveAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenMint,
      DAO_TREASURY_ADDRESS // Set DAO as owner of bonding curve account
    );

    // 3. Mint initial supply to bonding curve account
    const fullSupply = BigInt(1_000_000_000) * BigInt(10 ** TOKEN_DECIMALS);
    await mintTo(
      connection, 
      payer, 
      tokenMint, 
      bondingCurveAccount.address, 
      DAO_TREASURY_ADDRESS, // Use DAO's authority to mint
      Number(fullSupply)
    );

    // Calculate initial SOL reserve from the transaction
    const initialReserve = transaction.meta?.preBalances?.[0] - transaction.meta?.postBalances?.[0];
    if (!initialReserve) {
      throw new Error("Could not calculate initial reserve");
    }

    // 4. Store Token in Database with initial reserve
    await supabase.from("ai_tokens").insert({
      token_name: tokenName,
      ticker_symbol: tickerSymbol,
      mint_address: tokenMint.toBase58(),
      bonding_curve_address: bondingCurveAccount.address.toBase58(),
      sol_reserve: initialReserve, // Track initial SOL reserve from transaction
      graduated: false,
      created_by: userPublicKey,
      created_at: new Date(),
    });

    return new Response(JSON.stringify({ 
      success: true, 
      tokenMint: tokenMint.toBase58(),
      bondingCurveAddress: bondingCurveAccount.address.toBase58()
    }), { status: 200 });

  } catch (error) {
    console.error("Error minting AI token:", error);
    return new Response(JSON.stringify({ error: "Minting failed" }), { status: 500 });
  }
}