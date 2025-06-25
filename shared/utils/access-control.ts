import { trpcApi } from '@/shared/utils/trpc/trpc';
import { createClient } from '@/shared/utils/supabase/server';

interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
}

/**
 * Redirects unauthorized users to access page instead of showing content
 */
export async function checkUserAccess(
  itemId: string,
  itemType: 'prompt' | 'agent',
  userId?: string
): Promise<AccessCheckResult> {
  try {
    let item;
    if (itemType === 'prompt') {
      item = await trpcApi.explorer.getPromptById.query(itemId);
    } else {
      item = await trpcApi.explorer.getAgentById.query(itemId);
    }

    if (!item) {
      return { hasAccess: false, reason: 'Item not found' };
    }

    if (item.is_free) {
      return { hasAccess: true };
    }

    if (!userId) {
      return { hasAccess: false, reason: 'Authentication required' };
    }

    if (item.user_id === userId) {
      return { hasAccess: true };
    }

    const supabase = await createClient();
    const { data: purchase } = await supabase
      .from('marketplace_transactions')
      .select('id')
      .eq('buyer_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .eq('status', 'completed')
      .single();

    if (purchase) {
      return { hasAccess: true };
    }

    return { hasAccess: false, reason: 'Purchase required' };
  } catch (error) {
    console.error('Access check error:', error);
    return { hasAccess: false, reason: 'Access check failed' };
  }
}

export function useAccessControl(_itemId: string, _itemType: 'prompt' | 'agent') {
  return { hasAccess: false, isLoading: true };
}
