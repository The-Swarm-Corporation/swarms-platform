import { Tables } from '@/types_db';

export interface UserWithWeb3 extends Tables<'users'> {
  wallet_address?: string | null;
  auth_method?: 'oauth' | 'web3' | null;
  wallet_type?: 'solana' | null;
}

export interface Web3AuthSession {
  id: string;
  wallet_address: string;
  nonce: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Web3NonceResponse {
  nonce: string;
  message: string;
  expiresIn: number;
}

export interface Web3VerifyRequest {
  walletAddress: string;
  signature: string;
  nonce: string;
}

export interface Web3VerifyResponse {
  success: boolean;
  user?: any;
  isNewUser?: boolean;
  error?: string;
}

export type Web3AuthError =
  | 'WALLET_NOT_CONNECTED'
  | 'INVALID_WALLET_ADDRESS'
  | 'NONCE_GENERATION_FAILED'
  | 'SIGNATURE_FAILED'
  | 'VERIFICATION_FAILED'
  | 'RATE_LIMITED'
  | 'EXPIRED_NONCE'
  | 'INVALID_SIGNATURE'
  | 'AUTHENTICATION_FAILED';

export interface Web3AuthState {
  isConnected: boolean;
  isAuthenticating: boolean;
  walletAddress: string | null;
  error: Web3AuthError | null;
  user: UserWithWeb3 | null;
}
