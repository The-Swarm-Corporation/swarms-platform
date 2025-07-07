export { default as NotificationBell } from './notification-bell';
export { default as NotificationPanel } from './notification-panel';

export {
  createNotification,
  createNotificationSmart,
  createLikeNotification,
  createCommentNotification,
  createReplyNotification,
  createReviewNotification,
  createRatingNotification,
  createFollowNotification,
  createMentionNotification,
  createBulkNotifications,
  detectAndNotifyMentions,
} from '@/shared/utils/notifications/create-notifications';

export { notificationManager } from '@/shared/utils/notifications/notification-manager';
