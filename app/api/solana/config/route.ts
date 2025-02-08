import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    rpcUrl: process.env.RPC_URL,
  });
}
