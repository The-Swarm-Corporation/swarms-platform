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
const mainRouter = router({
  getUser: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user;
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }
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
            ? "Username already exists. Please try another one."
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
      // swarms
      //TODO: Setup should be for *Accepted Swarms* only
      const swarms = await ctx.supabase
        .from('swarms_cloud_user_swarms')
        .select('*')
        .ilike('name', `%${input}%`);

      if (swarms.data) {
        items['Swarms'] = swarms.data.map((swarm) => ({
          title: swarm.name || '',
          link: makeUrl(PUBLIC.SWARM, { name: swarm.name }),
        }));
      }

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
      // check synthify swarm , equal to like in sql
      const synthifySwarm = {
        title: 'Synthify',
        link: PLATFORM.EXPLORER,
      };
      if (synthifySwarm.title.toLowerCase().includes(input.toLowerCase())) {
        items['Swarms'] = [...(items['Swarms'] || []), synthifySwarm];
      }

      return items;
    }),
});

export default mainRouter;
