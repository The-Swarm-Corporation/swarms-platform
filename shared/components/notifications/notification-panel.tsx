'use client';

import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  Star,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { trpc } from '@/shared/utils/trpc/trpc';
import { formatDistanceToNow } from 'date-fns';
import { memo, useCallback, useMemo, useState } from 'react';
import MentionText from '@/shared/components/ui/mention-text';
import { useRouter } from 'next/navigation';

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
  | 'account_update'
  | 'security_alert'
  | 'marketplace_purchase'
  | 'marketplace_sale'
  | 'marketplace_commission'
  | 'referral_signup'
  | 'referral_reward'
  | 'org_invite'
  | 'org_update';

interface NotificationRow {
  id: string;
  created_at: string;
  type: NotificationType;
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  action_url: string | null;
  actor_id: string | null;
  related_id: string | null;
  related_type: string | null;
  read_at: string | null;
  updated_at: string;
  user_id: string;
  data: any;
}

interface NotificationPanelProps {
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'content_liked':
      return Heart;
    case 'content_commented':
    case 'comment_replied':
      return MessageSquare;
    case 'content_reviewed':
    case 'content_rated':
      return Star;
    case 'user_followed':
      return User;
    case 'user_mentioned':
      return Bell;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  if (type.includes('content_')) return 'text-[#FF6B6B]';
  if (type === 'user_followed') return 'text-[#4ECDC4]';
  return 'text-muted-foreground';
};

function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [clickingNotificationId, setClickingNotificationId] = useState<
    string | null
  >(null);

  const {
    data: notificationsData,
    refetch,
    isLoading,
  } = trpc.notifications.getUserNotifications.useQuery(
    {
      status: 'unread',
      limit: 20,
    },
    {
      staleTime: 10000,
    },
  );

  const utils = trpc.useUtils();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
      utils.notifications.getNotificationCounts.invalidate();
      onClose();
    },
  });

  const markNotificationsAsReadMutation =
    trpc.notifications.markNotificationsAsRead.useMutation({
      onSuccess: () => {
        refetch();
        utils.notifications.getNotificationCounts.invalidate();
      },
    });

  const router = useRouter();

  const socialTypes = useMemo(
    () =>
      [
        'content_liked',
        'content_commented',
        'comment_replied',
        'content_reviewed',
        'content_rated',
        'user_followed',
        'user_mentioned',
      ] as NotificationType[],
    [],
  );

  const notifications = useMemo(
    () =>
      (notificationsData?.notifications || []).filter((n: NotificationRow) =>
        socialTypes.includes(n.type),
      ),
    [notificationsData?.notifications, socialTypes],
  );

  const handleMarkAllRead = useCallback(() => {
    markAsReadMutation.mutate({});
  }, [markAsReadMutation]);

  const handleNotificationClick = useCallback(
    async (notification: NotificationRow) => {
      if (clickingNotificationId === notification.id) return;

      setClickingNotificationId(notification.id);

      try {
        if (notification.status === 'unread') {
          await markNotificationsAsReadMutation.mutateAsync({
            notificationIds: [notification.id],
          });
        }

        if (notification.action_url) {
          if (notification.action_url.startsWith('http')) {
            window.open(notification.action_url, '_blank');
            onClose();
            setClickingNotificationId(null);
          } else {
            router.push(notification.action_url);
          }
        } else {
          onClose();
          setClickingNotificationId(null);
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        if (notification.action_url) {
          if (notification.action_url.startsWith('http')) {
            window.open(notification.action_url, '_blank');
          } else {
            router.push(notification.action_url);
            return;
          }
        }

        onClose();
        setClickingNotificationId(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [markNotificationsAsReadMutation, onClose, clickingNotificationId, router],
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAsReadMutation.isPending}
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-80">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification: NotificationRow) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              const timeAgo = formatDistanceToNow(
                new Date(notification.created_at),
                { addSuffix: true },
              );
              const isClicking = clickingNotificationId === notification.id;

              return (
                <div
                  key={notification.id}
                  className={`p-4 transition-all duration-200 ease-in-out ${
                    isClicking
                      ? 'bg-accent/40 cursor-wait opacity-75'
                      : `hover:bg-[#ffffff21] hover:shadow-sm cursor-pointer ${
                          notification.status === 'unread'
                            ? 'bg-accent/20'
                            : 'hover:bg-[#ffffff21]'
                        }`
                  }`}
                  onClick={() =>
                    !isClicking && handleNotificationClick(notification)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-muted/50 flex-shrink-0">
                      {isClicking ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.title}
                      </p>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        <MentionText text={notification.message} />
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {timeAgo}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full text-sm text-primary hover:text-primary/80"
          onClick={() => {
            router.push('/platform/notifications');
            onClose();
          }}
        >
          See all notifications
        </Button>
      </div>
    </div>
  );
}

export default memo(NotificationPanel);
