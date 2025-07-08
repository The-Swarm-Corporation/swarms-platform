import { createClient } from '@supabase/supabase-js';
import { notificationManager } from './notification-manager';

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function createNotificationSmart(params: {
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
  return notificationManager.queueNotification(params);
}

export async function createNotification(params: {
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
  try {
    const { data, error } = await supabase
      .from('swarms_notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data || {},
        status: 'unread' as const,
        action_url: params.actionUrl,
        related_type: params.relatedType,
        related_id: params.relatedId,
        actor_id: params.actorId,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        params
      });
      throw new Error(`Notification creation failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return null;
  }
}

export async function createLikeNotification(
  contentOwnerId: string,
  actorId: string,
  contentType: 'prompt' | 'agent' | 'tool',
  contentId: string,
  contentTitle: string,
) {
  if (contentOwnerId === actorId) return null;

  try {
    const { data: actorData } = await supabase
      .from('users')
      .select('username, full_name, email')
      .eq('id', actorId)
      .single();

    // Fallback: username -> full_name -> email (before @) -> 'Someone'
    const actorUsername = actorData?.username ||
                         actorData?.full_name ||
                         actorData?.email?.split('@')[0] ||
                         'Someone';

    return createNotification({
      userId: contentOwnerId,
      type: 'content_liked',
      title: 'Your content was liked!',
      message: `@${actorUsername} liked your ${contentType} "${contentTitle}"`,
      data: { contentType, contentTitle, contentId, actorId, actorUsername },
      actionUrl: `/${contentType}/${contentId}`,
      relatedType: contentType,
      relatedId: contentId,
      actorId,
    });
  } catch (error) {
    console.error('Failed to create like notification:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return null;
  }
}

export async function createCommentNotification(
  contentOwnerId: string,
  actorId: string,
  contentType: 'prompt' | 'agent' | 'tool',
  contentId: string,
  contentTitle: string,
) {
  if (contentOwnerId === actorId) return null;

  try {
    const { data: actorData } = await supabase
      .from('users')
      .select('username, full_name, email')
      .eq('id', actorId)
      .single();

    // Fallback: username -> full_name -> email (before @) -> 'Someone'
    const actorUsername = actorData?.username ||
                         actorData?.full_name ||
                         actorData?.email?.split('@')[0] ||
                         'Someone';

    return createNotification({
      userId: contentOwnerId,
      type: 'content_commented',
      title: 'New comment on your content!',
      message: `@${actorUsername} commented on your ${contentType} "${contentTitle}"`,
      data: { contentType, contentTitle, contentId, actorId, actorUsername },
      actionUrl: `/${contentType}/${contentId}#comments`,
      relatedType: contentType,
      relatedId: contentId,
      actorId,
    });
  } catch (error) {
    console.error('Failed to create comment notification:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return null;
  }
}

export async function createReplyNotification(
  commentOwnerId: string,
  actorId: string,
  commentId: string,
  replyContent: string,
  contentType: 'prompt' | 'agent' | 'tool',
  contentId: string,
  contentTitle: string,
) {
  if (commentOwnerId === actorId) return null;

  try {
    const { data: actorData } = await supabase
      .from('users')
      .select('username, full_name, email')
      .eq('id', actorId)
      .single();

    // Fallback: username -> full_name -> email (before @) -> 'Someone'
    const actorUsername = actorData?.username ||
                         actorData?.full_name ||
                         actorData?.email?.split('@')[0] ||
                         'Someone';

    return createNotification({
      userId: commentOwnerId,
      type: 'comment_replied',
      title: 'Someone replied to your comment!',
      message: `@${actorUsername} replied to your comment: "${replyContent.substring(0, 50)}${replyContent.length > 50 ? '...' : ''}"`,
      data: {
        commentId,
        replyContent: replyContent.substring(0, 100),
        contentType,
        contentId,
        contentTitle,
        actorId,
        actorUsername,
      },
      actionUrl: `/${contentType}/${contentId}#comment-${commentId}`,
      relatedType: 'comment',
      relatedId: commentId,
      actorId,
    });
  } catch (error) {
    console.error('Failed to create reply notification:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return null;
  }
}

export async function createFollowNotification(
  userId: string,
  actorId: string,
  actorName: string,
) {
  if (userId === actorId) return null;

  return createNotification({
    userId,
    type: 'user_followed',
    title: 'You have a new follower!',
    message: `${actorName} started following you`,
    data: { actorName, actorId },
    actionUrl: `/users/${actorId}`,
    relatedType: 'user',
    relatedId: actorId,
    actorId,
  });
}

export async function createReviewNotification(
  contentOwnerId: string,
  actorId: string,
  contentType: 'prompt' | 'agent' | 'tool',
  contentId: string,
  contentTitle: string,
  rating: number,
  reviewText: string,
) {
  if (contentOwnerId === actorId) return null;

  return createNotification({
    userId: contentOwnerId,
    type: 'content_reviewed',
    title: 'New review on your content!',
    message: `Your ${contentType} "${contentTitle}" received a ${rating}-star review`,
    data: {
      contentType,
      contentTitle,
      contentId,
      rating,
      reviewText: reviewText.substring(0, 100),
      actorId,
    },
    relatedType: contentType,
    relatedId: contentId,
    actorId,
    actionUrl: `/${contentType}/${contentId}#reviews`,
  });
}

export async function createRatingNotification(
  contentOwnerId: string,
  actorId: string,
  contentType: 'prompt' | 'agent' | 'tool',
  contentId: string,
  contentTitle: string,
  rating: number,
) {
  if (contentOwnerId === actorId) return null;

  return createNotification({
    userId: contentOwnerId,
    type: 'content_rated',
    title: 'Your content was rated!',
    message: `Your ${contentType} "${contentTitle}" received a ${rating}-star rating`,
    data: {
      contentType,
      contentTitle,
      contentId,
      rating,
      actorId,
    },
    relatedType: contentType,
    relatedId: contentId,
    actorId,
    actionUrl: `/${contentType}/${contentId}`,
  });
}

export async function createMentionNotification(
  userId: string,
  actorId: string,
  actorName: string,
  contentType: 'comment' | 'review' | 'reply',
  contentId: string,
  mentionContext: string,
  parentContentType?: 'prompt' | 'agent' | 'tool',
  parentContentId?: string,
) {
  if (userId === actorId) return null;

  try {
    let actorUsername = actorName;
    if (!actorName || actorName === 'Someone') {
      const { data: actorData } = await supabase
        .from('users')
        .select('username')
        .eq('id', actorId)
        .single();

      actorUsername = actorData?.username || 'Someone';
    }

    let actionUrl = `#${contentType}-${contentId}`;
    if (parentContentType && parentContentId) {
      actionUrl = `/${parentContentType}/${parentContentId}#${contentType}-${contentId}`;
    }

    return createNotification({
      userId,
      type: 'user_mentioned',
      title: 'You were mentioned!',
      message: `@${actorUsername} mentioned you in a ${contentType}: "${mentionContext.substring(0, 50)}${mentionContext.length > 50 ? '...' : ''}"`,
      data: {
        actorName: actorUsername,
        actorId,
        contentType,
        mentionContext: mentionContext.substring(0, 100),
        parentContentType,
        parentContentId,
      },
      relatedType: contentType,
      relatedId: contentId,
      actorId,
      actionUrl,
    });
  } catch (error) {
    console.error('Failed to create mention notification:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return null;
  }
}

export async function createBulkNotifications(
  notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    actionUrl?: string;
    relatedType?: string;
    relatedId?: string;
    actorId?: string;
  }>,
) {
  try {
    const { data, error } = await supabase
      .from('swarms_notifications')
      .insert(
        notifications.map((notification) => ({
          user_id: notification.userId,
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
      )
      .select();

    if (error) {
      console.error('Failed to create bulk notifications:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return null;
  }
}

export async function detectAndNotifyMentions(
  content: string,
  actorId: string,
  contentType: 'comment' | 'review' | 'reply',
  contentId: string,
  parentContentType?: 'prompt' | 'agent' | 'tool',
  parentContentId?: string,
) {
  try {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = content.match(mentionRegex);

    if (!mentions || mentions.length === 0) return [];

    const { data: actorData } = await supabase
      .from('users')
      .select('username, full_name, email')
      .eq('id', actorId)
      .single();

    // Fallback: username -> full_name -> email (before @) -> 'Someone'
    const actorUsername = actorData?.username ||
                         actorData?.full_name ||
                         actorData?.email?.split('@')[0] ||
                         'Someone';
    const notifications = [];

    const uniqueMentions = Array.from(new Set(mentions));

    for (const mention of uniqueMentions) {
      const username = mention.substring(1);

      const { data: mentionedUser } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .single();

      if (mentionedUser?.id && mentionedUser.id !== actorId) {
        const notification = await createMentionNotification(
          mentionedUser.id,
          actorId,
          actorUsername,
          contentType,
          contentId,
          content,
          parentContentType,
          parentContentId,
        );

        if (notification) {
          notifications.push(notification);
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error('Failed to detect and notify mentions:', error);
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    return [];
  }
}
