import {
  publicProcedure,
  router,
  userProcedure,
} from '@/app/api/trpc/trpc-router';
import { PLATFORM, PUBLIC } from '@/shared/constants/links';
import { isValidEmail, makeUrl } from '@/shared/utils/helpers';
import mailer from '@/shared/utils/mailer';
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

      if (user_data.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while fetching user data',
        });
      }

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
  subscribeNewsletter: userProcedure
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.data.session?.user as User;

      const email = input.email;
      if (!isValidEmail(email)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid email address',
        });
      }

      //check if email already exists
      const existingEmail = await ctx.supabase
        .from('swarms_newsletter_subscribers')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (existingEmail.data?.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email already exists',
        });
      }

      //check if user is already signed up
      const existingUser = await ctx.supabase
        .from('swarms_newsletter_subscribers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_subscribed', true)
        .limit(1);

      if (existingUser.data?.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User has already subscribed to newsletter',
        });
      }

      const mail = mailer();
      const html = `Sending you my email(${email}) to show interest in signing up to your newsletter`;

      try {
        const sendEmail = await mail.sendMail({
          from: email,
          to: `kye@apac.ai`,
          subject: 'Accepted invitation to subscribe to Newsletter',
          html,
        });
        if (!sendEmail) {
          throw new Error('Failed to send email');
        }

        await ctx.supabase
          .from('swarms_newsletter_subscribers')
          .insert({ email, user_id: user.id, is_subscribed: true });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: (error as Error).message,
        });
      }
    }),
  getSubscribedNewsletter: userProcedure.query(async ({ ctx }) => {
    const user = ctx.session.data.session?.user as User;
    const subscribed = await ctx.supabase
      .from('swarms_newsletter_subscribers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_subscribed', true)
      .limit(1);

    if (subscribed.error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while fetching subscribed user',
      });
    }

    return subscribed.data?.length ? true : false;
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
