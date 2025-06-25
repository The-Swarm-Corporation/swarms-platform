import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  itemId: string;
  itemType: 'prompt' | 'agent';
  userId: string;
  exp: number; // JWT exp timestamp
}

/**
 * Generate a secure JWT access token for marketplace items
 */
export function generateAccessToken(
  itemId: string,
  itemType: 'prompt' | 'agent',
  userId: string
): string {
  const payload: AccessTokenPayload = {
    itemId,
    itemType,
    userId,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
  };

  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
  }

  return jwt.sign(payload, secret);
}

/**
 * Resolve JWT access token to get real item ID and validate access
 */
export function resolveAccessToken(
  token: string,
  userId?: string
): { itemId: string; itemType: 'prompt' | 'agent' } | null {
  try {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
      return null;
    }

    const payload = jwt.verify(token, secret) as AccessTokenPayload;

    if (userId && payload.userId !== userId) {
      console.error('Access token user mismatch');
      return null;
    }

    return {
      itemId: payload.itemId,
      itemType: payload.itemType,
    };
  } catch (error) {
    console.error('Invalid or expired JWT access token:', error);
    return null;
  }
}


