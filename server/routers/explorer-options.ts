import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
import { PLATFORM, PUBLIC } from '@/shared/constants/links';
import { makeUrl } from '@/shared/utils/helpers';
import { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
const explorerOptionsRouter = router({
  addComment: userProcedure
    .input(
      z.object({
        modelId: z.string(),
        modelType: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { modelId, modelType, content } = input;

      const user_id = ctx.session.data.session?.user?.id;
      const lastSubmites = await ctx.supabase
        .from('swarms_cloud_comments')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if ((lastSubmites?.data ?? [])?.length > 0) {
        const lastSubmit = lastSubmites.data?.[0];
        const lastSubmitTime = new Date(lastSubmit.created_at);
        const currentTime = new Date();
        const diff = currentTime.getTime() - lastSubmitTime.getTime();
        const diffHours = diff / (1000 * 60); // 1 minute
        if (diffHours < 1) {
          throw 'You can only submit one comment per minute';
        }
      }

      try {
        const { error } = await ctx.supabase
          .from('swarms_cloud_comments')
          .insert([
            {
              model_id: modelId,
              model_type: modelType,
              content,
              user_id,
            },
          ]);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while adding comment',
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add comment',
        });
      }
    }),

  editComment: userProcedure
    .input(
      z.object({
        commentId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId, content } = input;

      const user_id = ctx.session.data.session?.user?.id;
      try {
        const comment = await ctx.supabase
          .from('swarms_cloud_comments')
          .update({ content })
          .eq('user_id', user_id)
          .eq('id', commentId)
          .select('*');

        if (comment.error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while editing comment',
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to edit comment',
        });
      }
    }),

  getComments: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const modelId = input;

      try {
        const { data: comments, error } = await ctx.supabase
          .from('swarms_cloud_comments')
          .select(
            `
              id,
              user_id,
              model_id,
              model_type,
              content,
              created_at,
              users (
                full_name,
                username,
                email,
                avatar_url
              )
            `,
          )
          .eq('model_id', modelId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while fetching comments',
          });
        }

        return comments;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch comments',
        });
      }
    }),

  deleteComment: userProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const commentId = input;
      const user_id = ctx.session.data.session?.user?.id;

      try {
        const { error } = await ctx.supabase
          .from('swarms_cloud_comments')
          .delete()
          .eq('user_id', user_id)
          .eq('id', commentId);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while deleting comment',
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete comment',
        });
      }
    }),

  likeComment: userProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;

      const user_id = ctx.session.data.session?.user?.id;
      try {
        const { data, error } = await ctx.supabase
          .from('swarms_cloud_comments_likes')
          .insert([{ comment_id: commentId, user_id }]);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while liking comment',
          });
        }

        return data;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to like comment',
        });
      }
    }),
});

export default explorerOptionsRouter;
