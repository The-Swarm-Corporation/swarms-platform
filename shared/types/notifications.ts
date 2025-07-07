import { Database } from '@/types_db';

export type NotificationType = Database['public']['Enums']['notification_type'];
export type NotificationStatus =
  Database['public']['Enums']['notification_status'];
export type NotificationRow =
  Database['public']['Tables']['swarms_notifications']['Row'];
export type NotificationInsert =
  Database['public']['Tables']['swarms_notifications']['Insert'];
export type NotificationUpdate =
  Database['public']['Tables']['swarms_notifications']['Update'];
export type NotificationPreferencesRow =
  Database['public']['Tables']['swarms_notification_preferences']['Row'];
export type NotificationPreferencesInsert =
  Database['public']['Tables']['swarms_notification_preferences']['Insert'];
export type NotificationPreferencesUpdate =
  Database['public']['Tables']['swarms_notification_preferences']['Update'];

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

export interface NotificationResponse {
  notifications: NotificationRow[];
  total: number;
  hasMore: boolean;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export const SOCIAL_NOTIFICATION_TYPES: NotificationType[] = [
  'content_liked',
  'content_commented',
  'content_reviewed',
  'content_rated',
  'user_followed',
  'user_mentioned',
] as const;

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
