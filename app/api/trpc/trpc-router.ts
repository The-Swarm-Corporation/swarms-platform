import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { Context } from './[trpc]/context';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { IncomingMessage } from 'http';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  isDev: process.env.NODE_ENV === 'development',
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;

// Define different rate limit tiers
const rateLimitTiers = {
  public: {
    points: 20,      // 20 requests
    duration: 60,    // per minute
    blockDuration: 60 * 2 // 2 minutes block
  },
  authenticated: {
    points: 100,     // 100 requests
    duration: 60,    // per minute
    blockDuration: 60 // 1 minute block
  },
  premium: {
    points: 500,     // 500 requests
    duration: 60,    // per minute
    blockDuration: 30 // 30 seconds block
  }
};

// Create rate limiters for different tiers
const rateLimiters = {
  public: new RateLimiterMemory({
    ...rateLimitTiers.public,
    keyPrefix: 'rl_public'
  }),
  authenticated: new RateLimiterMemory({
    ...rateLimitTiers.authenticated,
    keyPrefix: 'rl_auth'
  }),
  premium: new RateLimiterMemory({
    ...rateLimitTiers.premium,
    keyPrefix: 'rl_premium'
  })
};

// Enhanced fingerprint generation
const getFingerprint = (req: any): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const cfIP = req.headers.get('cf-connecting-ip');
  const realIP = req.headers.get('x-real-ip');
  
  // Prioritize different IP headers
  const ip = 
    cfIP || 
    (typeof forwarded === 'string' ? forwarded : forwarded?.[0])?.split(/,\s*/)[0] ||
    realIP ||
    req.ip ||
    '127.0.0.1';

  // Additional fingerprinting data
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  
  // Create a composite fingerprint
  const fingerprint = `${ip}_${Buffer.from(userAgent).slice(0, 32)}_${acceptLanguage.slice(0, 8)}`;
  
  return fingerprint;
};

// Rate limit helper function
const applyRateLimit = async (
  fingerprint: string,
  limiter: RateLimiterMemory,
  customPoints: number = 1
) => {
  try {
    const rateLimitResult = await limiter.consume(fingerprint, customPoints);
    return {
      remainingPoints: rateLimitResult.remainingPoints,
      msBeforeNext: rateLimitResult.msBeforeNext
    };
  } catch (error: any) {
    if (error.remainingPoints !== undefined) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Too many requests. Please try again in ${Math.ceil(error.msBeforeNext / 1000)} seconds`,
      });
    }
    throw error;
  }
};

// Get user tier
const getUserTier = (user: any) => {
  if (!user) return 'public';
  return user.isPremium ? 'premium' : 'authenticated';
};

// Weighted rate limiting based on endpoint complexity
const getEndpointWeight = (procedure: string): number => {
  const weights: Record<string, number> = {
    'query.heavy': 5,
    'mutation.create': 3,
    'mutation.update': 2,
    'query.light': 1
  };
  return weights[procedure] || 1;
};

// Enhanced user procedure with tiered rate limiting
export const userProcedure = publicProcedure
  .use(async (opts) => {
    const fingerprint = getFingerprint(opts.ctx.req);
    const user = opts.ctx?.session?.data?.session?.user;
    const tier = getUserTier(user);
    
    // Get the weight of the current procedure
    const procedurePath = opts.path || 'query.light';
    const weight = getEndpointWeight(procedurePath);

    // Apply rate limiting based on tier
    const limiter = rateLimiters[tier];
    const { remainingPoints, msBeforeNext } = await applyRateLimit(fingerprint, limiter, weight);

    // Add rate limit info to response headers
    if (opts.ctx.res) {
      opts.ctx.res.setHeader('X-RateLimit-Remaining', remainingPoints.toString());
      opts.ctx.res.setHeader('X-RateLimit-Reset', msBeforeNext.toString());
    }

    return opts.next();
  })
  .use(async (opts) => {
    const user = opts.ctx?.session?.data?.session?.user;
    if (!user) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: "You don't have access to this resource",
      });
    }
    return opts.next();
  });

// Export additional procedures with different rate limit configurations
export const premiumProcedure = userProcedure.use(async (opts) => {
  const user = opts.ctx?.session?.data?.session?.user;
  if (!user?.isPremium) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This endpoint requires a premium subscription',
    });
  }
  return opts.next();
});

export const publicRateLimitedProcedure = publicProcedure.use(async (opts) => {
  const fingerprint = getFingerprint(opts.ctx.req);
  await applyRateLimit(fingerprint, rateLimiters.public);
  return opts.next();
});
