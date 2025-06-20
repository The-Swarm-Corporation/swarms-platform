import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    rpcUrl: process.env.RPC_URL,
    openAPIKey: process.env.OPENAI_API_KEY,
    // Marketplace config
    marketplaceEnabled: process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED === 'true',
    platformWalletAddress: process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS,
    solanaNetwork: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta',
  });
}
