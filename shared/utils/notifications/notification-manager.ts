import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type NotificationType =
  | 'content_liked'
  | 'content_commented'
  | 'comment_replied'
  | 'content_reviewed'
  | 'content_rated'
  | 'user_followed'
  | 'user_mentioned'
  | 'content_approved'
  | 'content_rejected'
  | 'system_announcement'
  | 'account_update';

interface NotificationBatch {
  userId: string;
  notifications: Array<{
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    actionUrl?: string;
    relatedType?: string;
    relatedId?: string;
    actorId?: string;
  }>;
}

class NotificationManager {
  private batchQueue: Map<string, NotificationBatch> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 5000;
  private readonly MAX_BATCH_SIZE = 50;

  async queueNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    actionUrl?: string;
    relatedType?: string;
    relatedId?: string;
    actorId?: string;
  }) {
    const { userId, ...notification } = params;

    let batch = this.batchQueue.get(userId);
    if (!batch) {
      batch = { userId, notifications: [] };
      this.batchQueue.set(userId, batch);
    }

    batch.notifications.push(notification);

    if (batch.notifications.length >= this.MAX_BATCH_SIZE) {
      await this.processBatch(userId);
    } else {
      this.scheduleBatchProcessing();
    }
  }

  private scheduleBatchProcessing() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(async () => {
      await this.processAllBatches();
    }, this.BATCH_DELAY);
  }

  private async processAllBatches() {
    const userIds = Array.from(this.batchQueue.keys());

    for (const userId of userIds) {
      await this.processBatch(userId);
    }
  }

  private async processBatch(userId: string) {
    const batch = this.batchQueue.get(userId);
    if (!batch || batch.notifications.length === 0) return;

    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.notifications_enabled) {
        this.batchQueue.delete(userId);
        return;
      }

      const filteredNotifications = this.filterNotificationsByPreferences(
        batch.notifications,
        preferences,
      );

      if (filteredNotifications.length === 0) {
        this.batchQueue.delete(userId);
        return;
      }

      const deduplicatedNotifications = this.deduplicateNotifications(
        filteredNotifications,
      );

      await this.insertNotifications(userId, deduplicatedNotifications);

      this.batchQueue.delete(userId);
    } catch (error) {
      console.error(
        `Failed to process notification batch for user ${userId}:`,
        error,
      );
    }
  }

  private async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('swarms_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return {
          notifications_enabled: true,
          social_notifications: true,
          system_notifications: true,
          quiet_hours_enabled: false,
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
          timezone: 'UTC',
        };
      }

      return data || {};
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return { notifications_enabled: true, social_notifications: true };
    }
  }

  private filterNotificationsByPreferences(
    notifications: any[],
    preferences: any,
  ) {
    return notifications.filter((notification) => {
      if (
        [
          'content_liked',
          'content_commented',
          'content_reviewed',
          'content_rated',
          'user_followed',
          'user_mentioned',
        ].includes(notification.type)
      ) {
        return preferences.social_notifications !== false;
      }

      if (
        ['system_announcement', 'security_alert'].includes(notification.type)
      ) {
        return preferences.system_notifications !== false;
      }

      return true;
    });
  }

  private deduplicateNotifications(notifications: any[]) {
    const seen = new Set();
    const deduplicated = [];

    for (const notification of notifications) {
      const key = `${notification.type}-${notification.relatedType}-${notification.relatedId}-${notification.actorId}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(notification);
      }
    }

    return deduplicated;
  }

  private async insertNotifications(userId: string, notifications: any[]) {
    const { error } = await supabase
      .from('swarms_notifications')
      .insert(
        notifications.map((notification) => ({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          status: 'unread' as const,
          action_url: notification.actionUrl,
          related_type: notification.relatedType,
          related_id: notification.relatedId,
          actor_id: notification.actorId,
        })),
      );

    if (error) {
      console.error('Failed to insert notifications:', error);
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`Failed to insert notifications: ${error.message}`);
      }
    }
  }

  async flush() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    await this.processAllBatches();
  }

  getQueueStatus() {
    const totalNotifications = Array.from(this.batchQueue.values()).reduce(
      (total, batch) => total + batch.notifications.length,
      0,
    );

    return {
      batchCount: this.batchQueue.size,
      totalNotifications,
      isProcessing: this.batchTimeout !== null,
    };
  }
}

export const notificationManager = new NotificationManager();

if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('Flushing notification queue before shutdown...');
    await notificationManager.flush();
  });

  process.on('SIGINT', async () => {
    console.log('Flushing notification queue before shutdown...');
    await notificationManager.flush();
  });
}
