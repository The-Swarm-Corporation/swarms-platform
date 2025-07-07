export type NotificationType =
  | 'content_liked'
  | 'content_commented'
  | 'content_reviewed'
  | 'content_rated'
  | 'user_followed'
  | 'user_mentioned'
  | 'content_approved'
  | 'content_rejected'
  | 'system_announcement'
  | 'account_update'
  | 'security_alert'
  | 'marketplace_purchase'
  | 'marketplace_sale'
  | 'marketplace_commission'
  | 'referral_signup'
  | 'referral_reward'
  | 'org_invite'
  | 'org_update';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  created_at: string;
  updated_at: string;

  user_id: string;

  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;

  status: NotificationStatus;
  read_at?: string;

  related_type?: string;
  related_id?: string;

  actor_id?: string;

  action_url?: string;
}

export interface NotificationPreferences {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;

  notifications_enabled: boolean;

  social_notifications: boolean;
  system_notifications: boolean;

  marketplace_notifications: boolean;
  referral_notifications: boolean;

  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  related_type?: string;
  related_id?: string;
  actor_id?: string;
  action_url?: string;
}

export interface NotificationCounts {
  total_count: number;
  unread_count: number;
}

export const NOTIFICATION_CATEGORIES = {
  social: [
    'content_liked',
    'content_commented',
    'content_reviewed',
    'content_rated',
    'user_followed',
    'user_mentioned',
    'content_approved',
    'content_rejected',
  ],
  system: ['system_announcement', 'account_update', 'security_alert'],
  marketplace: [
    'marketplace_purchase',
    'marketplace_sale',
    'marketplace_commission',
  ],
  referral: ['referral_signup', 'referral_reward'],
  organization: ['org_invite', 'org_update'],
} as const;

export function getNotificationCategory(type: NotificationType): string {
  for (const [category, types] of Object.entries(NOTIFICATION_CATEGORIES)) {
    if ((types as readonly string[]).includes(type)) {
      return category;
    }
  }
  return 'other';
}
