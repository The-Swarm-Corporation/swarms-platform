import { Keypair, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const DAO_TREASURY_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS as string);

const K_VALUE = BigInt(30_000_000_000);
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;
export async function POST(req: Request) {
    try {
      const { userPublicKey, tokenMint, solAmount, action, transactionSignature } = await req.json();
      if (!userPublicKey || !tokenMint || !solAmount || !["buy", "sell"].includes(action) || !transactionSignature) {
        return new Response(JSON.stringify({ error: "Invalid Request" }), { status: 400 });
      }
  
      const connection = new Connection(RPC_URL, "confirmed");
  
      // Verify transaction
      const transaction = await connection.getTransaction(transactionSignature, { commitment: "confirmed" });
      if (!transaction) {
        return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 400 });
      }
  
      // Fetch token details
      const { data: tokenData } = await supabase
        .from("ai_tokens")
        .select("bonding_curve_address, sol_reserve, graduated")
        .eq("mint_address", tokenMint)
        .single();
  
      if (!tokenData) {
        return new Response(JSON.stringify({ error: "Token not found" }), { status: 404 });
      }
  
      let tokenAmount;
      let solAfterFees = solAmount * 0.99; // Deduct 1% fee
  
      if (tokenData.graduated) {
        // Token is on Meteora, redirect trade
        return await fetch("https://api.meteora.example.com/v1/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenMint, solAmount: solAfterFees, action }),
        });
      }
  
      // Compute bonding curve price
      if (action === "buy") {
        tokenAmount = K_VALUE / BigInt(Math.floor((tokenData.sol_reserve + solAfterFees) ** 2));
      } else {
        tokenAmount = K_VALUE / BigInt(Math.floor(tokenData.sol_reserve ** 2));
      }
  
      return new Response(JSON.stringify({ success: true, tokenAmount }), { status: 200 });
  
    } catch (error) {
      console.error("Trade execution error:", error);
      return new Response(JSON.stringify({ error: "Trade failed" }), { status: 500 });
    }
  }
  