import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
import { PUBLIC } from '@/shared/constants/links';
import { makeUrl } from '@/shared/utils/helpers';
import { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const mainRouter = router({
  getUser: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user;
    if (!user) return null;
    const user_data = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (user_data.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching user data',
      });
    }
    return {
      full_name: user_data.data.full_name,
      email: user.email,
      id: user.id,
      username: user_data.data.username,
    };
  }),
  getUserById: userProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      const user_data = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user_data.data?.email) return null;

      return {
        full_name: user_data.data.full_name,
        email: user_data.data.email,
        id: user_data.data.id,
        username: user_data.data.username,
        avatar: user_data.data.avatar_url,
      };
    }),
  updateUsername: userProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const username = input.username;
      const minLength = 3;
      const maxLength = 16;
      const regex = /^[a-zA-Z0-9_]+$/;

      if (username.length < minLength || username.length > maxLength) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Username must be between ${minLength} and ${maxLength} characters.`,
        });
      }

      if (!regex.test(username)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Username can only contain letters, numbers, and underscores.',
        });
      }

      if (username.includes('__') || username.includes('--')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Username cannot contain consecutive special characters.',
        });
      }

      const blackList = await ctx.supabase
        .from('swarms_cloud_blacklists')
        .select('list')
        .eq('type', 'username');

      if (blackList.data) {
        const blackListed = blackList.data.some((item) =>
          (item?.list as { usernames: string[] })?.usernames?.some((name) =>
            username.toLowerCase().includes(name.toLowerCase()),
          ),
        );
        if (blackListed) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This username is not available.',
          });
        }
      }

      const user = ctx.session.data.session?.user as User;
      const updatedUsername = await ctx.supabase
        .from('users')
        .update(input)
        .eq('id', user.id);
      if (updatedUsername.error) {
        const message =
          updatedUsername.error.code === '23505'
            ? 'Username already exists. Please try another one.'
            : updatedUsername.error?.message;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: message || 'Error while updating username',
        });
      }
      return true;
    }),
  globalSearch: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const items: Record<string, { title: string; link: string }[]> = {};
      // models
      const models = await ctx.supabase
        .from('swarms_cloud_models')
        .select('*')
        .ilike('name', `%${input}%`);

      if (models.data) {
        items['Models'] = models.data.map((model) => ({
          title: model.name || '',
          link: makeUrl(PUBLIC.MODEL, { slug: model.slug }),
        }));
      }

      //reviews - get agents & prompts with best reviews
      const reviews = await ctx.supabase
        .from('swarms_cloud_reviews')
        .select('model_id, model_type, rating')
        .in('model_type', ['agent', 'prompt'])
        .order('created_at', { ascending: false });

      if (reviews.data) {
        const modelRatings: Record<
          string,
          { modelRating: number; reviewLength: number }
        > = {};

        reviews.data?.forEach((review) => {
          const key = `${review?.model_id}-${review?.model_type}`;
          if (!modelRatings[key]) {
            modelRatings[key] = { modelRating: 0, reviewLength: 0 };
          }
          modelRatings[key].modelRating += review?.rating || 0;
          modelRatings[key].reviewLength += 1;
        });

        const averageRatings = Object.keys(modelRatings).map((key) => {
          const lastHyphenIndex = key.lastIndexOf('-');
          const id = key.substring(0, lastHyphenIndex);
          const type = key.substring(lastHyphenIndex + 1);

          const { modelRating, reviewLength } = modelRatings[key];

          return {
            id,
            type,
            modelRating: modelRating / reviewLength,
          };
        });

        const topRatedModels = averageRatings
          ?.sort((a, b) => b?.modelRating - a?.modelRating)
          ?.slice(0, 10);

        //Agents || Prompts
        const modelDetails = await Promise.all(
          topRatedModels.map((model) =>
            ctx.supabase
              .from(
                model.type === 'agent'
                  ? 'swarms_cloud_agents'
                  : 'swarms_cloud_prompts',
              )
              .select('id, name, search_type')
              .eq('id', model.id)
              .single(),
          ),
        );

        modelDetails.forEach((modelDetail) => {
          if (modelDetail?.data) {
            const type =
              modelDetail.data?.search_type === 'agent' ? 'Agents' : 'Prompts';
            if (!items[type]) items[type] = [];
            items[type].push({
              title: modelDetail.data?.name || '',
              link: makeUrl(type === 'Agents' ? PUBLIC.AGENT : PUBLIC.PROMPT, {
                id: modelDetail.data?.id,
              }),
            });
          }
        });
      }

      return items;
    }),
});

export default mainRouter;
