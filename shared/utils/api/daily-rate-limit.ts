import { supabaseAdmin } from '../supabase/admin';

export interface DailyLimitConfig {
  paidPrompts: number;
  paidAgents: number;
  freeContent: number;
}

export interface DailyLimitResult {
  allowed: boolean;
  reason?: string;
  currentUsage: {
    paidPrompts: number;
    paidAgents: number;
    freeContent: number;
    date: string;
  };
  limits: DailyLimitConfig;
  resetTime: string;
}

const DEFAULT_LIMITS: DailyLimitConfig = {
  paidPrompts: 5,
  paidAgents: 3,
  freeContent: 10,
};

// VIP users with higher limits (can be configured via env)
const VIP_LIMITS: DailyLimitConfig = {
  paidPrompts: 20,
  paidAgents: 15,
  freeContent: 50,
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getTomorrowResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

function isVipUser(userId: string): boolean {
  const vipUsers = process.env.VIP_USERS?.split(',') || [];
  return vipUsers.includes(userId);
}

function getUserLimits(userId: string): DailyLimitConfig {
  return isVipUser(userId) ? VIP_LIMITS : DEFAULT_LIMITS;
}

export async function checkDailyLimit(
  userId: string,
  type: 'prompt' | 'agent',
  isPaid: boolean,
): Promise<DailyLimitResult> {
  const today = getTodayString();
  const limits = getUserLimits(userId);

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { count: paidPromptsCount } = await supabaseAdmin
      .from('swarms_cloud_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_free', false)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    const { count: paidAgentsCount } = await supabaseAdmin
      .from('swarms_cloud_agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_free', false)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    const { count: freePromptsCount } = await supabaseAdmin
      .from('swarms_cloud_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_free', true)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    const { count: freeAgentsCount } = await supabaseAdmin
      .from('swarms_cloud_agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_free', true)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    const currentUsage = {
      paidPrompts: paidPromptsCount || 0,
      paidAgents: paidAgentsCount || 0,
      freeContent: (freePromptsCount || 0) + (freeAgentsCount || 0),
      date: today,
    };

    let wouldExceed = false;
    let reason = '';

    if (isPaid) {
      if (type === 'prompt' && currentUsage.paidPrompts >= limits.paidPrompts) {
        wouldExceed = true;
        reason = `Daily limit reached: ${limits.paidPrompts} paid prompts per day. Resets at midnight.`;
      } else if (
        type === 'agent' &&
        currentUsage.paidAgents >= limits.paidAgents
      ) {
        wouldExceed = true;
        reason = `Daily limit reached: ${limits.paidAgents} paid agents per day. Resets at midnight.`;
      }
    } else {
      if (currentUsage.freeContent >= limits.freeContent) {
        wouldExceed = true;
        reason = `Daily limit reached: ${limits.freeContent} free items per day. Resets at midnight.`;
      }
    }

    return {
      allowed: !wouldExceed,
      reason: wouldExceed ? reason : undefined,
      currentUsage,
      limits,
      resetTime: getTomorrowResetTime(),
    };
  } catch (error) {
    console.error('Error checking daily limit:', error);
    // Fail open - allow the request if we can't check limits
    return {
      allowed: true,
      currentUsage: {
        paidPrompts: 0,
        paidAgents: 0,
        freeContent: 0,
        date: today,
      },
      limits,
      resetTime: getTomorrowResetTime(),
    };
  }
}


