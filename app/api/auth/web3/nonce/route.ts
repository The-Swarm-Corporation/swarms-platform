import { NextRequest, NextResponse } from 'next/server';
import {
  generateWeb3Nonce,
  createAuthMessage,
  isValidSolanaAddress,
  storeWeb3Nonce,
} from '@/shared/utils/auth-helpers/web3-auth';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const nonceLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 300,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 },
      );
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address' },
        { status: 400 },
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    try {
      await nonceLimiter.consume(clientIp);
    } catch (rateLimitError) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const nonce = generateWeb3Nonce();
    const message = createAuthMessage(nonce, walletAddress);

    const stored = await storeWeb3Nonce(walletAddress, nonce);
    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to generate authentication challenge' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      nonce,
      message,
      expiresIn: parseInt(process.env.WEB3_AUTH_NONCE_EXPIRY || '300'), // seconds
    });
  } catch (error) {
    console.error('Web3 nonce generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
