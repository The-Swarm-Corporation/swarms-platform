import { createClient } from '@/shared/utils/supabase/client';
import { supabaseAdmin } from '@/shared/utils/supabase/admin';
import { PublicKey } from '@solana/web3.js';
import { createHash, randomBytes } from 'crypto';
import nacl from 'tweetnacl';

export interface Web3AuthNonce {
  nonce: string;
  expiresAt: Date;
}

export interface Web3AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export function generateWeb3Nonce(): string {
  return randomBytes(32).toString('hex');
}

export function createAuthMessage(nonce: string, walletAddress: string): string {
  const timestamp = new Date().toISOString();
  const template = process.env.WEB3_AUTH_MESSAGE_TEMPLATE || 
    "Sign this message to authenticate with Swarms Platform.\n\nNonce: {nonce}\nTimestamp: {timestamp}\nWallet: {wallet}";
  
  return template
    .replace('{nonce}', nonce)
    .replace('{timestamp}', timestamp)
    .replace('{wallet}', walletAddress);
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function storeWeb3Nonce(walletAddress: string, nonce: string): Promise<boolean> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (parseInt(process.env.WEB3_AUTH_NONCE_EXPIRY || '5')));

    const { error } = await supabaseAdmin
      .from('web3_auth_sessions')
      .insert({
        wallet_address: walletAddress,
        nonce,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    return !error;
  } catch (error) {
    console.error('Error storing Web3 nonce:', error);
    return false;
  }
}

export async function verifyAndConsumeNonce(walletAddress: string, nonce: string): Promise<boolean> {
  try {
    const { data: session, error } = await supabaseAdmin
      .from('web3_auth_sessions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('nonce', nonce)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return false;
    }

    await supabaseAdmin
      .from('web3_auth_sessions')
      .update({ used: true })
      .eq('id', session.id);

    return true;
  } catch (error) {
    console.error('Error verifying nonce:', error);
    return false;
  }
}

export async function verifySignature(
  message: string,
  signature: string,
  walletAddress: string
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);

    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    if (signatureBytes.length !== 64) {
      console.error('Invalid signature length:', signatureBytes.length);
      return false;
    }

    const publicKey = new PublicKey(walletAddress);
    const publicKeyBytes = publicKey.toBytes();

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function cleanupExpiredNonces(): Promise<void> {
  try {
    await supabaseAdmin
      .from('web3_auth_sessions')
      .delete()
      .or(`expires_at.lt.${new Date().toISOString()},used.eq.true`);
  } catch (error) {
    console.error('Error cleaning up expired nonces:', error);
  }
}
