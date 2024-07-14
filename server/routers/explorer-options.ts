import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
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

  unlikeComment: userProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;

      const user_id = ctx.session.data.session?.user?.id;
      try {
        const { error } = await ctx.supabase
          .from('swarms_cloud_comments_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user_id);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while unliking comment',
          });
        }

        return { success: true };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unlike comment',
        });
      }
    }),

  addReply: userProcedure
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
        const { data, error } = await ctx.supabase
          .from('swarms_cloud_comments_replies')
          .insert([{ comment_id: commentId, content, user_id }]);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while adding reply',
          });
        }

        return data;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add reply',
        });
      }
    }),

  deleteReply: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const replyId = input;

      const user_id = ctx.session.data.session?.user?.id;

      try {
        const { error } = await ctx.supabase
          .from('swarms_cloud_comments_replies')
          .delete()
          .eq('id', replyId)
          .eq('user_id', user_id);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while deleting reply',
          });
        }

        return { success: true };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete reply',
        });
      }
    }),

  likeReply: userProcedure
    .input(
      z.object({
        replyId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { replyId } = input;

      const user_id = ctx.session.data.session?.user?.id;
      try {
        const { error } = await ctx.supabase
          .from('swarms_cloud_comments_reply_likes')
          .insert([{ reply_id: replyId, user_id }]);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while liking reply',
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to like reply',
        });
      }
    }),

  unlikeReply: publicProcedure
    .input(
      z.object({
        replyId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { replyId } = input;

      const user_id = ctx.session.data.session?.user?.id;

      try {
        const { error } = await ctx.supabase
          .from('swarms_cloud_comments_reply_likes')
          .delete()
          .eq('reply_id', replyId)
          .eq('user_id', user_id);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while unliking reply',
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unlike reply',
        });
      }
    }),

  getReplies: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const commentId = input;

      try {
        const { data: replies, error } = await ctx.supabase
          .from('replies')
          .select(
            `
              id,
              comment_id,
              user_id,
              content,
              created_at,
              updated_at,
              users (
                full_name,
                username,
                email,
                avatar_url
              )
            `,
          )
          .eq('comment_id', commentId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while fetching replies',
          });
        }

        return replies;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch replies',
        });
      }
    }),
});

export default explorerOptionsRouter;
