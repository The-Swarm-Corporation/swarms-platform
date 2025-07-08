'use client';

import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  Star,
  User,
  Trash2,
  Archive,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Inbox,
  Mail,
  MailOpen,
  Clock,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { trpc } from '@/shared/utils/trpc/trpc';
import { formatDistanceToNow, format } from 'date-fns';
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

// Define socialTypes outside component to avoid dependency issues
const SOCIAL_TYPES: NotificationType[] = [
  'content_liked',
  'content_commented',
  'comment_replied',
  'content_reviewed',
  'content_rated',
  'user_followed',
  'user_mentioned',
];

export default function NotificationsPage() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'unread' | 'read' | 'archived'
  >('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const {
    data: notificationsData,
    refetch,
    isLoading,
    isFetching,
  } = trpc.notifications.getUserNotifications.useQuery(
    {
      limit: 50,
    },
    {
      staleTime: 30000,
    },
  );

  const utils = trpc.useUtils();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markNotificationsAsReadMutation =
    trpc.notifications.markNotificationsAsRead.useMutation({
      onMutate: async ({ notificationIds }) => {
        await utils.notifications.getUserNotifications.cancel();
        const previousData = utils.notifications.getUserNotifications.getData({
          limit: 50,
        });

        if (previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            {
              ...previousData,
              notifications: previousData.notifications.map(
                (notification: any) =>
                  notificationIds.includes(notification.id)
                    ? {
                        ...notification,
                        status: 'read',
                        read_at: new Date().toISOString(),
                      }
                    : notification,
              ),
            },
          );
        }

        return { previousData };
      },
      onError: (_, __, context) => {
        if (context?.previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            context.previousData,
          );
        }
      },
      onSettled: () => {
        setSelectedNotifications([]);
      },
    });

  const markNotificationsAsUnreadMutation =
    trpc.notifications.markNotificationsAsUnread.useMutation({
      onMutate: async ({ notificationIds }) => {
        await utils.notifications.getUserNotifications.cancel();
        const previousData = utils.notifications.getUserNotifications.getData({
          limit: 50,
        });

        if (previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            {
              ...previousData,
              notifications: previousData.notifications.map(
                (notification: any) =>
                  notificationIds.includes(notification.id)
                    ? { ...notification, status: 'unread', read_at: null }
                    : notification,
              ),
            },
          );
        }

        return { previousData };
      },
      onError: (_, __, context) => {
        if (context?.previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            context.previousData,
          );
        }
      },
    });

  const deleteNotificationsMutation =
    trpc.notifications.deleteNotifications.useMutation({
      onMutate: async ({ notificationIds }) => {
        await utils.notifications.getUserNotifications.cancel();
        const previousData = utils.notifications.getUserNotifications.getData({
          limit: 50,
        });

        if (previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            {
              ...previousData,
              notifications: previousData.notifications.filter(
                (notification: any) =>
                  !notificationIds.includes(notification.id),
              ),
            },
          );
        }

        return { previousData };
      },
      onError: (_, __, context) => {
        if (context?.previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            context.previousData,
          );
        }
      },
      onSettled: () => {
        setSelectedNotifications([]);
      },
    });

  const archiveNotificationsMutation =
    trpc.notifications.archiveNotifications.useMutation({
      onMutate: async ({ notificationIds }) => {
        await utils.notifications.getUserNotifications.cancel();
        const previousData = utils.notifications.getUserNotifications.getData({
          limit: 50,
        });

        if (previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            {
              ...previousData,
              notifications: previousData.notifications.map(
                (notification: any) =>
                  notificationIds.includes(notification.id)
                    ? { ...notification, status: 'archived' }
                    : notification,
              ),
            },
          );
        }

        return { previousData };
      },
      onError: (_, __, context) => {
        if (context?.previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            context.previousData,
          );
        }
      },
      onSettled: () => {
        setSelectedNotifications([]);
      },
    });

  const unarchiveNotificationsMutation =
    trpc.notifications.unarchiveNotifications.useMutation({
      onMutate: async ({ notificationIds }) => {
        await utils.notifications.getUserNotifications.cancel();
        const previousData = utils.notifications.getUserNotifications.getData({
          limit: 50,
        });

        if (previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            {
              ...previousData,
              notifications: previousData.notifications.map(
                (notification: any) =>
                  notificationIds.includes(notification.id)
                    ? {
                        ...notification,
                        status: notification.read_at ? 'read' : 'unread',
                      }
                    : notification,
              ),
            },
          );
        }

        return { previousData };
      },
      onError: (_, __, context) => {
        if (context?.previousData) {
          utils.notifications.getUserNotifications.setData(
            { limit: 50 },
            context.previousData,
          );
        }
      },
      onSettled: () => {
        setSelectedNotifications([]);
      },
    });

  const router = useRouter();

  const notifications = useMemo(() => {
    let filtered = (notificationsData?.notifications || []).filter(
      (n: NotificationRow) => SOCIAL_TYPES.includes(n.type),
    );

    if (searchQuery) {
      filtered = filtered.filter(
        (n: NotificationRow) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType === 'unread') {
      filtered = filtered.filter((n: NotificationRow) => n.status === 'unread');
    } else if (filterType === 'read') {
      filtered = filtered.filter((n: NotificationRow) => n.status === 'read');
    } else if (filterType === 'archived') {
      filtered = filtered.filter(
        (n: NotificationRow) => n.status === 'archived',
      );
    } else if (filterType === 'all') {
      filtered = filtered.filter(
        (n: NotificationRow) => n.status !== 'archived',
      );
    }

    filtered.sort((a: NotificationRow, b: NotificationRow) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [notificationsData?.notifications, searchQuery, filterType, sortBy]);

  const handleMarkAllRead = useCallback(() => {
    markAsReadMutation.mutate({});
  }, [markAsReadMutation]);

  const handleSelectNotification = useCallback(
    (notificationId: string, checked: boolean) => {
      if (checked) {
        setSelectedNotifications((prev) => [...prev, notificationId]);
      } else {
        setSelectedNotifications((prev) =>
          prev.filter((id) => id !== notificationId),
        );
      }
    },
    [],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedNotifications(notifications.map((n: any) => n.id));
      } else {
        setSelectedNotifications([]);
      }
    },
    [notifications],
  );

  const handleBulkMarkAsRead = useCallback(() => {
    if (selectedNotifications.length > 0) {
      markNotificationsAsReadMutation.mutate({
        notificationIds: selectedNotifications,
      });
    }
  }, [selectedNotifications, markNotificationsAsReadMutation]);

  const handleBulkDelete = useCallback(() => {
    if (selectedNotifications.length > 0) {
      deleteNotificationsMutation.mutate({
        notificationIds: selectedNotifications,
      });
    }
  }, [selectedNotifications, deleteNotificationsMutation]);

  const handleBulkArchive = useCallback(() => {
    if (selectedNotifications.length > 0) {
      if (filterType === 'archived') {
        unarchiveNotificationsMutation.mutate({
          notificationIds: selectedNotifications,
        });
      } else {
        archiveNotificationsMutation.mutate({
          notificationIds: selectedNotifications,
        });
      }
    }
  }, [
    selectedNotifications,
    archiveNotificationsMutation,
    unarchiveNotificationsMutation,
    filterType,
  ]);

  const handleNotificationClick = useCallback(
    (notification: any) => {
      if (notification.status === 'unread') {
        markNotificationsAsReadMutation.mutate({
          notificationIds: [notification.id],
        });
      }

      if (notification.action_url) {
        if (notification.action_url.startsWith('http')) {
          window.open(notification.action_url, '_blank');
        } else {
          router.push(notification.action_url);
        }
      }
    },
    [markNotificationsAsReadMutation, router],
  );

  // Remove unused handleLoadMore for now - can be added back when implementing pagination
  // const handleLoadMore = useCallback(() => {
  //   if (notificationsData?.hasMore) {
  //     setPage(prev => prev + 1);
  //   }
  // }, [notificationsData?.hasMore]);

  const unreadCount = notifications.filter(
    (n: any) => n.status === 'unread',
  ).length;

  return (
    <div className="h-screen flex flex-col bg-background w-full">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Inbox className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleMarkAllRead}
                    disabled={
                      markAsReadMutation.isPending || isLoading || isFetching
                    }
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all as read
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b bg-card/30 px-6 py-3">
        <div className="flex items-center gap-4 w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-800"
              disabled={isLoading}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filterType === 'all'
                  ? 'All'
                  : filterType === 'unread'
                    ? 'Unread'
                    : filterType === 'read'
                      ? 'Read'
                      : 'Archived'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                <Inbox className="h-4 w-4 mr-2" />
                All notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('unread')}>
                <Mail className="h-4 w-4 mr-2" />
                Unread only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('read')}>
                <MailOpen className="h-4 w-4 mr-2" />
                Read only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('archived')}>
                <Archive className="h-4 w-4 mr-2" />
                Archived
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')
                }
              >
                <Clock className="h-4 w-4 mr-2" />
                Sort by {sortBy === 'newest' ? 'oldest' : 'newest'} first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {selectedNotifications.length > 0 && (
        <div className="border-b bg-primary/5 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedNotifications.length} selected
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkMarkAsRead}
                  disabled={
                    markNotificationsAsReadMutation.isPending ||
                    isLoading ||
                    isFetching
                  }
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkArchive}
                  disabled={
                    archiveNotificationsMutation.isPending ||
                    unarchiveNotificationsMutation.isPending ||
                    isLoading ||
                    isFetching
                  }
                >
                  <Archive className="h-4 w-4 mr-1" />
                  {filterType === 'archived' ? 'Unarchive' : 'Archive'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={
                    deleteNotificationsMutation.isPending ||
                    isLoading ||
                    isFetching
                  }
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNotifications([])}
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                {searchQuery ? (
                  <Search className="h-12 w-12 text-muted-foreground/50" />
                ) : filterType === 'archived' ? (
                  <Archive className="h-12 w-12 text-muted-foreground/50" />
                ) : filterType !== 'all' ? (
                  <Search className="h-12 w-12 text-muted-foreground/50" />
                ) : (
                  <Bell className="h-12 w-12 text-muted-foreground/50" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery
                  ? 'No matching notifications'
                  : filterType === 'archived'
                    ? 'No archived notifications'
                    : filterType !== 'all'
                      ? `No ${filterType} notifications`
                      : 'No notifications'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? 'Try adjusting your search criteria.'
                  : filterType === 'archived'
                    ? 'Notifications you archive will appear here. You can unarchive them to bring them back to your main feed.'
                    : filterType !== 'all'
                      ? 'Try adjusting your filter criteria or check other notification types.'
                      : "You're all caught up! New notifications will appear here when people interact with your content."}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="border-b bg-card/50 px-6 py-2 flex items-center gap-4">
              <Checkbox
                checked={
                  selectedNotifications.length === notifications.length &&
                  notifications.length > 0
                }
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary"
                disabled={isLoading || isFetching}
              />
              <span className="text-sm text-muted-foreground">
                {notifications.length} notification
                {notifications.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-border/50">
                {notifications.map((notification: any) => {
                  const Icon = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type);
                  const timeAgo = formatDistanceToNow(
                    new Date(notification.created_at),
                    { addSuffix: true },
                  );
                  const fullDate = format(
                    new Date(notification.created_at),
                    'MMM d, yyyy',
                  );
                  const isUnread = notification.status === 'unread';
                  const isArchived = notification.status === 'archived';
                  const isSelected = selectedNotifications.includes(
                    notification.id,
                  );

                  return (
                    <div
                      key={notification.id}
                      className={`group relative transition-all duration-200 ease-in-out ${
                        isSelected
                          ? 'bg-primary/10 border-l-4 border-l-primary'
                          : isUnread
                            ? 'bg-accent/30 hover:bg-accent/50 hover:shadow-sm'
                            : 'opacity-70 hover:opacity-100 hover:bg-accent/20 hover:shadow-sm'
                      } ${isLoading || isFetching ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-4 md:px-6 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectNotification(
                              notification.id,
                              checked as boolean,
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity data-[state=checked]:opacity-100"
                          disabled={isLoading || isFetching}
                        />

                        <div
                          className={`p-2 rounded-full ${isUnread ? 'bg-primary/10' : 'bg-muted/30'}`}
                        >
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>

                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p
                                  className={`text-sm truncate transition-colors ${
                                    isUnread
                                      ? 'font-semibold text-foreground'
                                      : 'font-normal text-muted-foreground/80'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                {isUnread && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <div
                                className={`text-sm line-clamp-2 transition-colors ${
                                  isUnread
                                    ? 'text-muted-foreground'
                                    : 'text-muted-foreground/60'
                                }`}
                              >
                                <MentionText text={notification.message} />
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span
                                className="text-xs text-muted-foreground/70"
                                title={fullDate}
                              >
                                {timeAgo}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity"
                                    disabled={isLoading || isFetching}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="border-gray-800"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isUnread) {
                                        markNotificationsAsReadMutation.mutate({
                                          notificationIds: [notification.id],
                                        });
                                      } else {
                                        markNotificationsAsUnreadMutation.mutate(
                                          {
                                            notificationIds: [notification.id],
                                          },
                                        );
                                      }
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Mark as {isUnread ? 'read' : 'unread'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isArchived) {
                                        unarchiveNotificationsMutation.mutate({
                                          notificationIds: [notification.id],
                                        });
                                      } else {
                                        archiveNotificationsMutation.mutate({
                                          notificationIds: [notification.id],
                                        });
                                      }
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    {isArchived ? 'Unarchive' : 'Archive'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotificationsMutation.mutate({
                                        notificationIds: [notification.id],
                                      });
                                    }}
                                    className="text-destructive cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
