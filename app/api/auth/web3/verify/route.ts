import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAndConsumeNonce,
  isValidSolanaAddress,
  verifySignature,
  createAuthMessage,
} from '@/shared/utils/auth-helpers/web3-auth';
import { createClient } from '@/shared/utils/supabase/server';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const verifyLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
  blockDuration: 600,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, nonce } = body;

    if (!walletAddress || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Wallet address, signature, and nonce are required' },
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
      await verifyLimiter.consume(clientIp);
    } catch (rateLimitError) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 },
      );
    }

    const isValidNonce = await verifyAndConsumeNonce(walletAddress, nonce);
    if (!isValidNonce) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication challenge' },
        { status: 401 },
      );
    }

    const originalMessage = createAuthMessage(nonce, walletAddress);
    const isValidSignature = await verifySignature(originalMessage, signature, walletAddress);
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 },
      );
    }

    const supabase = await createClient();

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error || !data.user) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 500 },
        );
      }

      await supabaseAdmin
        .from('users')
        .update({
          wallet_address: walletAddress,
          auth_method: 'web3',
        } as any) // Type assertion for new fields
        .eq('id', data.user.id);

      return NextResponse.json({
        success: true,
        user: data.user,
        isNewUser: false,
      });
    } else {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error || !data.user) {
        return NextResponse.json(
          { error: 'Account creation failed' },
          { status: 500 },
        );
      }

      await supabaseAdmin
        .from('users')
        .update({
          wallet_address: walletAddress,
          auth_method: 'web3',
        } as any) // Type assertion for new fields
        .eq('id', data.user.id);

      return NextResponse.json({
        success: true,
        user: data.user,
        isNewUser: true,
      });
    }
  } catch (error) {
    console.error('Web3 verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
