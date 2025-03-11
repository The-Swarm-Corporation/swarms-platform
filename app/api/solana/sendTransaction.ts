// pages/api/solana/sendTransaction.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection } from '@solana/web3.js';

const RPC_URL = process.env.RPC_URL; // Server-only variable

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute
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
  // Get client IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const clientIp = Array.isArray(ip) ? ip[0] : ip;

  // Check rate limit
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { serializedTx } = req.body;
    if (!serializedTx) {
      return res.status(400).json({ error: 'Missing transaction data' });
    }
    if (!RPC_URL) {
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Add request to rate limiting log
    addRequest(clientIp);

    const connection = new Connection(RPC_URL, 'confirmed');
    // Convert the base64 string back into a Buffer
    const txBuffer = Buffer.from(serializedTx, 'base64');
    const signature = await connection.sendRawTransaction(txBuffer);
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }
    res.status(200).json({ signature });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
