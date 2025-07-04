'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/utils/cn';
import { trpc } from '@/shared/utils/trpc/trpc';
import NotificationPanel from './notification-panel';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: counts, refetch: refetchCounts } = trpc.notifications.getNotificationCounts.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    }
  );

  const unreadCount = counts?.unread_count || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative h-9 w-9 p-0 hover:bg-accent/50 transition-colors',
            className
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-medium min-w-[20px] animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0 
              ? `${unreadCount} unread notifications` 
              : 'No unread notifications'
            }
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 border-border/50 shadow-lg" 
        align="end"
        sideOffset={8}
      >
        <NotificationPanel 
          onClose={() => setIsOpen(false)}
          onNotificationRead={refetchCounts}
        />
      </PopoverContent>
    </Popover>
  );
}
