interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  maxTokens?: number;
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    tokens: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  checkLimit(
    userId: string,
    tokenCount: number = 0,
  ): { allowed: boolean; reason?: string; resetTime?: number } {
    const now = Date.now();
    const key = userId;

    if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
      rateLimitStore[key] = {
        requests: 0,
        tokens: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const userLimit = rateLimitStore[key];

    if (userLimit.requests >= this.config.maxRequests) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${this.config.maxRequests} requests per ${this.config.windowMs / 1000}s`,
        resetTime: userLimit.resetTime,
      };
    }

    if (
      this.config.maxTokens &&
      userLimit.tokens + tokenCount > this.config.maxTokens
    ) {
      return {
        allowed: false,
        reason: `Token limit exceeded: ${this.config.maxTokens} tokens per ${this.config.windowMs / 1000}s`,
        resetTime: userLimit.resetTime,
      };
    }

    userLimit.requests += 1;
    userLimit.tokens += tokenCount;

    return { allowed: true };
  }

  getUsage(
    userId: string,
  ): { requests: number; tokens: number; resetTime: number } | null {
    const userLimit = rateLimitStore[userId];
    if (!userLimit || Date.now() > userLimit.resetTime) {
      return null;
    }
    return userLimit;
  }

  clearLimit(userId: string): void {
    delete rateLimitStore[userId];
  }
}

export const chatRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  maxTokens: 100000,
});

export const heavyRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 100,
  maxTokens: 1000000,
});

export function detectSuspiciousActivity(
  userId: string,
  tokenCount: number,
): { suspicious: boolean; reason?: string } {
  if (tokenCount > 100000) {
    return {
      suspicious: true,
      reason: `Extremely large single request: ${tokenCount} tokens`,
    };
  }

  const usage = heavyRateLimiter.getUsage(userId);
  if (usage && usage.tokens > 500000) {
    return {
      suspicious: true,
      reason: `High token usage in short period: ${usage.tokens} tokens in 1 hour`,
    };
  }

  return { suspicious: false };
}

const blockedUsers = new Set<string>();

export function blockUser(userId: string, reason: string): void {
  blockedUsers.add(userId);
  console.error(`🚨 USER BLOCKED: ${userId} - Reason: ${reason}`);
}

export function unblockUser(userId: string): void {
  blockedUsers.delete(userId);
  console.log(`✅ USER UNBLOCKED: ${userId}`);
}

export function isUserBlocked(userId: string): boolean {
  return blockedUsers.has(userId);
}

setInterval(
  () => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach((key) => {
      if (now > rateLimitStore[key].resetTime) {
        delete rateLimitStore[key];
      }
    });
  },
  5 * 60 * 1000,
);
