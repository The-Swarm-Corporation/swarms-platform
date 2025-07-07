'use client';

import { useState, useCallback, memo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { trpc } from '@/shared/utils/trpc/trpc';
import NotificationPanel from './notification-panel';

interface NotificationBellProps {
  className?: string;
}

function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: counts } = trpc.notifications.getNotificationCounts.useQuery(
    undefined,
    {
      refetchInterval: 30000,
      staleTime: 25000,
      refetchOnWindowFocus: true, // Refresh when user returns to tab
    }
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const unreadCount = counts?.unread_count || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative h-9 w-9 p-0 ${className || ''}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={30}>
        <NotificationPanel onClose={handleClose} />
      </PopoverContent>
    </Popover>
  );
}

export default memo(NotificationBell);
