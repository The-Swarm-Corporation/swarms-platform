'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Check, 
  Trash2, 
  ExternalLink,
  Heart,
  MessageSquare,
  Star,
  User,
  CheckCircle,
  XCircle,
  Bell,
  ShoppingCart,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useRouter } from 'next/navigation';
import { Notification, NotificationType } from '@/shared/types/notifications';

interface NotificationItemProps {
  notification: any;
  onRead: () => void;
  onDelete: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'content_liked':
      return Heart;
    case 'content_commented':
      return MessageSquare;
    case 'content_reviewed':
    case 'content_rated':
      return Star;
    case 'user_followed':
      return User;
    case 'content_approved':
      return CheckCircle;
    case 'content_rejected':
      return XCircle;
    case 'marketplace_purchase':
    case 'marketplace_sale':
    case 'marketplace_commission':
      return ShoppingCart;
    case 'referral_signup':
    case 'referral_reward':
      return Gift;
    case 'system_announcement':
    case 'account_update':
    case 'security_alert':
      return AlertTriangle;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  if (type.includes('content_') || type === 'user_mentioned') {
    return {
      bg: 'bg-[#FF6B6B]/5',
      border: 'border-[#FF6B6B]/20',
      icon: 'text-[#FF6B6B]',
      iconBg: 'bg-[#FF6B6B]/10',
    };
  }
  
  if (type.includes('marketplace_')) {
    return {
      bg: 'bg-[#FFD93D]/5',
      border: 'border-[#FFD93D]/20',
      icon: 'text-[#FFD93D]',
      iconBg: 'bg-[#FFD93D]/10',
    };
  }
  
  if (type.includes('referral_') || type === 'user_followed') {
    return {
      bg: 'bg-[#4ECDC4]/5',
      border: 'border-[#4ECDC4]/20',
      icon: 'text-[#4ECDC4]',
      iconBg: 'bg-[#4ECDC4]/10',
    };
  }
  
  return {
    bg: 'bg-muted/30',
    border: 'border-border/50',
    icon: 'text-muted-foreground',
    iconBg: 'bg-muted/50',
  };
};

export default function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      onRead();
    },
    onError: (error) => {
      toast({
        title: 'Failed to mark as read',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteNotificationMutation = trpc.notifications.deleteNotifications.useMutation({
    onSuccess: () => {
      onDelete();
      toast({
        title: 'Notification deleted',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete notification',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const Icon = getNotificationIcon(notification.type as NotificationType);
  const colors = getNotificationColor(notification.type as NotificationType);
  const isUnread = notification.status === 'unread';

  const handleClick = () => {
    if (isUnread) {
      markAsReadMutation.mutate({
        notificationIds: [notification.id],
      });
    }

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate({
      notificationIds: [notification.id],
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate({
      notificationIds: [notification.id],
    });
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <div
      className={cn(
        'relative p-4 transition-all duration-200 cursor-pointer group',
        colors.bg,
        isUnread && colors.border,
        isUnread && 'border-l-2',
        isHovered && 'bg-accent/30',
        notification.action_url && 'hover:bg-accent/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 p-2 rounded-full', colors.iconBg)}>
          <Icon className={cn('h-4 w-4', colors.icon)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium leading-5',
                isUnread ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {notification.title}
              </p>
              <p className={cn(
                'text-sm mt-1 leading-5',
                isUnread ? 'text-muted-foreground' : 'text-muted-foreground/70'
              )}>
                {notification.message}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {isUnread && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
                      isHovered && 'opacity-100'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isUnread && (
                    <DropdownMenuItem onClick={handleMarkAsRead}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  {notification.action_url && (
                    <DropdownMenuItem onClick={() => router.push(notification.action_url!)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View details
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground/70">
              {timeAgo}
            </span>
            
            {notification.data && typeof notification.data === 'object' && (
              <>
                {notification.data.contentType && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                    {notification.data.contentType}
                  </Badge>
                )}
                {notification.data.rating && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                    {notification.data.rating}★
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {(markAsReadMutation.isPending || deleteNotificationMutation.isPending) && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
