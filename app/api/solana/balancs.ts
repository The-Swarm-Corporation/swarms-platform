import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const SWARMS_TOKEN_ADDRESS = process.env.SWARMS_TOKEN_ADDRESS;
const RPC_URL = process.env.RPC_URL;

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestLog.get(ip) || [];
  
  // Remove requests outside current window
  const recentRequests = requests.filter(time => time > now - RATE_LIMIT_WINDOW);
  requestLog.set(ip, recentRequests);

  return recentRequests.length >= MAX_REQUESTS_PER_WINDOW;
}

function addRequest(ip: string) {
  const requests = requestLog.get(ip) || [];
  requests.push(Date.now());
  requestLog.set(ip, requests);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const clientIp = Array.isArray(ip) ? ip[0] : ip;

  // Check rate limit
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const { wallet } = req.query;
    
    // Validate wallet address format
    if (typeof wallet !== 'string' || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    if (!RPC_URL || !SWARMS_TOKEN_ADDRESS) {
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Add request to rate limiting log
    addRequest(clientIp);

    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Validate token address
    const tokenPubKey = new PublicKey(SWARMS_TOKEN_ADDRESS);
    const walletPubKey = new PublicKey(wallet);
    
    const tokenAccount = await getAssociatedTokenAddress(
      tokenPubKey,
      walletPubKey
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);

    // Cache control headers
    res.setHeader('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    
    return res.status(200).json(balance.value);
  } catch (error: any) {
    console.error('Balance check error:', error);
    return res.status(500).json({ error: 'Failed to fetch balance' });
  }
}
