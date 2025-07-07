'use client';

import { Bell, CheckCheck, Heart, MessageSquare, Star, User, Trash2, Archive } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { trpc } from '@/shared/utils/trpc/trpc';
import { formatDistanceToNow } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
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

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'content_liked': return Heart;
    case 'content_commented':
    case 'comment_replied': return MessageSquare;
    case 'content_reviewed':
    case 'content_rated': return Star;
    case 'user_followed': return User;
    case 'user_mentioned': return Bell;
    default: return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  if (type.includes('content_')) return 'text-[#FF6B6B]';
  if (type === 'user_followed') return 'text-[#4ECDC4]';
  return 'text-muted-foreground';
};

export default function NotificationsPage() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const { data: notificationsData, refetch } = trpc.notifications.getUserNotifications.useQuery({
    limit: 50,
  }, {
    staleTime: 30000,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markNotificationsAsReadMutation = trpc.notifications.markNotificationsAsRead.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedNotifications([]);
    },
  });

  const deleteNotificationsMutation = trpc.notifications.deleteNotifications.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedNotifications([]);
    },
  });

  const archiveNotificationsMutation = trpc.notifications.archiveNotifications.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedNotifications([]);
    },
  });

  const router = useRouter()
  const socialTypes = useMemo(() => [
    'content_liked',
    'content_commented',
    'comment_replied',
    'content_reviewed',
    'content_rated',
    'user_followed',
    'user_mentioned'
  ] as NotificationType[], []);

  const notifications = useMemo(() =>
    (notificationsData?.notifications || []).filter((n: NotificationRow) =>
      socialTypes.includes(n.type)
    ),
    [notificationsData?.notifications, socialTypes]
  );

  const handleMarkAllRead = useCallback(() => {
    markAsReadMutation.mutate({});
  }, [markAsReadMutation]);

  const handleSelectNotification = useCallback((notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notifications.map((n: any) => n.id));
    } else {
      setSelectedNotifications([]);
    }
  }, [notifications]);

  const handleBulkMarkAsRead = useCallback(() => {
    if (selectedNotifications.length > 0) {
      markNotificationsAsReadMutation.mutate({
        notificationIds: selectedNotifications
      });
    }
  }, [selectedNotifications, markNotificationsAsReadMutation]);

  const handleBulkDelete = useCallback(() => {
    if (selectedNotifications.length > 0) {
      deleteNotificationsMutation.mutate({
        notificationIds: selectedNotifications
      });
    }
  }, [selectedNotifications, deleteNotificationsMutation]);

  const handleBulkArchive = useCallback(() => {
    if (selectedNotifications.length > 0) {
      archiveNotificationsMutation.mutate({
        notificationIds: selectedNotifications
      });
    }
  }, [selectedNotifications, archiveNotificationsMutation]);

  const handleNotificationClick = useCallback((notification: any) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      markNotificationsAsReadMutation.mutate({
        notificationIds: [notification.id]
      });
    }

    // Navigate to related content
    if (notification.action_url) {
      if (notification.action_url.startsWith('http')) {
        window.open(notification.action_url, '_blank');
      } else {
        router.push(notification.action_url);
      }
    }
  }, [markNotificationsAsReadMutation]);

  // Remove unused handleLoadMore for now - can be added back when implementing pagination
  // const handleLoadMore = useCallback(() => {
  //   if (notificationsData?.hasMore) {
  //     setPage(prev => prev + 1);
  //   }
  // }, [notificationsData?.hasMore]);

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with social interactions on your content
          </p>
        </div>

        {notifications.length > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={markAsReadMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-card border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsRead}
                disabled={markNotificationsAsReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                disabled={archiveNotificationsMutation.isPending}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteNotificationsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              You&apos;re all caught up! New notifications will appear here when people interact with your content.
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Checkbox
                checked={selectedNotifications.length === notifications.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select All ({notifications.length})
              </span>
            </div>
            <div className="divide-y">
              {notifications.map((notification: any) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
                const isUnread = notification.status === 'unread';
                const isSelected = selectedNotifications.includes(notification.id);

                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-accent/50 ${isUnread ? 'bg-accent/20' : ''} ${isSelected ? 'bg-primary/10' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectNotification(notification.id, checked as boolean)}
                      />

                      <div
                        className="flex items-start gap-4 flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="p-3 rounded-full bg-muted/50">
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              <div className="text-muted-foreground mt-1">
                                <MentionText text={notification.message} />
                              </div>
                              <p className="text-sm text-muted-foreground/70 mt-2">{timeAgo}</p>
                            </div>
                            {isUnread && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
