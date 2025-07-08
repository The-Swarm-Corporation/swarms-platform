import { router, userProcedure } from '@/app/api/trpc/trpc-router';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { User } from '@supabase/supabase-js';

function handleNotificationError(error: any, operation: string): never {
  console.error(`Notification ${operation} failed:`, error);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: `Failed to ${operation}. Please try again.`,
  });
}

const NotificationTypeSchema = z.enum([
  'content_liked',
  'content_commented',
  'comment_replied',
  'content_reviewed',
  'content_rated',
  'user_followed',
  'user_mentioned',
]);

const NotificationStatusSchema = z.enum(['unread', 'read', 'archived']);

const notificationsRouter = router({
  getUserNotifications: userProcedure
    .input(
      z.object({
        status: NotificationStatusSchema.optional(),
        type: NotificationTypeSchema.optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      let query = ctx.supabase
        .from('swarms_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (input.status) {
        query = query.eq('status', input.status);
      }

      if (input.type) {
        query = query.eq('type', input.type);
      }

      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data, error, count } = await query;

      if (error) {
        handleNotificationError(error, 'fetch notifications');
      }

      return {
        notifications: data || [],
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      };
    }),

  getNotificationCounts: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user as User;

    const { data, error } = await ctx.supabase
      .from('swarms_notifications')
      .select('status')
      .eq('user_id', user.id);

    if (error) {
      handleNotificationError(error, 'fetch notification counts');
    }

    const total_count = data?.length || 0;
    const unread_count =
      data?.filter((n: any) => n.status === 'unread').length || 0;

    return { total_count, unread_count };
  }),

  markAsRead: userProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      let query = ctx.supabase
        .from('swarms_notifications')
        .update({
          status: 'read' as const,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (input.notificationIds) {
        query = query.in('id', input.notificationIds);
      }

      const { error, count } = await query;

      if (error) {
        handleNotificationError(error, 'mark notifications as read');
      }

      return { updated: count || 0 };
    }),

  deleteNotifications: userProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { error } = await (ctx.supabase as any)
        .from('swarms_notifications')
        .delete()
        .eq('user_id', user.id)
        .in('id', input.notificationIds);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete notifications',
        });
      }

      return { success: true };
    }),

  archiveNotifications: userProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { error } = await (ctx.supabase as any)
        .from('swarms_notifications')
        .update({ status: 'archived' })
        .eq('user_id', user.id)
        .in('id', input.notificationIds);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to archive notifications',
        });
      }

      return { success: true };
    }),

  unarchiveNotifications: userProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { data: notifications, error: fetchError } = await (ctx.supabase as any)
        .from('swarms_notifications')
        .select('id, read_at')
        .eq('user_id', user.id)
        .in('id', input.notificationIds);

      if (fetchError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications for unarchiving',
        });
      }

      for (const notification of notifications) {
        const status = notification.read_at ? 'read' : 'unread';

        const { error } = await (ctx.supabase as any)
          .from('swarms_notifications')
          .update({ status })
          .eq('user_id', user.id)
          .eq('id', notification.id);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to unarchive notifications',
          });
        }
      }

      return { success: true };
    }),

  markNotificationsAsRead: userProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { error } = await (ctx.supabase as any)
        .from('swarms_notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .in('id', input.notificationIds);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notifications as read',
        });
      }

      return { success: true };
    }),

  markNotificationsAsUnread: userProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { error } = await (ctx.supabase as any)
        .from('swarms_notifications')
        .update({
          status: 'unread',
          read_at: null,
        })
        .eq('user_id', user.id)
        .in('id', input.notificationIds);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notifications as unread',
        });
      }

      return { success: true };
    }),

  getNotificationPreferences: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user as User;

    const { data, error } = await (ctx.supabase as any)
      .from('swarms_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
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

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch notification preferences',
      });
    }

    return data;
  }),

  updateNotificationPreferences: userProcedure
    .input(
      z.object({
        notifications_enabled: z.boolean().optional(),
        social_notifications: z.boolean().optional(),
        system_notifications: z.boolean().optional(),
        quiet_hours_enabled: z.boolean().optional(),
        quiet_hours_start: z.string().optional(),
        quiet_hours_end: z.string().optional(),
        timezone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { data, error } = await (ctx.supabase as any)
        .from('swarms_notification_preferences')
        .upsert({
          user_id: user.id,
          ...input,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification preferences',
        });
      }

      return data;
    }),

  bulkMarkAsRead: userProcedure
    .input(
      z.object({
        type: NotificationTypeSchema.optional(),
        olderThan: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      let query = (ctx.supabase as any)
        .from('swarms_notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (input.type) {
        query = query.eq('type', input.type);
      }

      if (input.olderThan) {
        query = query.lt('created_at', input.olderThan);
      }

      const { error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk mark notifications as read',
        });
      }

      return { success: true };
    }),

  cleanupOldNotifications: userProcedure
    .input(
      z.object({
        olderThanDays: z.number().min(1).max(365).default(90),
        status: NotificationStatusSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.olderThanDays);

      let query = (ctx.supabase as any)
        .from('swarms_notifications')
        .delete()
        .eq('user_id', user.id)
        .lt('created_at', cutoffDate.toISOString());

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cleanup old notifications',
        });
      }

      return { success: true };
    }),

  getPreferences: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.user as User;

    const { data, error } = await (ctx.supabase as any)
      .from('swarms_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      const defaultPreferences = {
        user_id: user.id,
        notifications_enabled: true,
        social_notifications: true,
        system_notifications: true,
        marketplace_notifications: true,
        referral_notifications: true,
        quiet_hours_enabled: false,
        timezone: 'UTC',
      };

      const { data: newPrefs, error: createError } = await (ctx.supabase as any)
        .from('swarms_notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (createError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create notification preferences',
        });
      }

      return newPrefs;
    }

    return data;
  }),

  updatePreferences: userProcedure
    .input(
      z.object({
        notifications_enabled: z.boolean().optional(),
        social_notifications: z.boolean().optional(),
        system_notifications: z.boolean().optional(),
        marketplace_notifications: z.boolean().optional(),
        referral_notifications: z.boolean().optional(),
        quiet_hours_enabled: z.boolean().optional(),
        quiet_hours_start: z.string().optional(),
        quiet_hours_end: z.string().optional(),
        timezone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { data, error } = await (ctx.supabase as any)
        .from('swarms_notification_preferences')
        .upsert({
          user_id: user.id,
          ...input,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification preferences',
        });
      }

      return data;
    }),

  createNotification: userProcedure
    .input(
      z.object({
        type: NotificationTypeSchema,
        title: z.string().min(1).max(255),
        message: z.string().min(1).max(1000),
        data: z.record(z.any()).optional(),
        related_type: z.string().optional(),
        related_id: z.string().uuid().optional(),
        actor_id: z.string().uuid().optional(),
        action_url: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.user as User;

      const { data, error } = await (ctx.supabase as any)
        .from('swarms_notifications')
        .insert({
          user_id: user.id,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data || {},
          status: 'unread',
          related_type: input.related_type,
          related_id: input.related_id,
          actor_id: input.actor_id,
          action_url: input.action_url,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create notification',
        });
      }

      return data;
    }),
});

export default notificationsRouter;
